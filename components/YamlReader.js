import fs from 'node:fs'

import chokidar from 'chokidar'
import _ from 'lodash'
import YAML from 'yaml'

export class YamlReader {
  constructor (yamlPath, isWatch = false) {
    this.yamlPath = yamlPath
    this.isWatch = isWatch
    this.isSave = false
    this.initYaml()
  }

  /** 初始化 YAML 解析 */
  initYaml () {
    if (!fs.existsSync(this.yamlPath)) fs.writeFileSync(this.yamlPath, '', 'utf8')
    this.document = YAML.parseDocument(fs.readFileSync(this.yamlPath, 'utf8')) || new YAML.Document()

    if (this.isWatch && !this.watcher) {
      this.watcher = chokidar.watch(this.yamlPath).on('change', _.debounce(() => {
        if (this.isSave) {
          this.isSave = false
          return
        }
        this.initYaml()
      }))
    }
  }

  /** 获取 YAML 转换后的 JSON 数据 */
  get jsonData () {
    return this.document?.toJSON() || {}
  }

  /** 检查是否包含 key */
  has (keyPath) {
    return this.document.hasIn(keyPath.split('.'))
  }

  /** 获取 key 的值 */
  get (keyPath) {
    return _.get(this.jsonData, keyPath)
  }

  /** 设置 key 的值 */
  set (keyPath, value) {
    this.document.setIn(keyPath.split('.'), value)
    this.save()
  }

  /** 删除 key */
  delete (keyPath) {
    this.document.deleteIn(keyPath.split('.'))
    this.save()
  }

  /** 数组添加数据 */
  addIn (keyPath, value) {
    let arr = this.get(keyPath) || []
    if (!Array.isArray(arr)) arr = []
    arr.push(value)
    this.set(keyPath, arr)
  }

  /** 保存 YAML 文件 */
  save () {
    this.isSave = true
    fs.writeFileSync(this.yamlPath, this.document.toString(), 'utf8')
  }
}
