export default [
  {
    component: 'SOFT_GROUP_BEGIN',
    label: '表情设置'
  },
  {
    field: 'meme.enable',
    label: '表情',
    component: 'Switch',
    bottomHelpMessage: '是否设置当前插件的表情功能为默认表情'
  },
  {
    field: 'meme.cache',
    label: '缓存',
    component: 'Switch',
    bottomHelpMessage: '是否开启头像缓存'
  },
  {
    field: 'meme.reply',
    label: '引用回复',
    component: 'Switch',
    bottomHelpMessage: '是否开启引用回复'
  },
  {
    field: 'meme.forceSharp',
    label: '强制触发',
    component: 'Switch',
    bottomHelpMessage: '是否强制使用#触发, 开启后必须使用#触发'
  },
  {
    field: 'meme.errorReply',
    label: '错误回复',
    component: 'Switch',
    bottomHelpMessage: '是否开启错误信息回复'
  },
  {
    field: 'meme.perfix',
    label: '前缀',
    component: 'Input',
    bottomHelpMessage: '自定义错误输出前缀'
  }
]