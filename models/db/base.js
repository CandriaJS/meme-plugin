import fs from 'node:fs'

import chalk from 'chalk'
import { col, DataTypes, fn, literal, Op, Sequelize } from 'sequelize'

import { Version } from '#components'

import * as Utils from '../Utils/index.js'

const dbPath = `${Version.Plugin_Path}/data`
if (!await Utils.Common.fileExistsAsync(dbPath)) {
  fs.mkdirSync(dbPath)
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${dbPath}/data.db`,
  logging: false
})
/** 测试连接 */
try {
  await sequelize.authenticate()
  logger.debug(chalk.bold.cyan(`[${Version.Plugin_AliasName}] 数据库连接成功`))
} catch (error) {
  logger.error(chalk.bold.cyan(`[${Version.Plugin_AliasName}] 数据库连接失败: ${error}`))
}

export {
  col,
  DataTypes,
  fn,
  literal,
  Op,
  sequelize
}