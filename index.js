import fs from 'node:fs/promises'
import path from 'node:path'

import axios from 'axios'
import chalk from 'chalk'

import { Config, Version  } from '#components'
import { server, utils } from '#models'

const startTime = Date.now()
let apps

let responseData = '加载失败'
try {
  const response = await axios.get(
    `https://api.wuliya.cn/api/count?name=${Version.Plugin_Name}&type=json`,
    { timeout: 500 }
  )
  responseData = response.data.data
} catch (error) {
  logger.warn('⚠️ 访问统计数据失败，超时或网络错误')
}
try {
  if (Number(Config.server.mode) === 1) {
    logger.info(chalk.bold.blue('🚀 启动表情服务端...'))
    await server.init_server(Config.server.port)
    logger.info(chalk.bold.green('🎉 表情服务端启动成功！'))
  }
} catch (error) {
  logger.error(chalk.bold.red(`💥 表情服务端启动失败！错误详情：${error.message}`))
}
try {
  await utils.init()
  logger.info(chalk.bold.cyan(`[${Version.Plugin_AliasName}] 🎉 表情包数据初始化成功！`))
} catch (error) {
  logger.error(chalk.bold.red(`[${Version.Plugin_AliasName}] 💥 表情包数据初始化失败！错误详情：${error.message}`))
}

async function getFiles (dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  const jsFiles = []

  for (const file of files) {
    const filePath = path.resolve(dir, file.name)
    if (file.isDirectory()) {
      jsFiles.push(...await getFiles(filePath))
    } else if (file.isFile() && file.name.endsWith('.js')) {
      jsFiles.push(filePath)
    }
  }

  return jsFiles
}

try {
  const files = await getFiles(`${Version.Plugin_Path}/apps`)

  const ret = await Promise.allSettled(
    files.map(async (filePath) => {
      const startModuleTime = Date.now()

      try {
        const module = await import(`file://${filePath}`)
        const endModuleTime = Date.now()
        const loadTime = endModuleTime - startModuleTime

        logger.debug(
          chalk.rgb(0, 255, 255)(`[${Version.Plugin_AliasName}]`) +
          chalk.green(` 🚀 ${path.basename(filePath, '.js')}`) +
          chalk.rgb(255, 223, 0)(` 加载时间: ${loadTime} ms`)
        )

        return module
      } catch (error) {
        logger.error(
          chalk.bgRgb(255, 0, 0).white.bold(' ❌ 载入插件错误：') +
          chalk.redBright(` ${path.basename(filePath, '.js')} `) +
          ' 🚫'
        )
        logger.debug(chalk.red(`📄 错误详情： ${error.message}`))

        return null
      }
    })
  )

  apps = {}

  files.forEach((filePath, i) => {
    const name = path.basename(filePath, '.js')

    if (ret[i].status !== 'fulfilled' || !ret[i].value) {
      return
    }

    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
  })

  const endTime = Date.now()
  const loadTime = endTime - startTime

  let loadTimeColor = chalk.green.bold
  if (loadTime < 500) {
    loadTimeColor = chalk.rgb(144, 238, 144).bold
  } else if (loadTime < 1000) {
    loadTimeColor = chalk.rgb(255, 215, 0).bold
  } else {
    loadTimeColor = chalk.red.bold
  }

  logger.info(chalk.bold.rgb(0, 255, 0)('========= 🌟🌟🌟 ========='))
  logger.info(
    chalk.bold.blue('📦 当前运行环境: ') +
    chalk.bold.white(`${Version.Bot_Name}`) +
    chalk.gray(' | ') +
    chalk.bold.green('🏷️ 运行版本: ') +
    chalk.bold.white(`${Version.Bot_Version}`) +
    chalk.gray(' | ') +
    chalk.bold.yellow('📊 运行插件总访问/运行次数: ') +
    chalk.bold.cyan(responseData)
  )

  logger.info(
    chalk.bold.rgb(255, 215, 0)(`✨ ${Version.Plugin_AliasName} `) +
    chalk.bold.rgb(255, 165, 0).italic(Version.Plugin_Version) +
    chalk.rgb(255, 215, 0).bold(' 载入成功 ^_^')
  )
  logger.info(loadTimeColor(`⏱️ 载入耗时：${loadTime} ms`))
  logger.info(chalk.cyan.bold('💬 雾里的小窝: 272040396'))
  logger.info(chalk.green.bold('========================='))

} catch (error) {
  logger.error(chalk.red.bold(`❌ 初始化失败: ${error}`))
}

export { apps }
