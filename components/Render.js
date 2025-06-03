import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { Config } from './Config.js'
import { Version } from './Version.js'

function scale (pct = 1) {
  const renderScale = Config.other.renderScale || 100
  const scale = Math.min(2, Math.max(0.5, renderScale / 100))
  pct = pct * scale
  return `style=transform:scale(${pct})`
}

export const Render = {
  /**
   *
   * @param {string} path html模板路径
   * @param {*} params 模板参数
   * @param {*} cfg 渲染参数
   * @param {boolean} multiPage 是否分页截图，默认false
   * @returns
   */
  async render (path, params) {
    path = path.replace(/.html$/, '')
    const savePath = `${path.replace('html/', '')}`
    const data = {
      _Plugin_AliasName: `${Version.Plugin_AliasName}`,
      _res_path: `${Version.Plugin_Path}/resources`.replace(/\\/g, '/'),
      _layout_path: `${Version.Plugin_Path}/resources/common/layout/`.replace(/\\/g, '/'),
      defaultLayout: `${Version.Plugin_Path}/resources/common/layout/default.html`.replace(/\\/g, '/'),
      sys: {
        scale: scale(params?.scale || 1)
      },
      copyright: `${Version.Bot_Name}<span class="version"> ${Version.Bot_Version}</span> & ${Version.Plugin_Name}<span class="version"> ${Version.Plugin_Version}`,
      pageGotoParams: {
        waitUntil: 'networkidle0',
        timeout: 60000
      },
      tplFile: `${Version.Plugin_Path}/resources/${path}.html`,
      pluResPath: `${Version.Plugin_Path}/resources/`,
      saveId: path.split('/').pop(),
      imgType: 'jpeg',
      multiPage: true,
      multiPageHeight: 12000,
      ...params
    }
    return await puppeteer.screenshots(`${Version.Plugin_Name}/${savePath}`, data)
  }
}
