import { Config } from '#components'
import { utils } from '#models'

export class info extends plugin {
  constructor () {
    super({
      name: '柠糖表情:表情包详情',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?表情)详情\s*(.+)$/i,
          fnc: 'info'
        }
      ]
    })
  }

  async info (e) {
    if (!Config.meme.enable) return false
    try {
      const [ , searchKey ] = e.msg.match(this.rule[0].reg)
      const memeInfo = await utils.get_meme_info_by_keyword(searchKey) ?? await utils.get_meme_info(searchKey)

      if (!memeInfo) {
        throw new Error(`没有找到该表情${searchKey}信息`)
      }

      const {
        key: memeKey,
        keyWords: alias,
        min_images,
        max_images,
        min_texts,
        max_texts,
        default_texts: defText,
        options,
        tags
      } = memeInfo
      const presetList = await utils.get_preset_all_about_keywords_by_key(memeKey)
      const aliasArray = typeof alias === 'string' ? JSON.parse(alias) : (Array.isArray(alias) ? alias : [])
      const defTextArray = typeof defText === 'string' ? JSON.parse(defText) : (Array.isArray(defText) ? defText : [])
      const tagsArray = typeof tags === 'string' ? (JSON.parse(tags)).map((tag) => `[${tag}]`) : (Array.isArray(tags) ? tags : [])
      const optionsArray = typeof options === 'string' ? JSON.parse(options) : (Array.isArray(options) ? options : [])
      const optionArray = optionsArray.length > 0 ? optionsArray.map((opt) => `[${opt.name}: ${opt.description}]`).join('') : null
      const optionCmdArray = Array.isArray(presetList) ? presetList.map(cmd => `[${cmd}]`).join(' ') : null

      const replyMessage = [
        `名称: ${memeKey}\n`,
        `别名: ${aliasArray.map((alias) => `[${alias}]`).join(' ')}\n`,
        `图片数量: ${min_images === max_images ? min_images : `${min_images} ~ ${max_images ?? '[未知]'}`}\n`,
        `文本数量: ${min_texts === max_texts ? min_texts : `${min_texts} ~ ${max_texts ?? '[未知]'}`}\n`,
        `默认文本: ${defTextArray.length > 0 ? defTextArray.join('') : '[无]'}\n`,
        `标签: ${tagsArray.length > 0 ? tagsArray.join('') : '[无]'}`
      ]
      if (optionCmdArray) {
        replyMessage.push(`\n可选预设:\n${optionCmdArray}`)
      }
      if (optionArray) {
        replyMessage.push(`\n可选选项:\n${optionArray}`)
      }

      try {
        const previewImage = await utils.get_meme_preview(memeKey)
        const base64Data = await utils.getImageBase64(previewImage)
        if (previewImage) {
          replyMessage.push('\n预览图片:\n')
          replyMessage.push(segment.image(previewImage))
        }
      } catch (error) {
        replyMessage.push('\n预览图片:\n')
        replyMessage.push('预览图获取失败')
      }

      await e.reply(replyMessage, { at: true })
    } catch (error) {
      logger.error(error)
      await e.reply(error.message)
    }
  }
}
