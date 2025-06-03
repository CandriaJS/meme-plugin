import { Config, Version } from '#components'
import { utils } from '#models'

export class search extends plugin {
  constructor () {
    super({
      name: '柠糖表情:搜索',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?表情)搜索\s*(.+?)$/i,
          fnc: 'search'
        }
      ]
    })
  }

  async search (e) {
    if (!Config.meme.enable) return false
    try {
      const [ , searchKey ] = e.msg.match(this.rule[0].reg)

      /** 关键词搜索 */
      const keywords = await utils.get_meme_keywords_by_about(searchKey)
      /** 键值搜索 */
      const keys = await Promise.all(
        (await utils.get_meme_keys_by_about(searchKey) ?? []).map(key => utils.get_meme_keyword(key))
      )

      /** tag搜索 */
      const [ keyTags ] = await Promise.all([
        utils.get_meme_keys_by_about_tag(searchKey),
        utils.get_meme_keywords_by_about_tag(searchKey)
      ])
      const keyTagsKeywords = await Promise.all(
        (keyTags ?? []).map(key => utils.get_meme_keyword(key))
      )

      const tags = [ ...(keyTagsKeywords.filter(Boolean) ?? []) ]

      /** 预设表情搜索 */
      const preset = await utils.get_preset_all_about_keywords(searchKey) ?? await utils.get_preset_all_about_keywords_by_key(searchKey) ?? []
      const presetKeys = await Promise.all(
        preset.map(async (preset) => {
          const presetKey = await utils.get_preset_key(preset)
          return presetKey
        })
      )
      const presetKeywords = await Promise.all(
        presetKeys.map(async (presetKeys) => {
          const keywords = await utils.get_meme_keyword(String(presetKeys))
          return keywords ?? []
        })
      )

      /** 关键词搜索 */
      if (!keywords?.length && !keys?.length && !tags?.length && !presetKeywords?.length) {
        await e.reply(`没有找到${searchKey}相关的表情`)
        return true
      }

      const allResults = [ ...new Set([ ...(keywords ?? []), ...(keys ?? []), ...presetKeywords, ...(tags ?? []) ].flat()) ]

      const replyMessage = allResults
        .map((kw, index) => `${index + 1}. ${kw}`)
        .join('\n')

      await e.reply([ ('你可能在找以下表情：\n' + replyMessage) ], true)
      return true
    } catch (error) {
      await e.reply(`搜索出错了：${error.message}`)
      return false
    }
  }
}
