import { Guoba } from '#models'

export function supportGuoba () {
  return {
    pluginInfo: Guoba.pluginInfo,
    configInfo: Guoba.configInfo
  }
}