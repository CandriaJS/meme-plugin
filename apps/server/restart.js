import { server } from '#models'

export class restart extends plugin {
  constructor () {
    super({
      name: '柠糖表情:重启表情服务端',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))(?:重启|重新启动)(?:表情)?(?:服务端)?$/i,
          fnc: 'restart'
        }
      ]
    })
  }

  async restart (e) {
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return
    try {
      await server.restart()
      await e.reply('表情服务端已重新启动成功')
    } catch (error) {
      logger.error(error)
      await e.reply('启动失败')
    }
  }
}
