# 变更日志

## [2.1.1](https://github.com/CandriaJS/meme-plugin/compare/v2.1.0...v2.1.1) (2025-06-07)


### 🐛 错误修复

* 修复Miao-Yunzai获取用户昵称兼容性 ([20b059a](https://github.com/CandriaJS/meme-plugin/commit/20b059a869c21e6706779b024e61148f97f6eead))


### 🎨 代码样式

* 优化状态页面样式和布局 ([1c2e586](https://github.com/CandriaJS/meme-plugin/commit/1c2e5860c867a4d914e16bee42fbd010b7f69f7f))

## [2.1.0](https://github.com/CandriaJS/meme-plugin/compare/v2.0.1...v2.1.0) (2025-06-06)


### ✨ 新功能

* **server:** 动态获取本地 IP 地址 ([707d6db](https://github.com/CandriaJS/meme-plugin/commit/707d6dba6a5c09fda515efb57ac2f21523db495e))
* **server:** 添加 base64 上传功能 ([c07b48f](https://github.com/CandriaJS/meme-plugin/commit/c07b48faddfbe26517d19681eff9e71f04e7961a))
* **server:** 添加端口占用检查和进程杀死功能 ([9120261](https://github.com/CandriaJS/meme-plugin/commit/9120261a4bf8057b77fbc911e955057fac8628df))


### 🐛 错误修复

* **info:** 修复 meme 预览图片无法显示的问题 ([a6cd941](https://github.com/CandriaJS/meme-plugin/commit/a6cd94112f1d0af3ffccfe6dc08c267a9bd3d311))
* **models:** 优化网络错误处理逻辑 ([0b7c1c6](https://github.com/CandriaJS/meme-plugin/commit/0b7c1c6770ab64d298c2c141b2727a0886d3aab9))
* **models:** 修复头像缓存逻辑 ([bb4cad7](https://github.com/CandriaJS/meme-plugin/commit/bb4cad70d1a8c1f57b6b2ee73928fd4d21799334))
* 传入1张图的头像处理 ([acc481f](https://github.com/CandriaJS/meme-plugin/commit/acc481fe4fcb7fc360d3107dacf40b54312bba12))
* 修正消息段输出 ([4a094fe](https://github.com/CandriaJS/meme-plugin/commit/4a094feed18c415e500b4b09712d6d3e5ddd1e02))
* 图片上传 ([c852d36](https://github.com/CandriaJS/meme-plugin/commit/c852d36d47220ba9685fc0afae4ffe20a5703cbe))
* 服务端状态正则 ([26afb6b](https://github.com/CandriaJS/meme-plugin/commit/26afb6b002e46ff45a2a380e58f17a9584d37a6f))
* 空数据处理 ([6752d77](https://github.com/CandriaJS/meme-plugin/commit/6752d773c3f902c6927bf73f748a05503ae1cf11))


### ♻️ 代码重构

* **imageTool:** 重构图像处理逻辑 ([900029e](https://github.com/CandriaJS/meme-plugin/commit/900029e2ef6848945d10d888ff0273ef8ac614f3))
* **models:** 优化Miao-Yunzai引用消息兼容性 ([1543740](https://github.com/CandriaJS/meme-plugin/commit/15437408ec874e5ceaa65aac69eb6ef76b650277))
* **models:** 优化图片上传逻辑 ([985c5fb](https://github.com/CandriaJS/meme-plugin/commit/985c5fbc03f64a1be12d6d344ddf8dc94ec3c123))

## [2.0.1](https://github.com/CandriaJS/meme-plugin/compare/v2.0.0...v2.0.1) (2025-06-03)


### 🐛 错误修复

* 载入导入 ([939647f](https://github.com/CandriaJS/meme-plugin/commit/939647f635b526774676adad15f26a2e34ded2d2))
* 锅巴导入 ([3c763d5](https://github.com/CandriaJS/meme-plugin/commit/3c763d5ec635e8086e81027bc2519d9e41a66f2b))

## [2.0.0](https://github.com/CandriaJS/meme-plugin/compare/v1.17.1...v2.0.0) (2025-06-03)


### ⚠ BREAKING CHANGES

* 迁移至Rust 表情包Api ([#5](https://github.com/CandriaJS/meme-plugin/issues/5))

### ✨ 新功能

* **plugins:** 重构表情插件并添加新功能 ([099dfff](https://github.com/CandriaJS/meme-plugin/commit/099dfffffc6833ff40aa58210627c88a9296bacf))
* 迁移至Rust 表情包Api ([#5](https://github.com/CandriaJS/meme-plugin/issues/5)) ([3b9a95c](https://github.com/CandriaJS/meme-plugin/commit/3b9a95c5d9d29cee24253fd68a9b550329bc0665))


### 📝 文档更新

* 更新 issue 模板并优化文档链接 ([4cf35ab](https://github.com/CandriaJS/meme-plugin/commit/4cf35ab1b4dbdc70a34e06c6e0896940ed5d6db5))
* 更新文档信息 ([9110dd0](https://github.com/CandriaJS/meme-plugin/commit/9110dd0495ce5f844985b8f410e4c3dbf11f1e2c))

## [1.17.1](https://github.com/CandriaJS/meme-plugin/compare/v1.17.0...v1.17.1) (2025-06-03)


### 🔧 其他更新

* 误删仓库，恢复 ([94f4b06](https://github.com/CandriaJS/meme-plugin/commit/94f4b06c1067a8a5e20d263dde24214ad2c7a54e))

## [1.17.0](https://github.com/CandriaJS/meme-plugin/compare/v1.16.1...v1.17.0) (2025-04-24)


### ✨ 新功能

* **config:** 添加表情保护设置功能 ([eda6546](https://github.com/CandriaJS/meme-plugin/commit/eda654662825c5a649ddf862451efb412b2662c4))
* **models:** 添加表情保护功能 ([25fa86e](https://github.com/CandriaJS/meme-plugin/commit/25fa86ed64c02b8fad6747364a8d4de462ec4600))


### 🐛 错误修复

* **apps:** 修复优化统计模块数据处理逻辑 ([b9fe4a6](https://github.com/CandriaJS/meme-plugin/commit/b9fe4a60816c9d81644b34527776ad6b8a56d95e))
* **config:** 修复指令无法添加黑名单表情列表 ([12d5c95](https://github.com/CandriaJS/meme-plugin/commit/12d5c95ab5f8e339d29903494c1d986ae2cdec5e))
* **models:** 修复生成昵称和性别时的用户 ID 引用错误 ([804d6d1](https://github.com/CandriaJS/meme-plugin/commit/804d6d11d97f53f540efb4c9216522b7d5d03be5))


### ⚡️ 性能优化

* 重构静态站并使用新的静态站资源 ([411371b](https://github.com/CandriaJS/meme-plugin/commit/411371b76ad8d00cab761c1ffe85ae2ef85ecc94))


### 🎨 代码样式

* **common:** 更新 YS 字体资源链接 ([6337e2f](https://github.com/CandriaJS/meme-plugin/commit/6337e2f2f18c269e8dcf129f92681079b0e389c7))


### ♻️ 代码重构

* **apps:** 优化 stat.js 文件 ([b8c23b5](https://github.com/CandriaJS/meme-plugin/commit/b8c23b56d1262e007b0c3c2b052f0295c5ed681e))
* **apps:** 重构表情列表和统计页面 ([73ac96f](https://github.com/CandriaJS/meme-plugin/commit/73ac96f17ef10cd1b2f3f66225370901e7c4faa0))
* **db:** 优化数据库操作逻辑 ([ee27e15](https://github.com/CandriaJS/meme-plugin/commit/ee27e15f37b039b4278e845825eca34bd4d16634))
* **models:** 优化 add 函数并移除冗余代码 ([bec299c](https://github.com/CandriaJS/meme-plugin/commit/bec299c2000255e9aef608153df8bee46e6a0f67))
* **models:** 优化 Meme 模型中处理图片的逻辑 ([e58e85b](https://github.com/CandriaJS/meme-plugin/commit/e58e85b7b04319544e9f236303cf2963d29c7712))
* **models:** 移除 GIF 相关功能 ([c96ae46](https://github.com/CandriaJS/meme-plugin/commit/c96ae468969df148bd3d5514c759e0f126ed0504))
* **models:** 移除表情包快捷方式相关代码 ([20f8f20](https://github.com/CandriaJS/meme-plugin/commit/20f8f20f332e31270c7f2c13757833e61cd997ea))
* **update:** 移除更新检查相关代码 ([db62463](https://github.com/CandriaJS/meme-plugin/commit/db62463e7f7b74ebfbd59d7814e5689550d0adef))
* **update:** 移除更新检查相关功能 ([d299e19](https://github.com/CandriaJS/meme-plugin/commit/d299e1927a6874e1a66d82dde79e551a7f722d2c))


### 🎡 持续集成

* **release:** 更新获取最新标签的命令 ([71afafa](https://github.com/CandriaJS/meme-plugin/commit/71afafaec53a402a2f471fa2653e5eab2e3e18e9))
