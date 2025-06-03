import { Config, Version } from '#components'
import { make, utils } from '#models'

let memeRegExp, presetRegExp

/**
 * 生成正则表达式
 * @param {Function} getKeywords 获取关键词的函数
 * @returns {RegExp | null}
 */
const createRegex = async (getKeywords) => {
  const keywords = (await getKeywords()) ?? []
  if (keywords.length === 0) return null
  const prefix = Config.meme.forceSharp ? '^#' : '^#?'
  const escapedKeywords = keywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const keywordsRegex = `(${escapedKeywords.join('|')})`
  return new RegExp(`${prefix}${keywordsRegex}(.*)`, 'i')
}

memeRegExp = await createRegex(async () => await utils.get_meme_all_keywords())
presetRegExp = await createRegex(async () => await utils.get_preset_all_keywords())

export class meme extends plugin {
  constructor () {
    super({
      name: '柠糖表情:表情包生成',
      event: 'message',
      priority: -Infinity,
      rule: []
    })

    if (memeRegExp) {
      this.rule.push({
        reg: memeRegExp,
        fnc: 'meme'
      })
    }
    if (presetRegExp) {
      this.rule.push({
        reg: presetRegExp,
        fnc: 'preset'
      })
    }
  }

  /**
   * 更新正则
   */
  async updateRegExp () {
    memeRegExp = await createRegex(async () => await utils.get_meme_all_keywords() ?? [])
    presetRegExp = await createRegex(async () => await utils.get_preset_all_keywords() ?? [])
    if (!memeRegExp && !presetRegExp) {
      logger.info(`[${Version.Plugin_AliasName}] 没有找到表情关键词, 请使用[#柠糖表情更新资源], 稍后再试`)
      return false
    }

    this.rule = [
      {
        reg: memeRegExp,
        fnc: 'meme'
      },
      {
        reg: presetRegExp,
        fnc: 'preset'
      }
    ]

    return true
  }
  async meme (e) {
    if (!Config.meme.enable) return false
    try {
      const [ , keyword, userText ] = e.msg.match(this.rule[0].reg)
      const key = await utils.get_meme_key_by_keyword(keyword)
      if (!key) return false
      const memeInfo = await utils.get_meme_info(key)
      const min_texts = memeInfo?.min_texts ?? 0
      const max_texts = memeInfo?.max_texts ?? 0
      const min_images = memeInfo?.min_images ?? 0
      const max_images = memeInfo?.max_images ?? 0
      const options = memeInfo?.options ?? null
      /* 检查用户权限 */
      if (!await this.checkUserAccess(e)) return false

      /* 检查禁用表情列表 */
      if (await this.checkBlacklisted(keyword)) return false

      /* 防误触发处理 */
      if (!await this.checkUserText(min_texts, max_texts, userText)) return false

      const res = await make.make_meme(
        e,
        key,
        min_texts,
        max_texts,
        min_images,
        max_images,
        options,
        userText,
        false
      )
      await e.reply([ segment.image(res) ], Config.meme.reply)
    } catch (error) {
      logger.error(error)
      if (Config.meme.errorReply) {
        const prefix = Config.meme?.prefix || Version.Plugin_AliasName
        return await e.reply(`[${prefix}]: 生成表情失败, 错误信息: ${error.message}`)
      }
      return true
    }
  }

  async preset (e) {
    if (!Config.meme.enable) return false
    try {
      const [ , keyword, userText ] = e.msg.match(this.rule[1].reg)
      const key = await utils.get_preset_key(keyword)
      if (!key) return false
      const memeInfo = await utils.get_meme_info(key)
      const min_texts = memeInfo?.min_texts ?? 0
      const max_texts = memeInfo?.max_texts ?? 0
      const min_images = memeInfo?.min_images ?? 0
      const max_images = memeInfo?.max_images ?? 0
      const options = memeInfo?.options ?? null
      /* 检查用户权限 */
      if (!await this.checkUserAccess(e)) return false

      /* 检查禁用表情列表 */
      if (await this.checkBlacklisted(keyword)) return false

      /* 防误触发处理 */
      if (!await this.checkUserText(min_texts, max_texts, userText)) return false

      const res = await make.make_meme(
        e,
        key,
        min_texts,
        max_texts,
        min_images,
        max_images,
        options,
        userText,
        true,
        keyword
      )
      await e.reply([ segment.image(res) ], Config.meme.reply)
    } catch (error) {
      logger.error(error)
      if (Config.meme.errorReply) {
        const prefix = Config.meme?.prefix || Version.Plugin_AliasName
        return await e.reply(`[${prefix}]: 生成表情失败, 错误信息: ${error.message}`)
      }
      return true
    }
  }

  /**
 * 权限检查
 * @param {Message} e 消息
 * @returns 是否有权限
 */
  async checkUserAccess (e) {
    if (Config.access.enable) {
      const userId = e.user_id
      if (Config.access.mode === 0 && !Config.access.userWhiteList.includes(userId)) {
        logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 不在白名单中，跳过生成`)
        return false
      } else if (Config.access.mode === 1 && Config.access.userBlackList.includes(userId)) {
        logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 在黑名单中，跳过生成`)
        return false
      }
    }
    return true
  }

  /**
 * 禁用表情检查
 * @param {string} keywordOrKey - 表情关键词或key
 * @returns 是否在禁用列表中
 */
  async checkBlacklisted (keywordOrKey) {
    if (!Config.access.blackListEnable || Config.access.blackList.length < 0) {
      return false
    }
    const key = await utils.get_meme_key_by_keyword(keywordOrKey)
    if (!key) {
      return false
    }

    const blacklistKeys = await Promise.all(
      Config.access.blackList.map(async item => {
        const convertedKey = await utils.get_meme_key_by_keyword(item)
        return convertedKey ?? item
      })
    )

    if (blacklistKeys.includes(key)) {
      logger.info(`[${Version.Plugin_AliasName}] 该表情 "${key}" 在禁用列表中，跳过生成`)
      return true
    }

    return false
  }

  /**
 * 防误触发处理
 */
  async checkUserText (min_texts, max_texts, userText) {
    if (min_texts === 0 && max_texts === 0 && userText) {
      const trimmedText = userText.trim()
      if (
        !/^(@\s*\d+\s*)+$/.test(trimmedText) &&
      !/^(#\S+\s+[^#]+(?:\s+#\S+\s+[^#]+)*)$/.test(trimmedText)
      ) {
        return false
      }
    }
    return true
  }
}
