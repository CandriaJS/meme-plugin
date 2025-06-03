export default [
  {
    component: 'SOFT_GROUP_BEGIN',
    label: '服务设置'
  },
  {
    field: 'server.mode',
    label: '服务模式',
    component: 'Select',
    bottomHelpMessage: '服务模式, 0为远程服务, 1为本地服务',
    componentProps: {
      options: [
        {
          label: '0远程服务',
          value: 0
        },
        {
          label: '本地服务',
          value: 1
        }
      ]
    }
  },
  {
    field: 'server.url',
    label: '自定义地址',
    component: 'Input',
    bottomHelpMessage: '自定义表情包地址,为空时使用插件自带'
  },
  {
    field: 'server.port',
    label: '自定义端口',
    component: 'InputNumber',
    defaultValue: 2255,
    componentProps: {
      min: 1,
      max: 65535
    }
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
  },
  {
    field: 'server.proxy_url',
    label: '代理地址',
    component: 'Input',
    bottomHelpMessage: '代理地址,如: https://github.moeyy.xyz'
  },
  {
    field: 'server.download_url',
    label: '下载地址',
    component: 'Input',
    bottomHelpMessage: '下载地址,如: https://cdn.mengze.vip/gh/MemeCrafters/meme-generator-rs@'
  }
]