import fs from 'node:fs/promises'

import { Config, Data, Version } from '#components'

import { db } from '../index.js'
import Request from './request.js'

const Common = {
  /**
   * 检查指定的文件是否存在
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>} - 如果文件存在返回 true，否则返回 false
   */
  async fileExistsAsync (filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  },

  /**
   * 判断是否在海外环境
   * @returns {Promise<boolean>} - 如果在海外环境返回 true，否则返回 false
   * @throws {Error} - 如果获取 IP 位置失败，则抛出异常
   */
  async isAbroad () {
    const urls = [
      'https://blog.cloudflare.com/cdn-cgi/trace',
      'https://developers.cloudflare.com/cdn-cgi/trace'
    ]

    try {
      const response = await Promise.any(urls.map(url => Request.get(url, {}, {}, 'text')))
      const traceMap = Object.fromEntries(
        response.data.split('\n').filter(line => line).map(line => line.split('='))
      )
      return traceMap.loc !== 'CN'
    } catch (error) {
      throw new Error(`获取 IP 所在地区出错: ${error.message}`)
    }
  },

  /**
   * 获取图片 Buffer
   * @param {string | Buffer} image - 图片地址或 Buffer
   * @returns {Promise<Buffer>} - 返回图片的 Buffer 数据
   * @throws {Error} - 如果图片地址为空或请求失败，则抛出异常
   */
  async getImageBuffer (image) {
    if (!image) throw new Error('图片地址不能为空')

    if (Buffer.isBuffer(image)) {
      return image
    }

    const response = await Request.get(image, {}, {}, 'arraybuffer')
    if (response.success) {
      return response.data
    } else {
      throw new Error('图片请求失败')
    }
  },

  /**
   * 获取图片 Base64 字符串
   * @param {string | Buffer} image - 图片的 URL、Buffer 或 Base64 字符串
   * @param {boolean} [withPrefix=false] - 是否添加 `base64://` 前缀
   * @returns {Promise<string>} - 返回 Base64 编码的图片字符串，可能包含 `base64://` 前缀
   * @throws {Error} - 如果图片地址为空或处理失败，则抛出异常
   */
  async getImageBase64 (image, withPrefix = false) {
    if (!image) {
      logger.error('图片地址不能为空')
    }

    if (typeof image === 'string' && image.startsWith('base64://')) {
      return withPrefix ? image : image.replace('base64://', '')
    }

    if (Buffer.isBuffer(image)) {
      const base64Data = image.toString('base64')
      return withPrefix ? `base64://${base64Data}` : base64Data
    }

    const response = await Request.get(image, {}, {}, 'arraybuffer')
    if (response.success) {
      const buffer = response.data
      const base64Data = Buffer.from(buffer).toString('base64')
      return withPrefix ? `base64://${base64Data}` : base64Data
    } else {
      logger.error(`图片处理失败, 错误信息: ${response.message}`)
    }
  },
  /**
   * 获取用户头像
   * @param {object} e - 消息事件对象
   * @param {string | string[]} userList - 单个或多个 QQ 号
   * @returns {Promise<Buffer[]>} - 返回头像 Buffer 数组
   * @throws {Error} - 如果用户列表为空或头像获取失败，则抛出异常
   */
  async getAvatar (e, userList) {
    if (!userList) {
      throw new Error('QQ 号不能为空')
    }
    if (!Array.isArray(userList)) userList = [ userList ]

    const cacheDir = `${Version.Plugin_Path}/data/avatar`

    if (Config.meme.cache && !await this.fileExistsAsync(cacheDir)) {
      await Data.createDir('data/avatar', '', false)
    }

    /**
     * 下载用户头像
     * @param {string} qq - QQ 号
     * @returns {Promise<Buffer>} - 返回头像 Buffer
     */
    const downloadAvatar = async (qq) => {
      const avatarUrl = await this.getAvatarURL(e, qq)

      if (!Config.meme.cache) {
        const response = await Request.get(avatarUrl, {}, {}, 'arraybuffer')
        if (response.success) {
          return response.data
        } else {
          throw new Error(`下载头像失败: ${avatarUrl}`)
        }
      }

      const cachePath = `${cacheDir}/avatar_${qq}.png`

      if (await this.fileExistsAsync(cachePath)) {
        const localStats = await fs.stat(cachePath)
        const remoteHeadResponse = await Request.head(avatarUrl).catch(() => null)

        if (remoteHeadResponse && remoteHeadResponse.success) {
          const remoteLastModified = new Date(remoteHeadResponse.data['last-modified'])
          const localLastModified = localStats.mtime

          if (localLastModified >= remoteLastModified) {
            return await fs.readFile(cachePath)
          }
        }
      }

      const bufferResponse = await Request.get(avatarUrl, {}, {}, 'arraybuffer')
      if (bufferResponse.success) {
        const buffer = bufferResponse.data
        await fs.writeFile(cachePath, buffer)
        return buffer
      } else {
        throw new Error(`下载头像失败: ${avatarUrl}`)
      }
    }

    try {
      return await Promise.all(userList.map((qq) => downloadAvatar(qq)))
    } catch (err) {
      logger.error(`获取头像失败: ${err}`)
      return null
    }
  },
  /**
   * 获取图片列表（包括消息和引用消息中的图片）
   * @param {object} e - 消息对象
   * @returns {Promise<Buffer[]>} - 返回图片 Buffer 数组
   */
  async getImage (e) {
    const imagesInMessage = e.message
      .filter((m) => m.type === 'image')
      .map((img) => img.url)

    const tasks = []

    /**
       * 获取引用消息中的图片
       */
    let quotedImages = []
    let source = null
    if (Config.meme.quotedImages) {
      if (e.reply_id) {
        source = await e.getReply()
      } else if (e.source) {
        if (e.isGroup) {
          source = await Bot[e.self_id].pickGroup(e.group_id).getChatHistory(e.source.seq || e.reply_id, 1)
        } else if (e.isPrivate) {
          source = await Bot[e.self_id].pickFriend(e.user_id).getChatHistory(e.source.time || e.reply_id, 1)
        }
      }
    }

    if (source) {
      const sourceArray = Array.isArray(source) ? source : [ source ]

      quotedImages = sourceArray
        .flatMap(item => item.message)
        .filter(msg => msg.type === 'image')
        .map(img => img.url)
    }

    /**
     * 如果没有引用消息中的图片，且消息中没有图片，则获取引用消息的发送者头像
     */
    if (
      quotedImages.length === 0 &&
      imagesInMessage.length === 0 &&
      source &&
      (e.source || e.reply_id)) {
      const sourceArray = Array.isArray(source) ? source : [ source ]
      const quotedUser = sourceArray[0].sender.user_id
      const avatarBuffer = await this.getAvatar(e, quotedUser)
      if (avatarBuffer[0]) {
        quotedImages.push(avatarBuffer[0])
      }
    }

    /**
       * 引用消息中的图片任务
       */
    if (quotedImages.length > 0) {
      quotedImages.forEach((item) => {
        if (Buffer.isBuffer(item)) {
          tasks.push(Promise.resolve(item))
        } else {
          tasks.push(this.getImageBuffer(item))
        }
      })
    }

    /**
       * 消息中的图片任务
       */
    if (Config.meme.imagesInMessage) {
      if (imagesInMessage.length > 0) {
        tasks.push(...imagesInMessage.map((imageUrl) => this.getImageBuffer(imageUrl)))
      }
    }

    const results = await Promise.allSettled(tasks)
    const images = results
      .filter((res) => res.status === 'fulfilled' && res.value)
      .map((res) => res.value)
    return images
  },

  /**
   * 获取用户头像 URL
   * @param {object} e - 消息事件对象
   * @param {string} qq - QQ 号
   * @returns {Promise<string>} - 返回头像 URL
   */
  async getAvatarURL (e, qq) {
    if (!qq || !e) {
      throw new Error('QQ 号不能为空')
    }

    let avatarUrl = ''

    try {
      if (e.isGroup) {
        const member = this.e.bot.pickMember(e.group_id, qq)
        avatarUrl = await member.getAvatarUrl()
      } else if (e.isPrivate) {
        const friend = this.e.bot.pickFriend(qq)
        avatarUrl = await friend.getAvatarUrl()
      }
    } catch (err) {
    }

    return avatarUrl || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${qq}`
  },

  /**
   * 获取用户昵称
   * @param {object} e - 消息事件对象
   * @param {string} qq - QQ 号
   * @returns {Promise<string>} - 返回用户昵称，若获取失败则返回 "未知"
   */
  async getNickname (e, qq) {
    if (!qq || !e) return '未知'

    try {
      if (e.isGroup) {
        const member = Bot[e.self_id].pickMember(e.group_id, qq)
        const memberInfo = await member.getInfo()
        return memberInfo.card || memberInfo.nickname || '未知'
      } else if (e.isPrivate) {
        const friend = Bot[e.self_id].pickFriend(qq)
        const friendInfo = await friend.getInfo()
        return friendInfo.nickname || '未知'
      }
    } catch {
      return '未知'
    }
  },

  /**
   * 获取用户性别
   * @param {object} e - 消息事件对象
   * @param {string} qq - QQ 号
   * @returns {Promise<string>} - 返回 'male'、'female' 或 'unknown'
   */
  async getGender (e, qq) {
    if (!qq || !e) return 'unknown'

    try {
      if (e.isGroup) {
        const member = Bot[e.self_id].pickMember(e.group_id, qq)
        const memberInfo = await member.getInfo()
        return memberInfo.sex || 'unknown'
      } else if (e.isPrivate) {
        const friend = Bot[e.self_id].pickFriend(qq)
        const friendInfo = await friend.getInfo()
        return friendInfo.sex || 'unknown'
      }
    } catch {
      return 'unknown'
    }
  },

  /**
   * 统计相关操作
   * @param {string} key - 统计项键名
   * @param {number} number - 统计数值
   * @returns {Promise<number|null>} - 返回更新后的统计数值或 null
   */
  async addStat (key, number) {
    return await db.stat.add(key, number) || null
  },

  async getStat (key) {
    return await db.stat.get(key, 'all') || null
  },

  async getStatAll () {
    return await db.stat.getAll() || null
  }
}

export { Common }
