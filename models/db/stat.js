import { DataTypes, sequelize } from './base.js'

/**
* 定义 'stat' 表模型，用于存储 key 和 all 值。
* @type {Sequelize.Model}
*/
export const table = sequelize.define('stat', {
  /**
  * 唯一的 key 值
  * @type {DataTypes.STRING}
  */
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  /**
  * all 值，默认为 0
  * @type {DataTypes.INTEGER}
  */
  all: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
* 添加或更新统计信息。如果 key 存在，则更新 all 的值；如果 key 不存在，则创建新的记录。
*
* @async
* @function add
* @param {string} key - meme 的 key 值。
* @param {number} all - meme 的 all 值。
* @returns 返回创建或更新的记录
*/
export async function add (key, all) {
  return await table.upsert({ key, all })
}

/**
* 获取指定统计的信息。
*
* @async
* @function get
* @param {string} key - 要查询的 meme 的 key 值。
* @param {string} field - 要查询的字段名 (例如: 'all', 'key')。
* @returns 返回查询到的字段值，如果记录不存在或字段不存在则返回 null。
*/
export async function get (key, field) {
  const record = await table.findOne({
    where: { key },
    attributes: [ field ]
  })
  return record?.[field] ?? null
}

export async function getAll () {
  return await table.findAll()
}