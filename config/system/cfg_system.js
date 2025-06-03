const cfgSchema = {
  server: {
    title: '服务设置',
    cfg: {
      url: {
        title: '自定义地址',
        desc: '设置表情包的地址, 留空时使用自带',
        type: 'string',
        def: ''
      },
      retry: {
        title: '重试次数',
        desc: '重试次数, 默认为3次',
        type: 'number',
        def: 3
      },
      timeout: {
        title: '超时时间',
        desc: '超时时间，单位为秒',
        type: 'number',
        def: 5
      }
    }
  },
  meme: {
    title: '表情设置',
    cfg: {
      enable: {
        title: '默认表情',
        desc: '是否设置为默认表情',
        type: 'boolean',
        def: true
      },
      forceSharp: {
        title: '强制触发',
        desc: '是否强制使用#触发, 开启后必须使用#触发',
        type: 'boolean',
        def: false
      },
      cache: {
        title: '缓存',
        desc: '是否开启头像缓存',
        type: 'boolean',
        def: true
      },
      reply: {
        title: '引用回复',
        desc: '是否开启引用回复',
        type: 'boolean',
        def: false
      },
      userName: {
        title: '用户昵称',
        desc: '是否开启使用用户昵称，不开则默认使用表情名称',
        type: 'boolean',
        def: false
      },
      imagesInMessage: {
        title: '消息图片',
        desc: '是否开启消息中的图片, 开启后会获取消息中的图片',
        type: 'boolean',
        def: true
      },
      quotedImages: {
        title: '引用图片',
        desc: '是否开启引用图片, 开启后会获取引用消息中的图片',
        type: 'boolean',
        def: true
      },
      errorReply: {
        title: '错误回复',
        desc: '是否开启错误信息回复',
        type: 'boolean',
        def: true
      }
    }
  },
  access: {
    title: '名单设置',
    cfg: {
      enable: {
        title: '名单限制',
        desc: '是否开启名单限制',
        type: 'boolean',
        def: false
      },
      blackListEnable: {
        title: '禁用表情列表',
        desc: '是否开启黑名单',
        type: 'boolean',
        def: false
      },
      mode: {
        title: '名单模式',
        desc: '名单模式，仅在开启名单限制启用，0为白名单，1为黑名单',
        type: 'number',
        def: 0
      },
      userWhiteList: {
        title: '用户白名单',
        desc: '白名单，白名单模式时生效',
        type: 'list',
        def: []
      },
      userBlackList: {
        title: '用户黑名单',
        desc: '用户黑名单，黑名单模式时生效',
        type: 'list',
        def: []
      },
      blackList: {
        title: '黑名单表情列表',
        desc: '黑名单表情列表',
        type: 'list',
        def: []
      }
    }
  },
  protect: {
    title: '表情保护设置',
    cfg: {
      enable: {
        title: '表情保护',
        desc: '是否开启表情保护',
        type: 'boolean',
        def: false
      },
      master: {
        title: '主人保护',
        desc: '是否开启主人保护',
        type: 'boolean',
        def: false
      },
      user: {
        title: '保护用户列表',
        desc: '设置要保护的用户，如123456',
        type: 'list',
        def: []
      },
      list: {
        title: '表情保护列表',
        desc: '表情保护列表',
        type: 'list',
        def: []
      }
    }
  },
  stat: {
    title: '统计设置',
    cfg: {
      enable: {
        title: '表情统计',
        desc: '是否开启表情统计',
        type: 'boolean',
        def: false
      }
    }
  },
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        type: 'number',
        desc: '可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
        def: 100
      }
    },
    autoUpdateRes: {
      title: '自动更新资源',
      desc: '是否自动更新表情包资源，开启后每日凌晨会自动更新',
      type: 'boolean',
      def: false
    }
  }
}

export default cfgSchema
