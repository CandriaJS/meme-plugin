import { getMemeList } from '../getMemeList.js'

export default [
  {
    component: 'SOFT_GROUP_BEGIN',
    label: '表情保护设置'
  },
  {
    field: 'protect.enable',
    label: '表情保护',
    component: 'Switch',
    bottomHelpMessage: '是否开启表情保护'
  },
  {
    field: 'protect.master',
    label: '主人保护',
    component: 'Switch',
    bottomHelpMessage: '是否开启主人保护'
  },
  {
    field: 'protect.userEnable',
    label: '用户保护',
    component: 'Switch',
    bottomHelpMessage: '是否开启用户保护'
  },
  {
    field: 'protect.user',
    label: '保护用户列表',
    component: 'GTags',
    bottomHelpMessage: '设置要保护的用户，如123456'
  },
  {
    field: 'protect.list',
    label: '保护表情列表',
    component: 'Select',
    bottomHelpMessage: '设置要保护表情列表，如骑',
    componentProps: {
      options: await getMemeList(),
      mode: 'multiple'
    }
  }
]