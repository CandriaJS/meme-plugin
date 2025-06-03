import { Config } from '#components'
import { Utils } from '#models'

async function handleImages (e, memeKey, userText, min_images, max_images, allUsers, formData) {
  const messageImages = await Utils.Common.getImage(e)
  let userAvatars = []

  if (allUsers.length > 0) {
    const avatarBuffers = await Utils.Common.getAvatar(e, allUsers)
    userAvatars = avatarBuffers.filter(Boolean)
  }


  /**
   * 特殊处理：当 min_images === 1 时，因没有多余的图片，表情保护功能会失效
   */
  if (min_images === 1 && messageImages.length === 0) {
    const triggerAvatar = await Utils.Common.getAvatar(e, [ e.user_id ])
    if (triggerAvatar[0]) {
      userAvatars.push(triggerAvatar[0])
    }
  }

  if (messageImages.length + userAvatars.length < min_images) {
    const [ triggerAvatar ] = await Utils.Common.getAvatar(e, [ e.user_id ])
    if (triggerAvatar) {
      userAvatars.unshift(triggerAvatar)
    }
  }
  /** 表情保护逻辑 */
  if (Config.protect.enable) {
    const protectList = Config.protect.list
    if (protectList.length > 0) {
      /** 处理表情保护列表可能含有关键词 */
      const memeKeys = await Promise.all(protectList.map(async item => {
        const key = await Utils.Tools.getKey(item, 'meme')
        return key || item
      }))
      if (memeKeys.includes(memeKey)) {
        const masterQQArray = Array.isArray(Config.masterQQ)
          ? Config.masterQQ.map(String)
          : [ String(Config.masterQQ) ]
          /** 一遍情况下单个艾特的话主人QQ在数组索引的第0个，2个艾特的话主人QQ在数组索引的第1个 */
        const protectUser = allUsers.length === 1 ? allUsers[0] : allUsers[1]
        if (Config.protect.master) {
          if (!e.isMaster && masterQQArray.includes(protectUser)) {
            userAvatars.reverse()
          }
        } else if (Config.protect.userEnable) {
          const protectUsers = Array.isArray(Config.protect.user)
            ? Config.protect.user.map(String)
            : [ String(Config.protect.user) ]
          if (protectUsers.includes(protectUser)) {
            userAvatars.reverse()
          }
        }
      }
    }
  }


  const finalImages = [ ...userAvatars, ...messageImages ].slice(0, max_images)

  finalImages.forEach((buffer, index) => {
    formData.append('images', new Blob([ buffer ], { type: 'image/png' }), `image${index}.png`)
  })

  return finalImages.length < min_images
    ? {
      success: false,
      userText,
      message: `该表情需要${min_images} ~ ${max_images}张图片`
    }
    : {
      success: true,
      userText
    }
}

export { handleImages }
