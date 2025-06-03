import { Config, Version } from '#components'
import { Meme, Utils } from '#models'

export class random extends plugin {
  constructor () {
    super({
      name: '清语表情:随机表情包',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(清语)?表情|meme(?:-plugin)?)?随机(?:表情|meme)(包)?$/i,
          fnc: 'random'
        }
      ]
    })
  }

  async random (e) {
    if (!Config.meme.enable) return false
    try {
      const memeKeys = await Utils.Tools.getAllKeys() ?? null
      if (!memeKeys || memeKeys.length === 0) {
        throw new Error('未找到可用的表情包')
      }

      for (let i = memeKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[ memeKeys[i], memeKeys[j] ] = [ memeKeys[j], memeKeys[i] ]
      }

      for (const memeKey of memeKeys) {
        const params = await Utils.Tools.getParams(memeKey) ?? null
        if (!params) continue

        const { min_texts, max_texts, min_images, max_images, default_texts, args_type } = params
        const defText = await Utils.Tools.getDeftext(memeKey) ?? null
        if (!defText) continue
        if (
          (min_texts === 1 && max_texts === 1) ||
          (min_images === 1 && max_images === 1) ||
          (min_texts === 1 && min_images === 1 && max_texts === 1 && max_images === 1)
        ) {
          try {
            let keyWords = await Utils.Tools.getKeyWords(memeKey) ?? null
            keyWords = Array.isArray(keyWords) ? keyWords.map(word => `[${word}]`).join(' ') : '[无]'

            const result = await Meme.make(
              e,
              memeKey,
              min_texts,
              max_texts,
              min_images,
              max_images,
              default_texts,
              args_type,
              ''
            )

            let replyMessage = [
              '本次随机表情信息如下:\n',
              `表情的名称: ${memeKey}\n`,
              `表情的别名: ${keyWords}\n`,
              segment.image(result)
            ]
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
      if (Config.meme.errorReply) {
        await e.reply(`[${Version.Plugin_AliasName}] 生成随机表情失败, 错误信息: ${error.message}`)
      }
    }
  }
}
