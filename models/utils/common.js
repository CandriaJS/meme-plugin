import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { Config, Version } from '#components'
import { server } from '#models'

import Request from './request.js'
import { exists } from './tools.js'
/**
 * 获取图片 Buffer
 * @param {string | Buffer} image - 图片地址或 Buffer
 * @returns {Promise<Buffer>} - 返回图片的 Buffer 数据
 * @throws {Error} - 如果图片地址为空或请求失败，则抛出异常
 */
export async function getImageBuffer (image) {
  try {
    if (!image) throw new Error('图片地址不能为空')

    if (Buffer.isBuffer(image)) {
      return image
    }

    const response = await Request.get(image, null, null, 'arraybuffer')
    if (!response.success) {
      throw new Error(response.msg)
    }
    return response.data
  } catch (error) {
    logger.error(`获取图片Buffer失败: ${error.message}`)
  }
}

/**
 * 获取图片 Base64 字符串
 * @param {string | Buffer} image - 图片的 URL、Buffer 或 Base64 字符串
 * @returns {Promise<string>} - 返回 Base64 编码的图片字符串，可能包含 `base64://` 前缀
 * @throws {Error} - 如果图片地址为空或处理失败，则抛出异常
 */
export async function getImageBase64 (image) {
  try {
    if (!image) {
      logger.error('图片地址不能为空')
    }

    if (typeof image === 'string' && !(/^https?:\/\//i.test(image))) return image

    if (Buffer.isBuffer(image)) {
      return image.toString('base64')
    }

    const buffer = await getImageBuffer(image)
    return buffer.toString('base64')
  } catch (error) {
    logger.error(`获取图片Base64失败: ${error.message}`)
  }
}

/**
 * 获取基础 URL
 * @returns {Promise<string>} 基础 URL
 */
export async function get_base_url () {
  try {
    let base_url
    if (!Config.server.url && !(Config.server.mode === 1))
      throw new Error('请先使用未配置表情包API或使用本地服务')
    switch (Number(Config.server.mode)) {
      case 0:
        base_url = Config.server.url.replace(/\/+$/, '')
        break
      case 1: {
        const resources_path = path.join(
          os.homedir(),
          '.meme_generator',
          'resources'
        )
        if (!(await exists(resources_path))) {
          throw new Error('请先使用[#柠糖表情下载表情服务端资源]')
        }
        base_url = `http://127.0.0.1:${Config.server.port}`
        break
      }
      default:
        throw new Error('请检查服务器模式')
    }

    return Promise.resolve(base_url)
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}

/**
 * 异步判断是否在海外环境
 * @returns {Promise<boolean>} 如果在海外环境返回 true，否则返回 false
 */
export async function isAbroad () {
  const urls = [
    'https://blog.cloudflare.com/cdn-cgi/trace',
    'https://developers.cloudflare.com/cdn-cgi/trace',
    'https://hostinger.com/cdn-cgi/trace',
    'https://ahrefs.com/cdn-cgi/trace'
  ]

  try {
    const responses = await Promise.all(
      urls.map((url) => Request.get(url, null, null, 'text'))
    )
    const traceTexts = responses.map((res) => res.data).filter(Boolean)
    const traceLines = traceTexts
      .flatMap((text) => text.split('\n').filter((line) => line))
      .map((line) => line.split('='))

    const traceMap = Object.fromEntries(traceLines)
    return traceMap.loc !== 'CN'
  } catch (error) {
    throw new Error(`获取 IP 所在地区出错: ${error.message}`)
  }
}

/**
 * 获取用户头像
 * @param {Message} e 消息事件
 * @param {string}userId 用户ID
 * @param {'url' | 'base64'}type 返回类型 url 或 base64
 * @returns {Promise<{userId:string,avatar:string} | null>}用户头像
 */

export async function get_user_avatar (e, userId, type = 'url') {
  try {
    if (!e) throw new Error('消息事件不能为空')
    if (!userId) throw new Error('用户ID不能为空')

    const getAvatarUrl = async (e, userId) => {
      let avatarUrl

      try {
        if (e.isGroup) {
          const member = e.bot.pickMember(e.group_id, userId)
          avatarUrl = await member.getAvatarUrl()
        } else if (e.isPrivate) {
          const friend = e.bot.pickFriend(userId)
          avatarUrl = await friend.getAvatarUrl()
        }
      } catch (err) {}
      if (!avatarUrl) {
        throw new Error(`获取用户头像地址失败: ${userId}`)
      }
      return avatarUrl
    }

    const avatarDir = path.join(Version.Plugin_Path, 'data', 'avatar')
    const cachePath = path.join(avatarDir, `${userId}.png`).replace(/\\/g, '/')

    if (
      Config.meme.cache &&
      Number(Config.server.mode) === 1 &&
      (await exists(cachePath))
    ) {
      const avatarUrl = await getAvatarUrl(e, userId)
      if (!avatarUrl) throw new Error(`获取用户头像失败: ${userId}`)
      const headRes = await Request.head(avatarUrl)
      const lastModified = headRes.data['last-modified']
      const cacheStat = await fs.stat(cachePath)

      if (new Date(lastModified) <= cacheStat.mtime) {
        switch (type) {
          case 'base64': {
            const data = await fs.readFile(cachePath)
            if (!data) throw new Error(`通过缓存获取用户头像失败: ${userId}`)
            return {
              userId,
              avatar: data.toString('base64')
            }
          }
          case 'url':
          default:
            return {
              userId,
              avatar: cachePath
            }
        }
      }
    }

    const avatarUrl = await getAvatarUrl(e, userId)
    if (!avatarUrl) throw new Error(`获取用户头像失败: ${userId}`)

    if (
      Config.meme.cache &&
      Number(Config.server.mode) === 1 &&
      !(await exists(avatarDir))
    ) {
      await fs.mkdir(avatarDir)
    }

    const res = await Request.get(avatarUrl, null, null, 'arraybuffer')
    const avatarData = res.data

    if (Config.meme.cache && Number(Config.server.mode) === 1) {
      await fs.writeFile(cachePath, avatarData)
    }

    switch (type) {
      case 'base64':
        return {
          userId,
          avatar: avatarData.toString('base64')
        }
      case 'url':
      default:
        return {
          userId,
          avatar:
            Config.meme.cache && Number(Config.server.mode) === 1
              ? cachePath
              : avatarUrl
        }
    }
  } catch (error) {
    logger.error(error)
    return null
  }
}

/**
 * 获取用户昵称
 * @param {Message} e 消息事件
 * @param {string} userId 用户 ID
 * @returns 用户昵称
 */
export async function get_user_name (e, userId) {
  try {
    if (!e) throw new Error('消息事件不能为空')
    if (!userId) throw new Error('用户ID不能为空')
    userId = String(userId)
    let nickname
    let userInfo
    if (e.isGroup) {
      const memberInfo = Bot[e.self_id].pickMember(e.group_id, userId)
      try {
        userInfo = await memberInfo.getInfo()
      } catch (error) {
        userInfo = memberInfo.info
      }
      nickname = userInfo.card?.trim() || userInfo.nickname?.trim() || null
    } else if (e.isPrivate) {
      const friendInfo = Bot[e.self_id].pickFriend(userId)
      try {
        userInfo = await friendInfo.getInfo()
      } catch (error) {
        userInfo = friendInfo.info
      }
      nickname = userInfo.nickname.trim() ?? null
    } else {
      nickname = e.sender.nickname.trim() ?? null
    }
    if (!nickname) throw new Error('获取用户昵称失败')
    return nickname
  } catch (error) {
    logger.error(`获取用户昵称失败: ${error}`)
    return '未知'
  }
}

/**
 * 获取图片
 * @param {Message} e 消息事件
 * @param {'url' | 'base64'} type 返回类型 url 或 base64
 * @returns {Promise<Array<{userId: string, image: string}>>} 图片数组信息
 */
export async function get_image (e, type = 'url') {
  if (!e) throw new Error('消息事件不能为空')
  const imagesInMessage = e.message
    .filter((m) => m.type === 'image')
    .map((img) => ({
      userId: e.sender.user_id,
      url: img.url
    }))

  const replyId = e.reply_id ?? e.message.find((m) => m.type === 'reply')?.id

  const tasks = []

  let quotedImages = []
  let source = null
  if (e.getReply) {
    source = await e.getReply()
  } else if (replyId) {
    if (e.isGroup) {
      source = await Bot[e.self_id]
        .pickGroup(e.group_id)
        .getChatHistory(e.source.seq || replyId, 1)
    } else if (e.isPrivate) {
      source = await Bot[e.self_id]
        .pickFriend(e.user_id)
        .getChatHistory(Math.floor(Date.now() / 1000), 1)
    }
  }

  /**
   * 提取引用消息中的图片
   */
  if (source) {
    const sourceArray = Array.isArray(source) ? source : [ source ]

    quotedImages = sourceArray.flatMap(({ message, sender }) =>
      message
        .filter((element) => element.type === 'image')
        .map((element) => ({
          userId: sender.user_id,
          url: element.url
        }))
    )
  }

  /**
   * 处理引用消息中的图片
   */
  if (quotedImages.length > 0) {
    const quotedImagesPromises = quotedImages.map(async (item) => {
      switch (type) {
        case 'base64':
          return {
            userId: item.userId,
            image: await getImageBase64(item.url)
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.url.toString()
          }
      }
    })
    tasks.push(...quotedImagesPromises)
  }

  /**
   * 处理消息中的图片
   */
  if (imagesInMessage.length > 0) {
    const imagePromises = imagesInMessage.map(async (item) => {
      switch (type) {
        case 'base64':
          return {
            userId: item.userId,
            image: await getImageBase64(item.url)
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.url.toString()
          }
      }
    })
    tasks.push(...imagePromises)
  }

  const results = await Promise.allSettled(tasks)
  const images = results
    .filter((res) => res.status === 'fulfilled' && Boolean(res.value))
    .map((res) => res.value)

  return images
}
