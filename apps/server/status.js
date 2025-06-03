import { Render, Version } from '#components'
import { server } from '#models'

export class status extends plugin {
  constructor () {
    super({
      name: '柠糖表情:服务端状态',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?(?:表情|meme))?(?:服务端)(?:状态)?$/i,
          fnc: 'status'
        }
      ]
    })
  }

  async status (e) {
    const img = await Render.render('server/status', {
      version: Version.Plugin_Version,
      serverVersion: await server.get_meme_server_version() ?? '未知',
      status: await server.get_meme_server_version() ? '运行中' : '未运行',
      runtime: await server.get_meme_server_runtime(),
      memory: await server.get_meme_server_memory() ?? `${await server.get_meme_server_memory()} MB` ?? '未知',
      total: await server.get_meme_server_meme_total() ?? `${await server.get_meme_server_meme_total()} MB` ?? '未知'
    })
    await e.reply(img)
  }
}
