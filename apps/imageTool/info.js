import { Version } from '#components'
import { imageTool, utils } from '#models'

export class Imageinfo extends plugin {
  constructor () {
    super({
      name: '柠糖表情:查看图片信息',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:查看)?(?:图片信息|imageinfo)$/i,
          fnc: 'image_info'
        }
      ]
    })
  }

  async image_info (e) {
    try {
      const image = await utils.get_image(e, 'url')
      if (!image) {
        return await e.reply('请发送图片', true)
      }
      const image_id = await utils.upload_image(image[0].image)
      const image_info = await imageTool.get_image_info(image_id)
      const replyMessage = [
        segment.image(`base64://${await imageTool.get_image(image_id, 'base64')}`),
        '图片信息:\n',
        `分辨率: ${image_info.width}x${image_info.height}\n`,
        `是否为动图: ${image_info.is_multi_frame}\n`
      ]
      if (image_info.is_multi_frame) {
        replyMessage.push(`帧数: ${image_info.frame_count}\n`)
        replyMessage.push(`动图平均帧率: ${image_info.average_duration}\n`)
      }
      await e.reply(replyMessage, true)
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]获取图片信息失败: ${error.message}`, true)
    }
  }
}
