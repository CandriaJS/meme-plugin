import { getMemeList } from '../getMemeList.js'

export default [
  {
    component: 'SOFT_GROUP_BEGIN',
    label: '名单设置'
  },
  {
    field: 'access.enable',
    label: '名单限制',
    component: 'Switch',
    bottomHelpMessage: '是否开启名单限制'
  },
  {
    field: 'access.blackListEnable',
    label: '禁用表情列表',
    component: 'Switch',
    bottomHelpMessage: '是否开启禁用表情列表'
  },
  {
    field: 'access.mode',
    label: '名单模式',
    component: 'Select',
    bottomHelpMessage: '名单模式，仅在开启名单限制启用，0为白名单，1为黑名单',
    componentProps: {
      options: [
        {
          label: '白名单',
          value: 0
        },
        {
          label: '黑名单',
          value: 1
        }
      ]
    }
  },
  {
    field: 'access.userWhiteList',
    label: '用户白名单',
    component: 'GTags',
    bottomHelpMessage: '白名单，白名单模式时生效'
  },
  {
    field: 'access.userBlackList',
    label: '用户黑名单',
    component: 'GTags',
    bottomHelpMessage: '黑名单，黑名单模式时生效'
  },
  {
    field: 'access.blackList',
    label: '禁用表情列表',
    component: 'Select',
    bottomHelpMessage: '设置禁用表情列表，如骑',
    componentProps: {
      options: await getMemeList(),
      mode: 'multiple'
    }
  }
]