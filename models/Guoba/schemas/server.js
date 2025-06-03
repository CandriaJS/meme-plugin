export default [
  {
    component: 'SOFT_GROUP_BEGIN',
    label: '服务设置'
  },
  {
    field: 'server.url',
    label: '自定义地址',
    component: 'Input',
    bottomHelpMessage: '自定义表情包地址,为空时使用插件自带'
  },
  {
    field: 'server.retry',
    label: '重试次数',
    component: 'InputNumber',
    bottomHelpMessage: '最大次数,用于请求重试'
  },
  {
    field: 'server.timeout',
    label: '超时时间',
    component: 'InputNumber',
    bottomHelpMessage: '超时时间,单位为秒'
  }
]