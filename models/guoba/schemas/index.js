import { Config } from '#components'

import access from './access.js'
import meme from './meme.js'
import other from './other.js'
import protect from './protect.js'
import server from './server.js'
import stat from './stat.js'

export const schemas = [
  server,
  meme,
  access,
  protect,
  stat,
  other
].flat()

export function getConfigData () {
  return {
    server: Config.server,
    meme: Config.meme,
    access: Config.access,
    protect: Config.protect,
    stat: Config.stat,
    other: Config.other
  }
}

export function setConfigData (data, { Result }) {
  for (let key in data) {
    Config.modify(...key.split('.'), data[key])
  }
  return Result.ok({}, '保存成功辣ε(*´･ω･)з')
}
