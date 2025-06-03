import { server } from '#models'
export class download extends plugin {
  constructor () {
    super({
      name: '柠糖表情:下载表情服务端资源',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))(?:下载|更新)表情服务端资源$/i,
          fnc: 'download'
        }
      ]
    })
  }

  async download (e) {
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return
    try {
      await e.reply('正在下载/更新表情服务端资源，请稍等...')
      const res = await server.download_server_resource()
      if (!res) {
        await e.reply('表情服务端资源下载失败')
        return
      }
      await e.reply('表情服务端资源下载成功')
    } catch (error) {
      logger.error(error)
      await e.reply('下载表情服务端资源失败, 请前往控制台查看日志')
    }
  }
}
