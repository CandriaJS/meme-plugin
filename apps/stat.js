import { Config, Render } from '#components'
import { db, utils } from '#models'

export class stat extends plugin {
  constructor () {
    super({
      name: '柠糖表情:表情包详情',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?表情)(?:调用)?统计$/i,
          fnc: 'stat'
        }
      ]
    })
  }

  async stat (e) {
    if (!Config.stat.enable) return await e.reply('统计功能未开启')
    let statsData
    if (e.isGroup) {
      statsData = await db.stat.getAllByGroupId(e.group_id)
    } else {
      statsData = await db.stat.getAll()
    }
    if (!statsData || statsData.length === 0) {
      return await e.reply('当前没有统计数据')
    }
    let total = 0
    const formattedStats = []
    const memeKeyMap = new Map()

    statsData.forEach(data => {
      const { memeKey, count } = data
      memeKeyMap.set(memeKey, (memeKeyMap.get(memeKey) ?? 0) + count)
    })

    await Promise.all([ ...memeKeyMap.entries() ].map(async ([ memeKey, count ]) => {
      total += count
      const allKeywords = [
        ...new Set([
          ...(await utils.get_meme_keyword(memeKey) ?? []),
          ...(await utils.get_preset_keyword(memeKey) ?? [])
        ])
      ]
      if (allKeywords?.length) {
        formattedStats.push({ keywords: allKeywords.join(', '), count })
      }
    }))

    const img = await Render.render('stat/index', {
      total,
      memeList: formattedStats
    })

    await e.reply(img)
    return true
  }
}
