import lodash from 'lodash'

import { Config, Render, Version } from '#components'

const sysCfgReg = () => {
  const cfgSchema = Config.getCfgSchemaMap()
  const groupNames = Object.keys(cfgSchema).map(group => cfgSchema[group].title)
  const keys = lodash.flatMap(cfgSchema, group =>
    Object.values(group.cfg).map(cfgItem => cfgItem.title)
  )

  const sortedKeys = keys.sort((a, b) => b.length - a.length)
  return new RegExp(`^#清语表情设置\\s*(?:(${groupNames.join('|')}))?\\s*(?:(${sortedKeys.join('|')}))?\\s*(.*)`)
}

export class setting extends plugin {
  constructor () {
    super({
      name: '清语表情:设置',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: sysCfgReg(),
          fnc: 'setting'
        }
      ]
    })
  }

  async setting (e) {
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return true
    const regRet = sysCfgReg().exec(e.msg) || []
    const cfgGroupName = regRet[1]
    const cfgKey = regRet[2]
    let val = regRet[3]?.trim() || ''

    const cfgSchema = Config.getCfgSchemaMap()

    const users = e.message
      .filter(m => m.type === 'at')
      .map(at => at.qq)

    let cfgSchemaItem = null
    let fileName = null
    let cfgItemKey = null

    if (cfgKey) {
      if (cfgGroupName) {
        const groupEntry = Object.entries(cfgSchema).find(([ groupName, group ]) => group.title === cfgGroupName)
        if (groupEntry) {
          fileName = groupEntry[0]
          const foundItem = Object.entries(groupEntry[1].cfg).find(([ key, cfgItem ]) => cfgItem.title === cfgKey)
          if (foundItem) {
            cfgItemKey = foundItem[0]
            cfgSchemaItem = foundItem[1]
          }
        }
      } else {
        for (const [ groupName, group ] of Object.entries(cfgSchema)) {
          const foundItem = Object.entries(group.cfg).find(([ key, cfgItem ]) => cfgItem.title === cfgKey)
          if (foundItem) {
            fileName = groupName
            cfgItemKey = foundItem[0]
            cfgSchemaItem = foundItem[1]
            break
          }
        }
      }
    }

    if (!cfgSchemaItem) {
      await this.renderConfig(e, cfgSchema)
      return true
    }

    const currentVal = Config.getDefOrConfig(fileName)?.[cfgItemKey] ?? cfgSchemaItem.def

    if (cfgSchemaItem.type === 'list') {
      let currentList = Array.isArray(currentVal) ? currentVal : []
      if (/^添加/.test(val)) {
        const itemToAdd = val.replace(/^添加\s*/, '').trim()
        if (users.length > 0) {
          for (const user of users) {
            if (!currentList.includes(user)) {
              currentList.push(user)
            }
          }
        } else if (itemToAdd && !currentList.includes(itemToAdd)) {
          currentList.push(itemToAdd)
        }
        Config.modify(fileName, cfgItemKey, currentList)
      } else if (/^删除/.test(val)) {
        const itemToRemove = val.replace(/^删除\s*/, '').trim()
        if (users.length > 0) {
          for (const user of users) {
            currentList = currentList.filter(item => item !== user)
          }
        } else if (itemToRemove) {
          currentList = currentList.filter(item => item !== itemToRemove)
        }
        Config.modify(fileName, cfgItemKey, currentList)
      }
    } else {
      if (cfgSchemaItem.input) {
        val = cfgSchemaItem.input(val)
      } else {
        switch (cfgSchemaItem.type) {
          case 'number':
            val = isNaN(val * 1) ? currentVal : val * 1
            break
          case 'boolean':
            val = (val === '' || /关闭/.test(val)) ? false : true
            break
          case 'string':
            val = val || currentVal || ''
            break
          case 'list':
            val = Array.isArray(val) ? val : currentVal
            break
        }
      }
      Config.modify(fileName, cfgItemKey, val)
    }

    await this.renderConfig(e, cfgSchema)
  }
  async renderConfig (e, cfgSchema) {
    const cfg = Config.getCfg()
    const img = await Render.render(
      'admin/index',
      {
        title: Version.Plugin_AliasName,
        schema: cfgSchema,
        cfg
      }
    )
    await e.reply(img)
  }
}
