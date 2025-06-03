import { meme } from '../db/index.js'

export const getMemeList = async () => {
  const keywordsRaw = await meme.getAllSelect('keyWords')

  const keywords = Array.from(new Set(
    keywordsRaw.flatMap(item => {
      try {
        return JSON.parse(item)
      } catch (e) {
        return []
      }
    })
  ))

  const keywordPromises1 = keywords.map(async keyword => {
    const value = (await meme.getByField('keyWords', keyword)).toString()
    return {
      label: keyword,
      value: value
    }
  })

  const keywordPromises2 = keywords.map(keyword => ({
    label: keyword,
    value: keyword
  }))

  const result1 = await Promise.all(keywordPromises1)
  const result2 = keywordPromises2

  return [ ...result1, ...result2 ]
}
