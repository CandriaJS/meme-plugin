import { guoba } from '#models'

export function supportGuoba () {
  return {
    pluginInfo: guoba.pluginInfo,
    configInfo: guoba.configInfo
  }
}