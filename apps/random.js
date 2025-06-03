import { Config, Version } from '#components'
import { make, utils } from '#models'

export class random extends plugin {
  constructor () {
    super({
      name: '柠糖表情:随机表情包',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?表情)?随机(?:表情|meme)(包)?$/i,
          fnc: 'random'
        }
      ]
    })
  }

  async random (e) {
    if (!Config.meme.enable) return false
    try {
      const memeKeys = await utils.get_meme_all_keys() ?? null
      if (!memeKeys || memeKeys.length === 0) {
        throw new Error('未找到可用的表情包')
      }

      for (let i = memeKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[ memeKeys[i], memeKeys[j] ] = [ memeKeys[j], memeKeys[i] ]
      }

      for (const memeKey of memeKeys) {
        const memeInfo = await utils.get_meme_info(memeKey) ?? null
        if (!memeInfo) continue
        const min_texts = memeInfo.min_texts ?? 0
        const max_texts = memeInfo.max_texts ?? 0
        const min_images = memeInfo.min_images ?? 0
        const max_images = memeInfo.max_images ?? 0
        const options = memeInfo.options ?? null
        if (
          (min_texts === 1 && max_texts === 1) ||
            (min_images === 1 && max_images === 1) ||
            (min_texts === 1 && min_images === 1 && max_texts === 1 && max_images === 1)
        ) {
          try {
            let keyWords = await utils.get_meme_keyword(memeKey) ?? null
            keyWords = keyWords ? keyWords.map(word => `[${word}]`) : [ '[无]' ]

            const result = await make.make_meme(
              e,
              memeKey,
              min_texts,
              max_texts,
              min_images,
              max_images,
              options,
              '',
              false
            )

            let replyMessage = [
              segment.text('本次随机表情信息如下:\n'),
              segment.text(`表情的名称: ${memeKey}\n`),
              segment.text(`表情的别名: ${keyWords}\n`)
            ]
            if (result) {
              replyMessage.push(segment.image(result))
            } else {
              throw new Error('表情生成失败,请重试!')
            }
            await e.reply(replyMessage)
            return true
          } catch (error) {
            throw new Error(error.message)
          }
        }
      }

      throw new Error('未找到有效的表情包')
    } catch (error) {
      logger.error(error.message)
      if (Config.meme?.errorReply) {
        const prefix = Config.meme?.prefix || Version.Plugin_AliasName
        await e.reply(`[${prefix}] 生成随机表情失败, 错误信息: ${error.message}`)
      }
    }
  }
}
