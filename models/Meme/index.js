import { Config } from '#components'
import { Utils } from '#models'

import { handle, handleArgs } from './args.js'
import { handleImages } from './images.js'
import { preset } from './preset.js'
import { handleTexts } from './texts.js'

/**
 * 生成表情包
 * @param {Object} e 事件对象
 * @param {string} memeKey 表情模板标识
 * @param {number} min_texts 最小文字数量
 * @param {number} max_texts 最大文字数量
 * @param {number} min_images 最小图片数量
 * @param {number} max_images 最大图片数量
 * @param {string[]} default_texts 默认文字数组
 * @param {string} args_type 参数类型
 * @param {string} userText 用户输入文本
 * @param {boolean} isArg 是否为参数模式
 * @param {object} Arg 参数模式下的参数
 * @returns {Promise<string>} 生成的表情包图片base64 数据
 */
async function make (
  e,
  memeKey,
  min_texts,
  max_texts,
  min_images,
  max_images,
  default_texts,
  args_type,
  userText,
  isPreset = false,
  { Preset } = {}
) {
  const formData = new FormData()
  let quotedUser
  let source = null
  if (e.reply_id) {
    source = await e.getReply()
  } else if (e.source) {
    if (e.isGroup) {
      source = await Bot[e.self_id].pickGroup(e.group_id).getChatHistory(e.source.seq, 1)
    } else if (e.isPrivate) {
      source = await Bot[e.self_id].pickFriend(e.user_id).getChatHistory(e.source.time, 1)
    }
  }
  if (source) {
    const sourceArray = Array.isArray(source) ? source : [ source ]
    quotedUser = sourceArray[0].sender.user_id.toString()
  }
  const allUsers = [
    ...new Set([
      ...e.message
        .filter(m => m?.type === 'at')
        .map(at => at?.qq?.toString() ?? ''),
      ...[ ...userText.matchAll(/@\s*(\d+)/g) ].map(match => match[1] ?? '')
    ])
  ].filter(id => id && id !== quotedUser)

  if (userText) {
    userText = userText.replace(/@\s*\d+/g, '').trim()
  } else {
    userText = ''
  }


  try {
    /**
     * 处理参数类型
     */
    if (args_type !== null) {
      const args = await handleArgs(e, memeKey, userText, allUsers, formData, isPreset, Preset)
      if (!args.success) {
        throw new Error(args.message)
      }
      userText = args.text
    }

    /**
     * 处理图片类型
     */
    if (max_images !== 0) {
      const images = await handleImages(e, memeKey, userText, min_images, max_images, allUsers, formData)
      if (!images.success) {
        throw new Error(images.message)
      }
      userText = images.userText
    }

    /**
     * 处理文字类型
     */
    if (max_texts !== 0) {
      let finalTexts = await handleTexts(e, userText, min_texts, max_texts, default_texts, allUsers, formData)
      if (!finalTexts.success) {
        throw new Error(finalTexts.message)
      }
    }

    const result = await Utils.Tools.request(memeKey, formData, 'arraybuffer')
    if (!result.success) throw new Error(result.message)
    if (Config.stat.enable) {
      const stat = await Utils.Common.getStat(memeKey)
      await Utils.Common.addStat(memeKey, stat + 1)
    }
    const base64Image = await Utils.Common.getImageBase64(result.data, true)

    return base64Image
  } catch (error) {
    logger.error(error.message)
    let errorMessage
    try {
      const parsedError = JSON.parse(error.message)
      errorMessage = parsedError.detail
    } catch (parseError) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

export { handle, handleArgs, handleImages, handleTexts, make, preset }
