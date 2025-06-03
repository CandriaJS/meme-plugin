import { Config, Version } from '#components'
import { Utils } from '#models'

export class search extends plugin {
  constructor () {
    super({
      name: '清语表情:搜索',
      event: 'message',
      priority: -Infinity,
      rule: [ {
        reg: /^#?(?:(清语)?表情|meme(?:-plugin)?)搜索\s*(.+)\s*$/i,
        fnc: 'search'
      } ]
    })
  }

  async search (e) {
    if (!Config.meme.enable) return false
    try {
      const match = e.msg.match(this.rule[0].reg)
      const keyword = match[2].trim()

      if (!keyword) {
        await e.reply('请提供搜索的表情关键字', true)
        return true
      }

      const allKeywords = await Utils.Tools.getAllKeyWords()

      if (!allKeywords || allKeywords.length === 0) {
        await e.reply('表情数据未加载，请稍后重试', true)
        return true
      }

      const lowerCaseKeyword = keyword.toLowerCase()
      const results = allKeywords.filter(kw => kw.toLowerCase().includes(lowerCaseKeyword))

      if (results.length === 0) {
        await e.reply(`未找到与 "${keyword}" 相关的表情`, true)
        return true
      }

      const uniqueResults = [ ...new Set(results) ].sort()

      const replyMessage = uniqueResults
        .map((kw, index) => `${index + 1}. ${kw}`)
        .join('\n')

      await e.reply(replyMessage, true)
      return true

    } catch (error) {
      logger.error(`[${Version.Plugin_AliasName}] 搜索表情失败: ${error}`)
      await e.reply(`[${Version.Plugin_AliasName}] 搜索表情失败，请稍后重试`, true)
      return true
    }
  }
}
