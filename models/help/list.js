export const List = [
  {
    group: '[]内为必填项,{}内为可选项, #均为可选'
  },
  {
    group: '表情命令',
    list: [
      {
        icon: 161,
        title: '#柠糖表情列表',
        desc: '获取表情列表'
      },
      {
        icon: 141,
        title: '#柠糖表情统计',
        desc: '获取表情统计'
      },
      {
        icon: 90,
        title: '#柠糖表情搜索xx',
        desc: '搜指定的表情'
      },
      {
        icon: 75,
        title: '#柠糖表情详情xx',
        desc: '获取指定表情详情'
      },
      {
        icon: 72,
        title: '#柠糖表情统计',
        desc: '获取表情统计'
      },
      {
        icon: 71,
        title: 'xx',
        desc: '如喜报xx (参数使用#参数名 参数值,, 多段文本使用/, 指定用户头像使用@+qq号)'
      }
    ]
  },
  {
    group: '图片操作命令',
    list: [
      {
        icon: 71,
        title: '#图片信息',
        desc: '获取图片信息'
      },
      {
        icon: 157,
        title: '#水平翻转',
        desc: '水平翻转图片'
      },
      {
        icon: 158,
        title: '#垂直翻转',
        desc: '垂直翻转图片'
      },
      {
        icon: 158,
        title: '#灰度化',
        desc: '灰度化图片'
      },
      {
        icon: 158,
        title: '#反色',
        desc: '反色图片'
      },
      {
        icon: 159,
        title: '#旋转 xx',
        desc: '旋转图片xx度'
      },
      {
        icon: 160,
        title: '#缩放 xx',
        desc: '缩放图片xx度'
      },
      {
        icon: 161,
        title: '#裁剪 xx,xx,xx,xx',
        desc: '裁剪图片xx度'
      },
      {
        icon: 132,
        title: '#水平拼接',
        desc: '水平拼接图片，需多张图片'
      },
      {
        icon: 132,
        title: '#垂直拼接',
        desc: '垂直拼接图片，需多张图片'
      },
      {
        icon: 123,
        title: '#gif分解',
        desc: '分解gif图片'
      },
      {
        icon: 123,
        title: '#gif合成',
        desc: '合成gif图片，需多张图片'
      },
      {
        icon: 123,
        title: '#gif变速xxxS',
        desc: '变速gif图片'
      }
    ]
  },
  {
    group: '服务端管理命令',
    auth: 'master',
    list: [
      {
        icon: 35,
        title: '#柠糖表情下载表情服务端资源',
        desc: '下载表情服务端资源'
      },
      {
        icon: 35,
        title: '#柠糖表情下载/更新表情服务端资源',
        desc: '下载/更新表情服务端资源'
      },
      {
        icon: 934,
        title: '#柠糖表情启动表情服务端',
        desc: '启动表情服务端'
      },
      {
        icon: 34,
        title: '#柠糖表情关闭表情服务端',
        desc: '关闭表情服务端'
      },
      {
        icon: 34,
        title: '#柠糖表情重启表情服务端',
        desc: '重启表情服务端'
      },
      {
        icon: 34,
        title: '#柠糖表情服务端状态',
        desc: '查看表情服务端状态'
      }
    ]
  },
  {
    group: '管理命令，仅主人可用',
    auth: 'master',
    list: [
      {
        icon: 95,
        title: '#柠糖表情{插件}{强制}更新',
        desc: '更新插件本体'
      },
      {
        icon: 81,
        title: '#柠糖表情({强制}更新资源',
        desc: '更新表情资源'
      },
      {
        icon: 85,
        title: '#柠糖表情设置',
        desc: '管理命令'
      }
    ]
  }
]
