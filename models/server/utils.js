import { exec as childExec, spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import AdmZip from 'adm-zip'

import { Config, Version } from '#components'
import { utils } from '#models'

import { start } from './manger.js'

const exec = promisify(childExec)
/**
 * 格式化日期时间
 */
function formatRuntime (diffMs) {
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  let runtime = ''
  if (days > 0) runtime += `${days}天`
  if (remainingHours > 0) runtime += `${remainingHours}小时`
  if (remainingMinutes > 0) runtime += `${remainingMinutes}分钟`
  runtime += `${remainingSeconds}秒`

  return runtime
}

/*
 * 获取本地IP地址
 * @returns 本地IP地址
 */
export async function get_local_ip () {
  const interfaces = os.networkInterfaces()

  for (const devName in interfaces) {
    const iface = interfaces[devName]
    if (!iface) continue

    for (const alias of iface) {
      if (!alias) continue

      if (
        alias.family === 'IPv4' &&
       alias.address !== '127.0.0.1' &&
       !alias.internal
      ) {
        return alias.address
      }
    }
  }

  return Promise.resolve('127.0.0.1')
}


/**
 * 重启表情服务端
 * @returns 重启结果
 */

const save_path = path.join(Version.Plugin_Path, 'data', 'server')
/**
 * 下载表情服务端
 * 自动根据当前系统类型下载对应的表情服务端并保存到本地
 */
export async function download_server () {
  try {
    let file_name
    if (!await utils.exists(save_path)) {
      await fs.mkdir(save_path)
    }
    const type = os.type()
    const arch = os.arch()
    switch (type) {
      case 'Windows_NT':
        file_name = 'meme-generator-cli-windows-x86_64.zip'
        break
      case 'Linux':
        switch (arch) {
          case 'x64':
            file_name = 'meme-generator-cli-linux-x86_64.zip'
            break
          case 'arm64':
            file_name = 'meme-generator-cli-linux-aarch64.zip'
            break
          default:
            throw new Error('不支持的架构')
        }
        break
      case 'Darwin':
        switch (arch) {
          case 'x64':
            file_name = 'meme-generator-cli-macos-x86_64.zip'
            break
          case 'arm64':
            file_name = 'meme-generator-cli-macos-aarch64.zip'
            break
          default:
            throw new Error('不支持的架构')
        }
        break
      default:
        throw new Error('不支持的操作系统')
    }
    const github_url = 'https://github.com'
    const base_url = await utils.isAbroad() ? github_url : `https://github.moeyy.xyz/${github_url}`
    const url = Config.server.proxy_url?.trim() ? `${Config.server.proxy_url.replace(/\/+$/, '')}/${github_url}` : base_url
    const release_url = `${url}/MemeCrafters/meme-generator-rs/releases/latest/download/${file_name}`
    const res = await utils.Request.get(release_url, null, null, 'arraybuffer')
    if (!res.success) {
      throw new Error('下载表情服务端文件失败')
    } else if (res.status) {
      logger.info('下载表情服务端文件成功')
    }
    logger.debug('下载表情服务端文件成功')
    logger.debug('开始解压表情服务端文件')
    const zip = new AdmZip(res.data)
    zip.extractAllTo(save_path, true)
    logger.debug('解压表情服务端文件成功')
  } catch (error) {
    logger.error(error)
    throw new Error('下载表情服务端文件失败:' + error.message)
  }
}

/**
 * 下载表情服务端资源
 * @returns 更新结果
 */
export async function download_server_resource () {
  try {
    const server_path = path.join(`${get_meme_server_path()}/${get_meme_server_name()}`)
    if (!server_path) throw new Error('表情服务端文件不存在')

    return new Promise((resolve, reject) => {
      const downloadProcess = spawn(server_path, [ 'download' ], { stdio: 'inherit' })

      downloadProcess.on('error', (error) => {
        logger.error(error)
        reject(new Error('下载表情服务端资源失败'))
      })

      downloadProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('下载表情服务端资源失败'))
        } else {
          logger.info('下载表情服务端资源成功')
          resolve(true)
        }
      })
    })
  } catch (error) {
    logger.error(error)
    throw new Error('更新表情服务端资源失败: ' + error.message)
  }
}

/**
 * 获取表情服务端的名称
 * @returns 表情服务端的名称
 */
export function get_meme_server_name () {
  let name
  try {
    const type = os.type()
    switch (type) {
      case 'Windows_NT':
        name = 'meme.exe'
        break
      case 'Linux':
      case 'Darwin':
        name = 'meme'
        break
      default:
        throw new Error('不支持的操作系统')
    }
    return name
  } catch (error) {
    logger.error(error)
    return null
  }
}

/**
 * 获取表情服务端的路径
 * @returns 表情服务端的路径
 */
export function get_meme_server_path () {
  return path.join(save_path)
}

/**
 * 获取表情服务端的版本
 * @returns 表情服务端的版本
 */
export async function get_meme_server_version () {
  try {
    const url = await utils.get_base_url()
    const res = await utils.Request.get(`${url}/meme/version`)
    return res.data
  } catch (error) {
    logger.error(error)
    return null
  }
}

/**
 * 获取表情服务端的进程ID
 * @returns 表情服务端的进程ID
 */
export async function get_meme_server_pid () {
  try {
    const type = os.type()
    let command
    let args

    switch (type) {
      case 'Windows_NT':
      {
        command = 'wmic'
        const serverPath = path.join(get_meme_server_path() ?? '', get_meme_server_name() ?? '')
        args = [ 'process', 'where', `"ExecutablePath='${serverPath.replace(/\\/g, '\\\\')}'"`, 'get', 'ProcessId', '/value' ]
        break
      }
      case 'Linux':
      case 'Darwin':
      {
        command = 'pgrep'
        const serverPath = path.join(get_meme_server_path() ?? '', get_meme_server_name() ?? '')
        args = [ '-f', serverPath ?? '' ]
        break
      }
      default:
        throw new Error('不支持的操作系统')
    }

    const { stdout, stderr } = await exec(`${command} ${args.join(' ')}`)
    if (stderr) throw new Error('获取表情服务端进程ID失败')
    let pid

    if (type === 'Windows_NT') {
      const pidMatch = stdout.match(/ProcessId=(\d+)/)
      if (!pidMatch) {
        throw new Error('无法获取进程ID')
      }
      pid = pidMatch[1]
    } else {
      pid = stdout.trim().split('\n')[0]
    }
    if (!pid) {
      throw new Error('无法获取进程ID')
    }
    return pid
  } catch (error) {
    logger.error(error)
    throw new Error('获取表情服务端进程ID失败:' + error.message)
  }
}

/**
 * 获取表情服务端的运行时间
 * @returns 表情服务端的运行时间
 */
export async function get_meme_server_runtime () {
  try {
    const pid = await get_meme_server_pid()

    const type = os.type()
    let command
    let args

    switch (type) {
      case 'Windows_NT':
        command = 'wmic'
        args = [ 'process', 'where', `processid=${pid}`, 'get', 'CreationDate', '/value' ]
        break
      case 'Linux':
      case 'Darwin':
        command = 'ps'
        args = [ '-p', pid, '-o', 'etime=' ]
        break
      default:
        throw new Error('不支持的操作系统')
    }

    const { stdout, stderr } = await exec(`${command} ${args.join(' ')}`)
    if (stderr) throw new Error('获取表情服务端运行时间失败')
    let runtime = ''

    if (type === 'Windows_NT') {
      const match = stdout.match(/CreationDate=(\d+)/)
      if (match) {
        const wmicDate = match[1]
        const year = parseInt(wmicDate.substring(0, 4))
        const month = parseInt(wmicDate.substring(4, 6)) - 1
        const day = parseInt(wmicDate.substring(6, 8))
        const hours = parseInt(wmicDate.substring(8, 10))
        const minutes = parseInt(wmicDate.substring(10, 12))
        const seconds = parseInt(wmicDate.substring(12, 14))
        const creationDate = new Date(year, month, day, hours, minutes, seconds)
        const now = new Date()
        const diffMs = now.getTime() - creationDate.getTime()
        runtime = formatRuntime(diffMs)
      } else {
        throw new Error('无法解析WMIC输出的创建日期')
      }
    } else {
      const etime = stdout.trim()
      const etimeMatch = etime.match(/(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+)/)
      if (etimeMatch) {
        const [ , days, possibleHours, minutes, seconds ] = etimeMatch
        let hours = 0
        if (possibleHours) {
          hours = parseInt(possibleHours)
        }
        const diffMs = ((parseInt(days || '0') * 24 * 60 * 60) +
          (hours * 60 * 60) +
          parseInt(minutes) * 60 +
          parseInt(seconds)) * 1000
        runtime = formatRuntime(diffMs)
      }
      if (!etimeMatch) {
        throw new Error('无法获取进程运行时间')
      }
      if (!etimeMatch) {
        throw new Error('无法获取进程运行时间')
      }
    }

    return runtime
  } catch (error) {
    logger.error(error)
    return '未知'
  }
}

export async function get_meme_server_memory () {
  try {
    const pid = await get_meme_server_pid()
    const type = os.type()
    let command
    let args

    switch (type) {
      case 'Windows_NT':
        command = 'wmic'
        args = [ 'process', 'where', `processid=${pid}`, 'get', 'WorkingSetSize', '/value' ]
        break
      case 'Linux':
      case 'Darwin':
        command = 'ps'
        args = [ '-p', pid, '-o', 'rss=' ]
        break
      default:
        throw new Error('不支持的操作系统')
    }

    const { stdout, stderr } = await exec(`${command} ${args.join(' ')}`, { log: true })
    if (stderr) throw new Error('获取表情服务端内存使用失败')
    let memoryInMB

    if (type === 'Windows_NT') {
      const match = stdout.match(/WorkingSetSize=(\d+)/)
      if (match) {
        const memoryStr = match[1]
        memoryInMB = parseInt(memoryStr) / (1024 * 1024)
      } else {
        throw new Error('获取表情服务端内存使用失败')
      }
    } else {
      memoryInMB = parseInt(stdout.trim()) / 1024
    }

    return memoryInMB % 1 === 0 ? memoryInMB.toFixed(0) : memoryInMB.toFixed(2)
  } catch (error) {
    logger.error(error)
    return '未知'
  }
}

/**
 * 获取表情服务端的表情包总数
 * @returns 表情服务端的表情包总数
 */
export async function get_meme_server_meme_total () {
  try {
    const url = await utils.get_base_url()
    const res = await utils.Request.get(`${url}/meme/keys`)
    return res.data.length
  } catch (error) {
    logger.error(error)
    return '未知'
  }
}

/**
 * 初始化表情服务端
 * @param port - 端口
 * @returns 初始化结果
 */
export async function init_server (port = 2255) {
  try {
    const server_path = path.join(`${get_meme_server_path()}/${get_meme_server_name()}`)
    if (!await utils.exists(server_path)) await download_server()
    const type = os.type()
    if (type === 'Linux') {
      await exec('chmod +x ' + server_path)
    }
    const resource_path = path.join(os.homedir(), '.meme_generator', 'resources')
    if (!await utils.exists(resource_path)) {
      logger.info('表情服务端资源不存在，请稍后使用[#柠糖表情下载表情服务端资源]命令下载')
    }
    await start(port)
  } catch (error) {
    logger.error(error)
    throw new Error('初始化表情服务端失败:' + error.message)
  }
}
