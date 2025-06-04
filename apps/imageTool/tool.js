import fs from 'node:fs/promises'
import path from 'node:path'

import AdmZip from 'adm-zip'

import { Config, Version } from '#components'
import { imageTool, utils } from '#models'

const getType = Config.server.usebase64 ? 'base64' : 'url'
const uploadType = Config.server.usebase64 ? 'data' : 'url'

export class ImageTools extends plugin {
  constructor () {
    super({
      name: '柠糖表情:图片操作',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:水平翻转)(?:图片)?$/i,
          fnc: 'flip_horizontal'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:垂直翻转)(?:图片)?$/i,
          fnc: 'flip_vertical'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:旋转)(?:图片)?(?:\s*(\d+))?$/i,
          fnc: 'rotate'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:缩放)(?:图片)?(?:\s*(\d+)(?:x(\d+)?|%)?)?$/i,
          fnc: 'resize'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:裁剪)(?:图片)?(?:\s*([\d:x,]+))?$/i,
          fnc: 'crop'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:灰度化)(?:图片)?$/i,
          fnc: 'grayscale'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:反色)(?:图片)?$/i,
          fnc: 'invert'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:水平拼接)(?:图片)?$/i,
          fnc: 'merge_horizontal'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:垂直拼接)(?:图片)?$/i,
          fnc: 'merge_vertical'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:分解)$/i,
          fnc: 'gif_split'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:合并|拼接)$/i,
          fnc: 'gif_merge'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:反转)$/i,
          fnc: 'gif_reverse'
        },
        {
          reg: /^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:变速|改变帧率)(?:\s*(\d{0,3}\.?\d{1,3}(?:fps|ms|s|x|倍速?|%)?))?$/i,
          fnc: 'gif_change_duration'
        }
      ]
    })
  }

  async flip_horizontal (e) {
    try {
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      const reslut = await imageTool.flip_horizontal(image_id)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`水平翻转图片失败: ${error.message}`)
    }
  }

  async flip_vertical (e) {
    try {
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      const reslut = await imageTool.flip_vertical(image_id)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]垂直翻转图片图片失败: ${error.message}`
      )
    }
  }

  async rotate (e) {
    try {
      const [ , angle ] = e.msg.match(this.rule[2].reg)
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      if (!angle) {
        return await e.reply('请输入旋转角度')
      }
      const reslut = await imageTool.rotate(image_id, parseInt(angle))
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]旋转图片失败: ${error.message}`)
    }
  }

  async resize (e) {
    try {
      const [ , width, height ] = e.msg.match(this.rule[3].reg)
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      if (!width) {
        return await e.reply('请输入正确的尺寸格式, 如:100x100,100x,50%')
      }

      const image_info = await imageTool.get_image_info(image_id)
      let finalWidth
      let finalHeight

      if (width.endsWith('%')) {
        /** 百分比缩放 */
        const scale = parseInt(width) / 100
        finalWidth = Math.floor(image_info.width * scale)
        finalHeight = Math.floor(image_info.height * scale)
      } else {
        /** 固定尺寸缩放 */
        finalWidth = parseInt(width)
        finalHeight = height
          ? parseInt(height)
          : Math.floor(image_info.height * (finalWidth / image_info.width))
      }

      const reslut = await imageTool.resize(image_id, finalWidth, finalHeight)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]缩放图片失败:${error.message}`)
    }
  }

  async crop (e) {
    try {
      const [ , cropParam ] = e.msg.match(this.rule[4].reg)
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      if (!cropParam) {
        return await e.reply(
          '请输入正确的裁剪格式 ,如:[0,0,100,100],[100x100],[2:1]',
          true
        )
      }

      const image_info = await imageTool.get_image_info(image_id)
      let left, top, right, bottom

      if (cropParam.includes(',')) {
        [ left, top, right, bottom ] = cropParam
          .split(',')
          .map((n) => parseInt(n))
      } else if (cropParam.includes('x')) {
        const [ width, height ] = cropParam.split('x').map((n) => parseInt(n))
        left = 0
        top = 0
        right = width
        bottom = height
      } else if (cropParam.includes(':')) {
        const [ widthRatio, heightRatio ] = cropParam
          .split(':')
          .map((n) => parseInt(n))
        const ratio = widthRatio / heightRatio
        if (image_info.width / image_info.height > ratio) {
          const newWidth = Math.floor(image_info.height * ratio)
          left = Math.floor((image_info.width - newWidth) / 2)
          top = 0
          right = left + newWidth
          bottom = image_info.height
        } else {
          const newHeight = Math.floor(image_info.width / ratio)
          left = 0
          top = Math.floor((image_info.height - newHeight) / 2)
          right = image_info.width
          bottom = top + newHeight
        }
      } else {
        return await e.reply(
          '请输入正确的裁剪格式 ,如:[0,0,100,100],[100x100],[2:1]'
        )
      }

      const reslut = await imageTool.crop(image_id, left, top, right, bottom)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]裁剪图片失败: ${error.message}`)
    }
  }
  async grayscale (e) {
    try {
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      const reslut = await imageTool.grayscale(image_id)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]灰度化图片失败: ${error.message}`
      )
    }
  }

  async invert (e) {
    try {
      const image = await utils.get_image(e, getType)
      const image_id = image && image.length > 0 ? await utils.upload_image(image[0].image, uploadType) : null

      if (!image_id) {
        return await e.reply('请发送图片', { reply: true })
      }
      const reslut = await imageTool.invert(image_id)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]反色图片失败: ${error.message}`)
    }
  }

  async merge_horizontal (e) {
    try {
      const images = await utils.get_image(e, getType)
      if (!images || images.length < 2) {
        return await e.reply('请发送至少两张图片进行合并', true)
      }
      const image_ids = await Promise.all(
        images.map((img) => utils.upload_image(img.image, uploadType))
      )
      const reslut = await imageTool.merge_horizontal(image_ids)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]水平拼接图片失败: ${error.message}`
      )
    }
  }

  async merge_vertical (e) {
    try {
      const images = await utils.get_image(e, getType)
      if (!images || images.length < 2) {
        return await e.reply('请发送至少两张图片进行垂直拼接', true)
      }
      const image_ids = await Promise.all(
        images.map((img) => utils.upload_image(img.image, uploadType))
      )
      const reslut = await imageTool.merge_vertical(image_ids)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]垂直拼接图片失败: ${error.message}`
      )
    }
  }
  async gif_split (e) {
    try {
      const image = await utils.get_image(e, getType)
      if (!image) {
        return await e.reply('请发送图片', true)
      }
      const image_id = await utils.upload_image(image[0].image, uploadType)
      const reslut = await imageTool.gif_split(image_id)

      const images = await Promise.all(
        reslut.map((id) => imageTool.get_image(id, 'base64'))
      )

      const zip = new AdmZip()
      images.forEach((img, index) => {
        zip.addFile(`image_${index}.png`, Buffer.from(img, 'base64'))
      })
      const timestamp = Date.now()
      const zipPath = path.join(Version.Plugin_Path, 'data', 'temp', `gif分解-${timestamp}.zip`)
      const zipName = path.basename(zipPath)
      zip.writeZip(zipPath)

      try {
        const fileBuffer = await fs.readFile(zipPath)
        const platform = e.bot.adapter.name
        const file = platform === 'ICQQ' ? fileBuffer : `base64://${fileBuffer.toString('base64')}`
        const type = e.isGroup ? 'group' : 'private'
        const id = e.isGroup ? e.group_id : e.user_id
        await utils.send_file(type, Number(e.self_id), Number(id), file, zipName)

        if (await utils.exists(zipPath)) {
          await fs.unlink(zipPath)
        }
        if (e.isGroup) {
          setTimeout(async () => {
            try {
              const filesList = await e.bot.pickGroup(e.group_id).fs.ls()
              let matchedFile
              if (platform === 'ICQQ') {
                matchedFile = filesList.find(file => file.name === zipName)
              } else {
                const filesArray = Array.isArray(filesList) ? filesList : (filesList.files || [])
                matchedFile = filesArray.find(file => file.file_name === zipName)
              }
              let fid
              if (matchedFile) {
                if (platform === 'ICQQ') {
                  fid = matchedFile.fid
                } else {
                  fid = matchedFile.file_id
                }
              } else {
                return logger.warn('未找到上传的文件fid, 跳过删除群文件')
              }
              await e.bot.pickGroup(e.group_id).fs.rm(fid)
            } catch (error) {
              logger.warn('删除群文件失败, 跳过删除群文件')
            }
          }, 10 * 60 * 1000)
        }
      } catch (error) {
        logger.warn('上传文件失败, 跳过文件发送')
        if (await utils.exists(zipPath)) {
          await fs.unlink(zipPath)
        }
      }

      const replyMessage = [
        '============\n',
        '原图:\n',
        segment.image(`base64://${await imageTool.get_image(image_id, 'base64')}`),
        '============\n',
        '分解后的图片:\n',
        ...images.map((img) => segment.image(`base64://${img}`))
      ]

      await e.reply(Bot.makeForwardArray(replyMessage))
    } catch (error) {
      logger.error(error)
      await e.reply(`GIF分解失败: ${error.message}`)
    }
  }

  async gif_merge (e) {
    try {
      const images = await utils.get_image(e, getType)
      if (!images || images.length < 2) {
        return await e.reply('请发送至少两张图片进行拼接', true)
      }
      const image_ids = await Promise.all(
        images.map((img) => utils.upload_image(img.image, uploadType))
      )
      const reslut = await imageTool.gif_merge(image_ids)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]gif拼接图片失败: ${error.message}`
      )
    }
  }

  async gif_reverse (e) {
    try {
      const image = await utils.get_image(e, getType)
      if (!image) {
        return await e.reply('请发送图片', true)
      }
      const image_id = await utils.upload_image(image[0].image, uploadType)
      const reslut = await imageTool.gif_reverse(image_id)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(
        `[${Version.Plugin_AliasName}]gif反转图片失败: ${error.message}`
      )
    }
  }

  async gif_change_duration (e) {
    try {
      const [ , param ] = e.msg.match(this.rule[12].reg)
      const image = await utils.get_image(e, getType)
      if (!image) {
        return await e.reply('请发送图片', true)
      }
      if (!param) {
        return await e.reply(
          '请使用正确的倍率格式,如:[0.5x],[50%],[20FPS],[0.05s]',
          true
        )
      }
      const image_id = await utils.upload_image(image[0].image, uploadType)
      const image_info = await imageTool.get_image_info(image_id)
      if (!image_info.is_multi_frame) {
        return await e.reply('该图片不是动图,无法进行变速操作', true)
      }
      let duration

      const fps_match = param.match(/(\d{0,3}\.?\d{1,3})fps$/i)
      const time_match = param.match(/(\d{0,3}\.?\d{1,3})(m?)s$/i)
      const speed_match = param.match(/(\d{0,3}\.?\d{1,3})(?:x|倍速?)$/i)
      const percent_match = param.match(/(\d{0,3}\.?\d{1,3})%$/)

      if (fps_match) {
        duration = 1 / parseFloat(fps_match[1])
      } else if (time_match) {
        duration = time_match[2]
          ? parseFloat(time_match[1]) / 1000
          : parseFloat(time_match[1])
      } else {
        duration = image_info.average_duration

        if (speed_match) {
          duration /= parseFloat(speed_match[1])
        } else if (percent_match) {
          duration = duration * (100 / parseFloat(percent_match[1]))
        } else {
          return await e.reply('请使用正确的倍率格式,如:[0.5x],[50%],[20FPS],[0.05s]', true)
        }
      }

      if (duration < 0.02) {
        return await e.reply([
          ('帧间隔必须大于 0.02 s(小于等于 50 FPS),\n'),
          ('超过该限制可能会导致 GIF 显示速度不正常.\n'),
          (`当前帧间隔为 ${duration.toFixed(3)} s (${(1 / duration).toFixed(1)} FPS)`
          )
        ])
      }

      const reslut = await imageTool.gif_change_duration(image_id, duration)
      await e.reply([
        segment.image(
          `base64://${await imageTool.get_image(reslut, 'base64')}`
        )
      ])
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]GIF变速失败: ${error.message}`)
    }
  }
}
