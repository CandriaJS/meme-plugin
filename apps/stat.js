import { Config, Render } from '#components'
import { Utils } from '#models'

export class stats extends plugin {
  constructor () {
    super({
      name: '清语表情:统计',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(清语)?表情|meme(?:-plugin)?)(调用)?统计$/i,
          fnc: 'stat'
        }
      ]
    })
  }

  async stat (e) {
    if (!Config.meme.enable) return false

    const statsData = await Utils.Common.getStatAll()
    if (!statsData || statsData.length === 0) {
      return await e.reply('当前没有统计数据')
    }

    let total = 0
    const formattedStats = []

    await Promise.all(statsData.map(async (data) => {
      const { key, all: count } = data
      total += count
      const keywords = await Utils.Tools.getKeyWords(key)
      if (keywords?.length) {
        formattedStats.push({ keywords: keywords.join(', '), count })
      }
    }))
    formattedStats.sort((a, b) => b.count - a.count)

    const img = await Render.render(
      'stat/index',
      {
        total,
        emojiList: formattedStats
      }
    )

    await e.reply(img)
    return true
  }
}
