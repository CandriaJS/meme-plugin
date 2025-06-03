import { meme } from '../db/index.js'

export const getMemeList = async () => {

  const keywords = async () => {
    const res = await meme.getAll()
    return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
  }
  const keys = async (keyword) => {
    const res = await await meme.getByKeyWord(keyword)
    if (!res) return null
    return res.key
  }
  return await Promise.all(
    (await keywords() ?? []).map(async keyword => {
      const memeKey = await keys(keyword)
      return {
        label: keyword,
        value: memeKey
      }
    })
  )
}
