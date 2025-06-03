import chalk from 'chalk'
import fs from 'fs/promises'
import { col, DataTypes, fn, literal, Op, Sequelize } from 'sequelize'

import { Version } from '#components'
import { utils } from '#models'
const dbPath = `${Version.Plugin_Path}/data`
if (!await utils.exists(dbPath)) {
  await fs.mkdir(dbPath)
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