import { server } from '#models'

export class stop extends plugin {
  constructor () {
    super({
      name: '柠糖表情:停止表情服务端',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))(?:停止|关闭)(?:表情)?(?:服务端)?$/i,
          fnc: 'start'
        }
      ]
    })
  }

  async start (e) {
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return
    try {
      await server.stop()
      await e.reply('表情服务端已停止成功')
    } catch (error) {
      logger.error(error)
      await e.reply('表情服务端停止失败')
    }
  }
}
