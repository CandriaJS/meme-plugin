import { utils } from '#models'

export async function handleTexts (
  e,
  memekey,
  min_texts,
  max_texts,
  userText,
  formdata
) {
  const texts = []

  /** 用户输入的文本 */
  if (userText) {
    const splitTexts = userText.split('/').map((text) => text.trim())
    for (const text of splitTexts) {
      if (text) {
        texts.push(text)
      }
    }
  }

  const memeInfo = await utils.get_meme_info(memekey)
  const default_texts = memeInfo?.default_texts ? JSON.parse(String(memeInfo.default_texts)) : []
  if (
    texts.length < min_texts &&
    default_texts
  ) {
    while (texts.length < min_texts) {
      const randomIndex = Math.floor(Math.random() * default_texts.length)
      texts.push(default_texts[randomIndex])
    }
  }

  formdata['texts'] = texts

  return texts.length < min_texts
    ? {
      success: false,
      message: min_texts === max_texts
        ? `该表情需要${min_texts}个文本`
        : `该表情至少需要 ${min_texts} ~ ${max_texts} 个文本`
    }
    : {
      success: true,
      texts: userText
    }
}
