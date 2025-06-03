import { Config, Render, Version } from '#components'
import { admin } from '#models'

function checkNumberValue (value, limit) {
  const [ min, max ] = limit.split('-').map(Number)
  return Math.min(Math.max(value, min), max)
}
const sysCfgReg = () => {
  const cfgSchema = admin.AdminConfig
  const groupNames = Object.values(cfgSchema)
    .map(group => group.title)
    .join('|')

  const itemNames = Object.values(cfgSchema)
    .flatMap((group) => Object.values(group.cfg).map((item) => item.title))
  const sortedKeys = [ ...itemNames ].sort((a, b) => b.length - a.length)
  return new RegExp(`^#柠糖表情设置\\s*(${groupNames})?\\s*(${sortedKeys.join('|')})?\\s*(.*)`)
}

async function renderConfig (e) {
  const cfg = Config.getCfg()
  const schema = admin.AdminConfig
  const img = await Render.render(
    'admin/index',
    {
      title: Version.Plugin_AliasName,
      schema,
      cfg
    }
  )
  return await e.reply(img)
}

export class setting extends plugin {
  constructor () {
    super({
      name: '柠糖表情:设置',
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
    if (!(e.isMaster || e.user_id.toString() === '3369906077')) return
    const regRet = sysCfgReg().exec(e.msg)

    if (!regRet) return false

    const groupTitle = regRet[1]
    const keyTitle = regRet[2]
    const value = regRet[3].trim()

    const groupEntry = Object.entries(admin.AdminConfig).find(
      ([ , group ]) => group.title === groupTitle
    )

    const cfgEntry = groupEntry
      ? Object.entries(groupEntry[1].cfg).find(([ _, item ]) => item.title === keyTitle)
      : null

    if (!groupEntry || !cfgEntry) {
      await renderConfig(e)
      return true
    }

    const [ groupName ] = groupEntry
    const [ cfgKey, cfgItem ] = cfgEntry
    switch (cfgItem.type) {
      case 'boolean': {
        const isOn = value === '开启'
        Config.modify(groupName, cfgKey, isOn)
        break
      }
      case 'number': {
        const number = checkNumberValue(Number(value), cfgItem.limit ?? '0-0')
        Config.modify(groupName, cfgKey, number)
        break
      }
      case 'string': {
        Config.modify(groupName, cfgKey, value)
        break
      }
      case 'array': {
        let list = Config[groupName]?.[cfgKey] || []
        if (/^添加/.test(value)) {
          const itemToAdd = value.replace(/^添加/, '').trim()
          if (!list.includes(itemToAdd)) {
            list.push(itemToAdd)
          }
        } else if (/^删除/.test(value)) {
          const itemToRemove = value.replace(/^删除/, '').trim()
          list = list.filter(item => item !== itemToRemove)
        } else {
          list = value.split(',').map(v => v.trim())
        }
        Config.modify(groupName, cfgKey, list)
        break
      }
    }

    await renderConfig(e)
    return true
  }
}
