import { server, utils } from '#models'

export class start extends plugin {
  constructor () {
    super({
      name: '柠糖表情:启动表情服务端',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)?(?:表情|meme))(?:开启|启动)(?:表情)?(?:服务端)?$/i,
          fnc: 'start'
        }
      ]
    })
  }

  async start (e) {
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return
    try {
      await server.start()
      await e.reply('表情服务端已启动成功\n地址:' + await utils.get_base_url())
    } catch (error) {
      logger.error(error)
      await e.reply('启动失败')
    }
  }
}
