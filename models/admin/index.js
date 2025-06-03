export const AdminConfig = {
  server: {
    title: '服务设置',
    cfg: {
      mode: {
        title: '服务模式',
        desc: '运行模式, 0为远程服务, 1为本地服务',
        type: 'number'
      },
      url: {
        title: '自定义地址',
        desc: '设置自定义表情服务地址',
        type: 'string'
      },
      port: {
        title: '自定义端口',
        desc: '设置自定义端口, 仅在本地服务模式下生效, 默认为2255',
        type: 'number'
      },
      retry: {
        title: '重试次数',
        desc: '重试次数, 默认为3次',
        type: 'number'
      },
      timeout: {
        title: '超时时间',
        desc: '超时时间，单位为秒',
        type: 'number'
      },
      proxy_url: {
        title: '代理地址',
        desc: '代理地址, 如: https://github.moeyy.xyz',
        type: 'string'
      },
      download_url: {
        title: '下载地址',
        desc: '下载地址, 如: https://cdn.mengze.vip/gh/MemeCrafters/meme-generator-rs@',
        type: 'string'
      }
    }
  },
  meme: {
    title: '表情设置',
    cfg: {
      enable: {
        title: '默认表情',
        desc: '是否设置为默认表情',
        type: 'boolean'
      },
      forceSharp: {
        title: '强制触发',
        desc: '是否强制使用#触发, 开启后必须使用#触发',
        type: 'boolean'
      },
      cache: {
        title: '缓存',
        desc: '是否开启头像缓存',
        type: 'boolean'
      },
      reply: {
        title: '引用回复',
        desc: '是否开启引用回复',
        type: 'boolean'
      },
      userName: {
        title: '用户昵称',
        desc: '是否开启使用用户昵称，不开则默认使用表情名称',
        type: 'boolean'
      },
      errorReply: {
        title: '错误回复',
        desc: '是否开启错误信息回复',
        type: 'boolean'
      },
      perfix: {
        title: '自定义前缀',
        desc: '设置自定义错误回复前缀',
        type: 'string'
      }
    }
  },
  access: {
    title: '名单设置',
    cfg: {
      enable: {
        title: '名单限制',
        desc: '是否开启名单限制',
        type: 'boolean'
      },
      blackListEnable: {
        title: '禁用表情列表',
        desc: '是否开启黑名单',
        type: 'boolean'
      },
      mode: {
        title: '名单模式',
        desc: '名单模式，仅在开启名单限制启用，0为白名单，1为黑名单',
        type: 'number'
      },
      userWhiteList: {
        title: '用户白名单',
        desc: '白名单，白名单模式时生效',
        type: 'array'
      },
      userBlackList: {
        title: '用户黑名单',
        desc: '用户黑名单，黑名单模式时生效',
        type: 'array'
      },
      blackList: {
        title: '黑名单表情列表',
        desc: '黑名单表情列表',
        type: 'array'
      }
    }
  },
  protect: {
    title: '表情保护设置',
    cfg: {
      enable: {
        title: '表情保护',
        desc: '是否开启表情保护',
        type: 'boolean'
      },
      master: {
        title: '主人保护',
        desc: '是否开启主人保护',
        type: 'boolean'
      },
      user: {
        title: '保护用户列表',
        desc: '设置要保护的用户，如123456',
        type: 'array'
      },
      list: {
        title: '表情保护列表',
        desc: '表情保护列表',
        type: 'array'
      }
    }
  },
  stat: {
    title: '统计设置',
    cfg: {
      enable: {
        title: '表情统计',
        desc: '是否开启表情统计',
        type: 'boolean'
      }
    }
  },
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        desc: '设置渲染精度',
        type: 'number',
        limit: '50-200'
      },
      autoUpdateRes: {
        title: '自动更新资源',
        desc: '是否自动更新表情包资源，开启后每日凌晨会自动更新',
        type: 'boolean'
      }
    }
  }
}
