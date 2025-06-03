import { Version } from '#components'

import { Cfg } from './config.js'

export async function getThemeCfg () {
  const resPath = `${Version.Plugin_Path}/resources/help/theme`
  const mainImagePath = `${resPath}/main.webp`
  const bgImagePath = `${resPath}/bg.webp`

  return {
    main: mainImagePath,
    bg: bgImagePath,
    style: Cfg.style
  }
}
export async function getThemeData (diyStyle) {
  const helpConfig = Object.assign({}, diyStyle)
  const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
  const colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
  const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
  const theme = await getThemeCfg()
  const themeStyle = theme.style || {}
  const ret = [ `
      body { background-image: url(${theme.bg}); width: ${width}px; }
      .container { background-image: url(${theme.main}); width: ${width}px; }
      .help-table .td, .help-table .th { width: ${100 / colCount}%; }
    ` ]

  const defFnc = function (...args) {
    for (const idx in args) {
      if (args[idx] !== undefined) {
        return args[idx]
      }
    }
  }

  const css = function (sel, cssProperty, key, def, fn) {
    let val = defFnc(themeStyle[key], diyStyle[key], def)
    if (fn) {
      val = fn(val)
    }
    ret.push(`${sel} { ${cssProperty}: ${val}; }`)
  }

  css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b', undefined)
  css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none', undefined)
  css('.help-desc', 'color', 'descColor', '#eee', undefined)
  css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)', undefined)
  css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, function (n) {
    return diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`
  })
  css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)', undefined)
  css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)', undefined)
  css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)', undefined)

  return {
    style: `<style>${ret.join('\n')}</style>`,
    colCount
  }
}
