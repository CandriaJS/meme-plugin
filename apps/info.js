import { Config } from '#components'
import { Utils } from '#models'

export class info extends plugin {
  constructor () {
    super({
      name: '清语表情:表情包详情',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(清语)?表情|meme(?:-plugin)?)\s*详情\s*(.+?)$/i,
          fnc: 'info'
        }
      ]
    })
  }

  async info (e) {
    if (!Config.meme.enable) return false
    const message = (e.msg || '').trim()
    const match = message.match(this.rule[0].reg)
    if (!match) return

    const keyword = match[2]
    const memeKey = await Utils.Tools.getKey(keyword) ?? null
    const memeParams = await Utils.Tools.getParams(memeKey) ?? null

    if (!memeKey || !memeParams) {
      await e.reply('未找到相关表情包详情, 请稍后再试', true)
      return true
    }

    const {
      min_texts = null,
      max_texts = null,
      min_images = null,
      max_images = null
    } = memeParams

    const argsdescObj = await Utils.Tools.getDescriptions(memeKey) ?? null
    const argsdesc = argsdescObj
      ? Object.entries(argsdescObj).map(([ paramName, description ]) => `[${paramName}: ${description}]`).join(' ')
      : null
    const argsCmd = await Utils.Tools.gatPresetAllName(memeKey) ?? null
    const argsCmdList = argsCmd?.length ? argsCmd.map(name => `[${name}]`).join(' ') : '[无]'
    const aliasList = await Utils.Tools.getKeyWords(memeKey) ?? null
    const alias = aliasList ? aliasList.map(text => `[${text}]`).join(' ') : '[无]'

    const defTextList = await Utils.Tools.getDeftext(memeKey) ?? null
    const defText = defTextList ? defTextList.map(text => `[${text}]`).join(' ') : '[无]'

    const tagsList = await Utils.Tools.getTags(memeKey) ?? null
    const tags = tagsList ? tagsList.map(tag => `[${tag}]`).join(' ') : '[无]'

    let previewImageBase64 = null
    try {
      const previewUrl = await Utils.Tools.getPreviewUrl(memeKey)
      if (previewUrl) {
        previewImageBase64 = await Utils.Common.getImageBase64(previewUrl, true)
      }
    } catch {
      previewImageBase64 = null
    }

    const replyMessage = [
      `名称: ${memeKey}\n`,
      `别名: ${alias}\n`,
      `图片数量: ${min_images} ~ ${max_images ?? '[未知]'}\n`,
      `文本数量: ${min_texts} ~ ${max_texts ?? '[未知]'}\n`,
      `默认文本: ${defText}\n`,
      `标签: ${tags}`
    ]

    if (argsdesc) {
      replyMessage.push(`\n可选参数:\n${argsdesc}`)
    }
    if (argsCmdList) {
      replyMessage.push(`\n参数命令:\n${argsCmdList}`)
    }

    if (previewImageBase64) {
      replyMessage.push('\n预览图片:\n')
      replyMessage.push(segment.image(previewImageBase64))
    } else {
      replyMessage.push('\n预览图片:\n')
      replyMessage.push('预览图片加载失败')
    }

    await e.reply(replyMessage, true)
    return true
  }
}
