import {  DataTypes, Op, sequelize } from './base.js'
/**
 * 定义 `preset` 表（包含 JSON 数据存储、关键字、参数、标签等）。
 */
export const table = sequelize.define('preset', {
  /**
   * 主键Id
   * @type {number}
   */
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  /**
   * 表情的快捷指令
   * @type {string}
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 表情包的键值
   * 对应预设参数的表情的键值
   * @type {string}
   */
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 对应表情选项名称
   * @type {string}
   */
  option_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 对应表情选项值
   * @type {string}
   */
  option_value: {
    type: DataTypes.STRING,
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
 * 添加或更新表情预设记录
 * @param {string} name - 表情的关键词
 * @param {string} key - 表情包键值
 * @param {string} option_name - 选项名称
 * @param {string | number} option_value - 选项值
 * @param {boolean} force - 是否强制创建新记录
 * @returns  {Promise<[Model, boolean | null]>} 创建或更新后的记录对象
 */
export async function add ({
  name,
  key,
  option_name,
  option_value
}, {
  force = false
}) {
  if (force) {
    await clear()
  }
  name = String(name)
  const data = {
    name,
    key,
    option_name,
    option_value
  }
  return await table.upsert(data)
}

/**
 * 通过表情唯一标识符获取表情快捷指令信息
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<Model | null> } 表情的信息
 */
export async function get (key) {
  return await table.findOne({
    where: {
      key
    }
  })
}

/**
 * 通过表情唯一标识符获取所有表情快捷指令信息
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<Model[]>} 表情的信息
 */
export async function getAbout (key) {
  return await table.findAll({
    where: {
      key
    }
  })
}

/**
 * 通过预设表情关键词获取表情信息
 * @param {string} keyword 表情关键词
 * @returns {Promise<Model | null>} 表情信息
 */
export async function getByKeyWord (keyword) {
  return await table.findOne({
    where: {
      name: keyword
    }
  })
}

/**
 * 通过预设表情关键词获取所有相关表情信息
 * @param {string} keyword 表情关键词
 * @returns {Promise<Model[]>} 表情信息
 */
export async function getByKeyWordAbout (keyword) {
  return await table.findAll({
    where: {
      name: {
        [Op.like]: `%${keyword}%`
      }
    }
  })
}

/**
 * 获取所有表情预设记录
 * @returns {Promise<Model[]>} 找到的记录对象数组
 */
export async function getAll () {
  return await table.findAll()
}

/**
 * 通过表情唯一标识符删除对应的表情信息
 * @param {string} key 表情的唯一标识符
 * @returns {Promise<boolean>} 删除成功与否
 */
export async function remove (key) {
  return Boolean(await table.destroy({ where: { key } }))
}

/**
 * 清空所有表情预设记录
 */
export async function clear () {
  await table.destroy({
    truncate: true
  })
  await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "preset"')
}