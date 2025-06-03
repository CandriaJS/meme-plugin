import fs from 'node:fs/promises'

import { db, imageTool } from '#models'

import { get_base_url } from './common.js'
import { preset } from './preset.js'
import Request from './request.js'

/**
 * 异步判断文件是否存在
 * @param {string} path
 * @returns {Promise<boolean>} 是否存在，true存在，false不存在
 */
export async function exists (path) {
  try {
    await fs.access(path)
    return true
  } catch (e) {
    return false
  }
}


/** 初始化数据 */
export async function init () {
  await update_meme()
  await update_preset()
}

/**
 * 更新表情数据
 * @param {boolean} force 是否强制更新
 * @returns 初始化结果
 */
export async function update_meme (force = false) {
  try {
    const keys = await get_meme_all_keys()
    if (keys && keys.length > 0 && !force) return
    const url = await get_base_url()
    const res = await Request.get(`${url}/meme/infos`)
    if (!res.success) throw new Error(res.msg)
    if (res.data && Array.isArray(res.data)) {
      await Promise.all(res.data.map(meme => {
        const {
          key,
          keywords: keyWords,
          params: {
            min_texts,
            max_texts,
            min_images,
            max_images,
            default_texts,
            options
          },
          tags
        } = meme

        return add_meme({
          key,
          keyWords: keyWords?.length ? keyWords : null,
          min_texts,
          max_texts,
          min_images,
          max_images,
          default_texts: default_texts?.length ? default_texts : null,
          options: options?.length ? options : null,
          tags: tags?.length ? tags : null
        }, {
          force
        })
      }))
    }
  } catch (error) {
    logger.error(`初始化表情数据失败: ${error}`)
  }
}

/**
 * 更新预设数据
 * @param {boolean} force 是否强制更新
 * @returns 初始化结果
 */
export async function update_preset (force = false) {
  try {
    const keys = await get_preset_all_keys()
    if (keys && keys.length > 0 && !force) return
    await Promise.all(
      preset.map(async (preset) => {
        const memeExists = await db.meme.get(preset.key)
        if (!memeExists && !force) return
        await db.preset.add({
          name: preset.name,
          key: preset.key,
          option_name: preset.option_name,
          option_value: preset.option_value
        }, {
          force
        })
      })
    )
  } catch (error) {
    logger.error(`初始化预设数据失败: ${error}`)
  }
}

/**
 * 添加表情
 * @param data 表情数据
 * - key 表情的唯一标识符
 * - keyWords 表情的关键词列表
 * - min_texts 表情最少的文本数
 * - max_texts 表情最多的文本数
 * - min_images 表情最少的图片数
 * - max_images 表情最多的图片数
 * - default_texts 表情的默认文本列表
 * - options 表情的参数类型
 * - tags 表情的标签列表
 * @param force 是否强制更新
 * @returns 添加结果
 */
export async function add_meme ({
  key,
  keyWords,
  min_texts,
  max_texts,
  min_images,
  max_images,
  default_texts,
  options,
  tags
}, {
  force = false
}) {
  const data = {
    key,
    keyWords,
    min_texts,
    max_texts,
    min_images,
    max_images,
    default_texts,
    options,
    tags
  }
  return await db.meme.add(data, { force })
}

/**
 * 获取所有预设的键值信息
 * @returns {Promise<string[] | null>} 键值信息列表
 */
export async function get_preset_all_keys () {
  const res = await db.preset.getAll()
  return res.map(preset => preset.key).flat() ?? null
}

/**
 * 获取所有预设表情的关键词信息
  * @returns {Promise<string[] | null>} 关键词信息列表
 */
export async function get_preset_all_keywords () {
  const res = await db.preset.getAll()
  return res.map(preset => preset.name).flat() ?? null
}

/**
 * 通过关键词获取预设表情的键值
 * @param keyword 关键词
 * @returns 键值
 */
export async function get_preset_key (keyword) {
  const res = await get_preset_info_by_keyword(keyword)
  if (!res) return null
  return res.key
}

/**
 * 通过表情的键值获取预设表情的关键词
 * @param key 表情的唯一标识符
 * @returns 预设表情信息
 */
export async function get_preset_keyword (key) {
  const res = await db.preset.getAll()
  const filteredOptions = res
    .filter(preset => preset.key === key)
    .map(preset => preset.name)
  return filteredOptions.length > 0 ? filteredOptions : null
}
/**
 * 获取指定的预设表情信息
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<PresetModel | null>} 预设表情信息
 */
export async function get_preset_info (key) {
  return await db.preset.get(key)
}

/**
 * 通过关键词获取预设表情信息
 * @param keyword 表情关键词
 * @returns 预设表情信息
 */
export async function get_preset_info_by_keyword (keyword) {
  return await db.preset.getByKeyWord(keyword)
}

/**
* 获取所有相关预设表情的键值
* @param keyword 表情的关键词
* @returns 所有相关预设表情的键值列表
*/
export async function get_preset_all_about_keywords (keyword) {
  const res = await db.preset.getByKeyWordAbout(keyword)
  return res.map(preset => preset.name).flat() ?? null
}

/**
* 获取所有相关预设表情的关键词
* @param key 表情的唯一标识符
* @returns 所有相关预设表情的键值列表
*/
export async function get_preset_all_about_keywords_by_key (key) {
  const res = await db.preset.getAbout(key)
  return res.map(preset => preset.name).flat() ?? null
}

/**
 * 获取所有表情的键值信息
 * @returns 键值信息列表
 */
export async function get_meme_all_keys () {
  const res = await db.meme.getAll()
  return res.map(meme => meme.key).flat() ?? null
}

/**
 * 通过关键词获取表情键值
 * @param {string} keyword 表情关键词
 * @returns {Promise<string | null>} 表情键值
 */
export async function get_meme_key_by_keyword (keyword) {
  const res = await get_meme_info_by_keyword(keyword)
  if (!res) return null
  return res.key
}

/**
 * 通过键值获取表情的标签信息
 * @param {string} tag 表情的tag
 * @returns 表情的标签信息
 */
export async function get_meme_key_by_tag (tag) {
  const res = await db.meme.getByTag(tag)
  if (!res) return null
  return JSON.parse(String(res.key))
}

/**
 * 获取所有所有相关表情的键值
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<string[] | null>} 所有相关表情的键值列表
 */
export async function get_meme_keys_by_about (key) {
  const res = await db.meme.getKeysByAbout(key)
  return res.map(meme => meme.key).flat() ?? null
}

/**
 * 获取所有所有相关表情的键值
 * @param {string} tag 表情的标签
 * @returns 所有相关表情的键值列表
 */
export async function get_meme_keys_by_about_tag (tag) {
  const res = await db.meme.getTagsByAbout(tag)
  return res.map(meme => meme.key).flat() ?? null
}

/**
 * 获取所有表情的关键词信息
 * @returns {Promise<string[] | null> } 关键词信息列表
 */
export async function get_meme_all_keywords () {
  const res = await db.meme.getAll()
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}

/**
 * 通过键值获取表情的关键词信息
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<string[] | null> } 表情的关键词信息
 */
export async function get_meme_keyword (key) {
  const res = await get_meme_info(key)
  if (!res) return null
  return JSON.parse(String(res.keyWords))
}

/**
 * 通过关键词获取表情的标签信息
 * @param {string} tag 表情的标签
 * @returns 表情的标签信息
 */
export async function get_meme_keyword_by_tag (tag) {
  const res = await db.meme.getByTag(tag)
  if (!res) return null
  return JSON.parse(String(res.keyWords))
}

/**
 * 获取所有相关表情的关键词信息
 * @param {string} keyword 表情关键词
 * @returns {Promise<string[] | null>} 所有相关表情的关键词列表
 */
export async function get_meme_keywords_by_about (keyword) {
  const res = await db.meme.getKeyWordsByAbout(keyword)
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}

/**
 * 获取所有相关表情的关键词信息
 * @param {string} tag 表情的标签
 * @returns 所有相关表情的关键词列表
 */
export async function get_meme_keywords_by_about_tag (tag) {
  const res = await db.meme.getTagsByAbout(tag)
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}

/**
 * 获取所有表情的标签信息
 * @returns 标签信息列表
 */
export async function get_meme_all_tags () {
  const res = await db.meme.getAll()
  return res.map((item) => JSON.parse(String(item.tags))).flat() ?? null
}
/**
 * 获取表情信息
 * @param {string} key 表情唯一标识符
 * @returns {Promise<Model | null>} 表情信息
 */
export async function get_meme_info (key) {
  return await db.meme.get(key) ?? null
}

/**
 * 通过关键词获取表情信息
 * @param {string} keyword 表情关键词
 * @returns {Promise<Model | null> } 表情信息
 */
export async function get_meme_info_by_keyword (keyword) {
  return await db.meme.getByKeyWord(keyword) ?? null
}

/**
 * 上传图片
 * @param {Buffer | string} image 图片数据
 * @param {'url' | 'path' | 'data'} type 上传的图片类型
 * - url 图片的网络地址
 * - path 图片的本地路径
 * - data 图片的base64数据
 * @param {Record<string, string>} headers  请求头，仅在type为url时生效
 * @returns {Promise<string>} image_id 图片的唯一标识符
 */
export async function upload_image (
  image,
  type = 'url',
  headers
) {
  try {
    const url = await get_base_url()
    let data
    switch (type) {
      case 'url':
        data = {
          type: 'url',
          url: image,
          ...(headers && { headers })
        }
        break
      case 'path':
        data = {
          type: 'path',
          path: image
        }
        break
      case 'data':
        data = {
          type: 'data',
          data: Buffer.isBuffer(image) ? image.toString('base64') : image
        }
        break
    }
    const res = await Request.post(`${url}/image/upload`, data, {}, 'json')
    if (!res.success) throw new Error('图片上传失败')
    return res.data.image_id
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}
/**
 * 获取表情预览地址
 * @param {string} key 表情唯一标识符
 * @returns {Promise<Buffer>} 表情数据
 */
export async function get_meme_preview (key) {
  try {
    const url = await get_base_url()
    const res = await Request.get(`${url}/memes/${key}/preview`)
    if (!res.success) throw new Error(res.msg)
    const image = await imageTool.get_image(res.data.image_id)
    return image
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}

/**
 * 生成表情图片
 * @param {string} memekey 表情唯一标识符
 * @param {any} data 表情数据
 * @returns {Promise<Buffer>} 表情图片数据
 */
export async function make_meme (memekey, data) {
  try {
    const url = await get_base_url()
    const res = await Request.post(`${url}/memes/${memekey}`, data, null, 'json')
    if (!res.success) {
      throw new Error(res.msg)
    }
    const image = await imageTool.get_image(res.data.image_id)
    if (!image) throw new Error('获取图片失败')
    return image
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}

/**
 * 向指定的群或好友发送文件
 * @param type 发送的类型
 * - group 为群
 * - private 为好友
 * @param botId 机器人的id
 * @param id 群或好友的id
 * @param file 文件路径
 * @param name 文件名称
 * @returns 发送结果
 */
export async function send_file (type, botId, id, file, name) {
  try {
    const bot = Bot[botId]
    if (type === 'group') {
      await bot.pickGroup(id).fs.upload(file, '/', name)
    } else if (type === 'private') {
      await bot.pickFriend(id).sendMsg([ segment.file(file, name) ])
    } else {
      throw new Error('type 必须为 group 或 private')
    }
  } catch (error) {
    throw new Error(`向${type === 'group' ? '群' : '好友'} ${id} 发送文件失败: ${error.message}`)
  }
}