import { Version } from '#components'


export const pluginInfo = {
  name: `${Version.Plugin_Name}`,
  title: `${Version.Plugin_AliasName}插件`,
  author: `@${Version.Plugin_Author}`,
  authorLink: `https://github.com/${Version.Plugin_Author}`,
  link: `https://github.com/${Version.Plugin_Author}/${Version.Plugin_Name}`,
  isV3: true,
  isV2: false,
  showInMenu: 'auto',
  description: '一个Yunzai-Bot V3的扩展插件, 提供表情包合成功能',
  icon: 'mdi:wallet-membership',
  iconColor: 'rgb(188, 202, 224)'
}