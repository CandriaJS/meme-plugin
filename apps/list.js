import { Config, Render, Version } from '#components'
import { utils } from '#models'

export class list extends plugin {
  constructor () {
    super({
      name: '柠糖表情:列表',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?(?:表情|(?:meme(?:s)?)))列表$/i,
          fnc: 'list'
        }
      ]
    })
  }

  async list (e) {
    if (!Config.meme.enable) return false
    try {
      const keys = await utils.get_meme_all_keys()
      if (!keys || keys.length === 0) {
        await e.reply(`[${Version.Plugin_AliasName}]没有找到表情列表, 请使用[#柠糖表情更新资源], 稍后再试`, true)
        return true
      }
      const tasks = keys.map(async (key) => {
        const keywords = await utils.get_meme_keyword(key) ?? []
        const params = await utils.get_meme_info(key)

        const min_texts = params?.min_texts ?? 0
        const min_images = params?.min_images ?? 0
        const options = params?.options ?? null
        const types = []
        if (min_texts >= 1) types.push('text')
        if (min_images >= 1) types.push('image')
        if (options !== null) types.push('option')

        if (keywords.length > 0) {
          return {
            name: keywords.join('/'),
            types
          }
        }

        return []
      })
      const memeList = (await Promise.all(tasks)).flat()
      const total = keys.length

      const img = await Render.render(
        'list/index',
        {
          memeList,
          total
        }
      )
      await e.reply(img)
      return true
    } catch (error) {
      logger.error(error)
    }
  }
}
