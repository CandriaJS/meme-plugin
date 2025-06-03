import fs from 'node:fs/promises'

import { Version } from './Version.js'

const getRoot = (root = '') => {
  if (root === 'root' || root === 'yunzai') {
    root = `${Version.Bot_Path}/`
  } else if (!root) {
    root = `${Version.Plugin_Path}/`
  }
  return root
}

export const Data = {
  /*
   * 根据指定的path依次检查与创建目录
   */
  async createDir (path = '', root = '', includeFile = false) {
    root = getRoot(root)
    let pathList = path.split('/')
    let nowPath = root

    await pathList.reduce(async (previousPromise, name, idx) => {
      await previousPromise
      name = name.trim()
      if (!includeFile && idx <= pathList.length - 1) {
        nowPath += name + '/'
        if (name) {
          try {
            await fs.mkdir(nowPath, { recursive: true })
          } catch (e) {
          }
        }
      }
    }, Promise.resolve())
  },

  /*
   * 读取JSON
   */
  async readJSON (file = '', root = '') {
    root = getRoot(root)
    try {
      const filePath = `${root}/${file}`
      await fs.access(filePath)
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (e) {
      console.error(`读取 JSON 文件失败: ${file}`, e)
      return {}
    }
  },

  /*
   * 写JSON
   */
  async writeJSON (file, data, space = '\t', root = '') {
    await Data.createDir(file, root, true)
    root = getRoot(root)
    delete data._res
    const jsonData = JSON.stringify(data, null, space)
    const filePath = `${root}/${file}`
    await fs.writeFile(filePath, jsonData)
  }
}
