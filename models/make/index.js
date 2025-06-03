import { Config } from '#components'
import { db, utils } from '#models'

import { handleImages } from './images.js'
import { handleOption } from './options.js'
import { handleTexts } from './texts.js'

export async function make_meme (
  e,
  memekey,
  min_texts,
  max_texts,
  min_images,
  max_images,
  options,
  userText,
  isPreset,
  PresetKeyWord
) {
  try {
    const getquotedUser = async (e)=> {
      let source = null
      if (e.reply_id) {
        source = await e.getReply()
      } else if (e.source) {
        if (e.isGroup) {
          source = await Bot[e.self_id].pickGroup(e.group_id).getChatHistory(e.reply_id ?? e.source.seq, 1)
        } else if (e.isPrivate) {
          source = await Bot[e.self_id].pickFriend(e.user_id).getChatHistory((Math.floor(Date.now() / 1000)), 1)
        }
      }
      if (source) {
        const sourceArray = Array.isArray(source) ? source : [ source ]
        return sourceArray[0].sender.user_id.toString()
      }
      return null
    }

    const quotedUser = await getquotedUser(e)
    const allUsers = [
      ...new Set([
        ...e.message
          .filter(m => m?.type === 'at')
          .map(at => at?.qq?.toString() ?? ''),
        ...[ ...(userText?.matchAll(/@\s*(\d+)/g) ?? []) ].map(match => match[1] ?? '')
      ])
    ].filter(id => id && id !== quotedUser)

    let formdata = {
      images: [],
      texts: [],
      options: {}
    }

    if (options) {
      const option = await handleOption(e, memekey, userText, formdata, isPreset, PresetKeyWord)
      if (!option.success) {
        throw new Error(option.message)
      }
      userText = option.text
    }

    if (min_texts > 0 && max_texts > 0) {
      const text = await handleTexts(e, memekey, min_texts, max_texts, userText, formdata)
      if (!text.success) {
        throw new Error(text.message)
      }
    }

    if (min_images > 0 && max_images > 0) {
      const image = await handleImages(e, memekey, min_images, max_images, allUsers, quotedUser, userText, formdata)
      if (!image.success) {
        throw new Error(image.message)
      }
    }
    const response = await utils.make_meme(memekey, formdata)
    const basedata = await utils.getImageBase64(response)
    if (Config.stat.enable && e.isGroup) {
      const groupStart = (await db.stat.get({
        groupId: e.group_id,
        memeKey: memekey
      }))?.count ?? 0
      await db.stat.add({
        groupId: e.group_id,
        memeKey: memekey,
        count: Number(groupStart) + 1
      })
    }
    return `base64://${basedata}`
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}
