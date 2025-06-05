import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import TOML from 'smol-toml'

import { Config } from '#components'
import { utils } from '#models'

import { get_meme_server_name, get_meme_server_path } from './utils.js'

let serverProcess = null

const config = {
  meme: {
    load_builtin_memes: true,
    load_external_memes: false,
    meme_disabled_list: []
  },
  resource: {
    resource_url: 'https://cdn.jsdelivr.net/gh/MemeCrafters/meme-generator-rs@',
    download_fonts: true
  },
  font: {
    use_local_fonts: true,
    default_font_families: [ 'Noto Sans SC', 'Noto Color Emoji' ]
  },
  encoder: {
    gif_max_frames: 200,
    gif_encode_speed: 1
  },
  api: {
    baidu_trans_appid: '',
    baidu_trans_apikey: ''
  },
  server: {
    host: '0.0.0.0',
    port: 2255
  }
}

/**
 * 启动表情服务端
 * @param port - 端口
 * @returns 启动结果
 */

export async function start (port = 2255) {
  try {
    const configDir = path.join(os.homedir(), '.meme_generator')
    const configPath = path.join(configDir, 'config.toml')
    if (!await utils.exists(configDir)) {
      await fs.mkdir(configDir)
    }
    if (!await utils.exists(configPath)) {
      const defaultConfig = TOML.stringify(config)
      await fs.writeFile(configPath, defaultConfig)
    }
    const configContentBuffer = await fs.readFile(configPath)
    const configContent = configContentBuffer?.toString().trim() || TOML.stringify(config)
    const configData = TOML.parse(configContent)
    const download_url = 'https://cdn.jsdelivr.net/gh/MemeCrafters/meme-generator-rs@'
    const base_url = await utils.isAbroad() ? download_url : 'https://cdn.mengze.vip/gh/MemeCrafters/meme-generator-rs@'
    const url = Config.server.download_url?.trim() ? Config.server.download_url.replace(/\/+$/, '') : base_url
    configData.server.port = port
    configData.resource.resource_url = url
    const newConfigData = TOML.stringify(configData)
    await fs.writeFile(configPath, newConfigData)
    const memeServerPath = path.join(`${get_meme_server_path()}/${get_meme_server_name()}`)
    if (!memeServerPath) {
      throw new Error('未找到表情服务端文件')
    }
    serverProcess = spawn(memeServerPath, [ 'run' ], { stdio: 'inherit' })
    serverProcess.on('error', (error) => {
      logger.error(error)
      throw new Error(`启动服务器失败: ${(error).message}`)
    })
  } catch (error) {
    logger.error(error)
    throw new Error(`启动服务器失败: ${error.message}`)
  }
}

/**
 * 停止表情服务端
 * @returns 停止结果
 */
export async function stop () {
  try {
    if (serverProcess) {
      await new Promise((resolve, reject) => {
        serverProcess.on('exit', resolve)
        serverProcess.on('error', reject)
        serverProcess.kill()
      })
      serverProcess = null
    } else {
      throw new Error('表情服务端未运行')
    }
  } catch (error) {
    logger.error(error)
    throw new Error(`停止服务器失败: ${error.message}`)
  }
}

/**
 * 重启表情服务端
 * @returns 重启结果
 */
export async function restart () {
  try {
    if (serverProcess) {
      await stop()
    }
    await start()
  } catch (error) {
    logger.error(error)
    throw new Error(`重启服务器失败: ${error.message}`)
  }
}
