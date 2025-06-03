import fs from 'node:fs/promises'

import lodash from 'lodash'
import MarkdownIt from 'markdown-it'

import { Render, Version } from '#components'
import { help } from '#models'

export class Help extends plugin {
  constructor () {
    super({
      name: '柠糖表情:帮助',
      event: 'message',
      priority: -Infinity,
      rule: [
        {
          reg: /^#?(?:(柠糖)?表情|meme(?:-plugin)?)(?:命令|帮助|菜单|help|说明|功能|指令|使用说明)$/i,
          fnc: 'help'
        },
        {
          reg: /^#?(?:(柠糖)?表情|meme(?:-plugin)?)(?:版本|版本信息|version|versioninfo)$/i,
          fnc: 'versionInfo'
        }
      ]
    })
  }

  async help (e) {
    let helpGroup = []
    lodash.forEach(help.helpList.List, (group) => {
      if (group.auth && group.auth === 'master' && (!(e.isMaster || e.user_id.toString() === '3369906077'))) {
        return true
      }
      lodash.forEach(group.list, (help) => {
        let icon = help.icon * 1
        if (!icon) {
          help.css = 'display:none'
        } else {
          let x = (icon - 1) % 10
          let y = (icon - x - 1) / 10
          help.css = `background-position:-${x * 50}px -${y * 50}px`
        }
      })

      helpGroup.push(group)
    })
    const themeData = await help.Theme.getThemeData(help.helpCfg.Cfg)
    const img = await Render.render(
      'help/index',
      {
        helpCfg: help.helpCfg.Cfg,
        helpGroup,
        ...themeData
      }
    )
    await e.reply(img)
    return true
  }

  async versionInfo (e) {
    const md = new MarkdownIt({ html: true })
    const makdown = md.render(await fs.readFile(`${Version.Plugin_Path}/CHANGELOG.md`, 'utf-8'))
    const img = await Render.render(
      'help/version-info',
      {
        Markdown: makdown
      }
    )
    await e.reply(img)
    return true
  }
}
