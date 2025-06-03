import fs from 'node:fs'
import path from 'node:path'

import chokidar from 'chokidar'
import _ from 'lodash'

import cfg from '../../../lib/config/config.js'
import cfgSchema from '../config/system/cfg_system.js'
import { Version } from './Version.js'
import { YamlReader } from './YamlReader.js'

class Cfg {
  constructor () {
    this.config = {}
    this.watcher = {}

    this.dirCfgPath = `${Version.Plugin_Path}/config/config/`
    this.defCfgPath = `${Version.Plugin_Path}/config/defSet/`

    this.initCfg()
  }

  /** 初始化配置 */
  initCfg () {
    if (!fs.existsSync(this.dirCfgPath)) fs.mkdirSync(this.dirCfgPath, { recursive: true })

    fs.readdirSync(this.defCfgPath)
      .filter((file) => file.endsWith('.yaml'))
      .forEach((file) => {
        const name = path.basename(file, '.yaml')
        const userCfgPath = path.join(this.dirCfgPath, file)
        if (!fs.existsSync(userCfgPath)) fs.copyFileSync(path.join(this.defCfgPath, file), userCfgPath)
        this.watch(userCfgPath, name, 'config')
      })
  }

  /** 读取默认或用户配置 */
  getDefOrConfig (name) {
    return { ...this.getDefSet(name), ...this.getConfig(name) }
  }

  /** 默认配置 */
  getDefSet (name) {
    return this.getYaml('defSet', name)
  }

  /** 用户配置 */
  getConfig (name) {
    return this.getYaml('config', name)
  }

  /** 获取 YAML 配置 */
  getYaml (type, name) {
    let filePath = path.join(Version.Plugin_Path, 'config', type, `${name}.yaml`)
    let key = `${type}.${name}`

    if (this.config[key]) return this.config[key]

    this.config[key] = new YamlReader(filePath).jsonData
    this.watch(filePath, name, type)

    return this.config[key]
  }

  /** 监听配置文件 */
  watch (file, name, type = 'config') {
    let key = `${type}.${name}`
    if (this.watcher[key]) return

    const watcher = chokidar.watch(file, { persistent: true })
    this.watcher[key] = watcher

    watcher.on('change', _.debounce(async () => {
      const oldConfig = _.cloneDeep(this.config[key] || {})

      delete this.config[key]
      this.config[key] = new YamlReader(file).jsonData

      logger.mark(`[清语表情][修改配置文件][${type}][${name}]`)

      const changes = this.findDifference(oldConfig, this.config[key])
      for (const key in changes) {
        const value = changes[key]

        let target = { type: null }

        if (_.isObject(value.newValue) && value.oldValue === undefined) target.type = 'add'
        else if (value.newValue === undefined && _.isObject(value.oldValue)) target.type = 'del'
        else if (value.newValue === true && !value.oldValue) target.type = 'close'
        else if (value.newValue === false && value.oldValue) target.type = 'open'
      }
    }))
  }

  /** 获取所有配置 */
  getCfg () {
    return fs.readdirSync(this.defCfgPath)
      .filter((file) => file.endsWith('.yaml'))
      .reduce((configData, file) => {
        const name = path.basename(file, '.yaml')
        configData[name] = this.getDefOrConfig(name)
        return configData
      }, {})
  }

  /** 获取配置 Schema 映射 */
  getCfgSchemaMap () {
    return _.cloneDeep(cfgSchema)
  }

  /** 修改配置 */
  modify (name, key, value, type = 'config') {
    let filePath = path.join(Version.Plugin_Path, 'config', type, `${name}.yaml`)
    new YamlReader(filePath).set(key, value)
    delete this.config[`${type}.${name}`]
  }

  /** 对比两个对象的不同值 */
  findDifference (obj1, obj2) {
    return _.reduce(
      obj1,
      (result, value, key) => {
        if (!_.isEqual(value, obj2[key])) result[key] = { oldValue: value, newValue: obj2[key] }
        return result
      },
      _.reduce(
        obj2,
        (result, value, key) => {
          if (!(key in obj1)) result[key] = { oldValue: undefined, newValue: value }
          return result
        },
        {}
      )
    )
  }
}

export const Config = new Proxy(new Cfg(), {
  get (target, prop) {
    if (prop === 'masterQQ') return cfg.masterQQ
    if (prop in target) return target[prop]
    return target.getDefOrConfig(prop)
  }
})
