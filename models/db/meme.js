import { DataTypes, literal, Op, sequelize } from './base.js'

export const table = sequelize.define('meme', {
  /**
   * 主键 ID
   * @type {number}
   */
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  /**
   * 唯一标识符
   * @type {string}
   */
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  /**
   * 关键字列表
   * @type {string[]}
   */
  keyWords: {
    type: DataTypes.JSON,
    allowNull: false
  },

  /**
   * 最小文本数量
   * @type {number}
   */
  min_texts: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  /**
   * 最大文本数量
   * @type {number}
   */
  max_texts: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  /**
   * 最小图片数量
   * @type {number}
   */
  min_images: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  /**
   * 最大图片数量
   * @type {number}
   */
  max_images: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  /**
   * 默认文本
   * @type {string[]}
   */
  default_texts: {
    type: DataTypes.JSON,
    allowNull: true
  },

  /**
   * 参数类型
   * @type {object}
   */
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  /**
   * 标签
   * @type {string[]}
   */
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
 * 添加表情信息
 * @param {object} data 表情信息
 * - key 唯一标识符
 * - keyWords 关键字列表
 * - min_texts 最小文本数量
 * - max_texts 最大文本数量
 * - min_images 最小图片数量
 * - max_images 最大图片数量
 * - default_texts 默认文本
 * - options 参数类型
 * - tags 标签
 * @param {object} options 选项
 * - force 是否强制添加
 * @returns {Promise<[Model, boolean | null]>} 表情信息
 */
export async function add ({
  key,
  keyWords,
  min_texts,
  max_texts,
  min_images,
  max_images,
  default_texts,
  options,
  tags
}, {
  force = false
}) {
  if (force) {
    await clear()
  }
  const data = {
    key,
    keyWords,
    min_texts,
    max_texts,
    min_images,
    max_images,
    default_texts,
    options,
    tags
  }
  return await table.upsert(data)
}

/**
 * 通过表情唯一标识符获取表情信息
 * @param {string }key 表情的唯一标识符
 * @returns 表情的信息
 */
export async function get (key) {
  return await table.findOne({
    where: {
      key
    }
  })
}

/**
 * 通过表情唯一标识符模糊获取所有相关的表情信息
 * @param {string} key 表情的唯一标识符
 * @returns 表情的信息列表
 */
export async function getKeysByAbout (key) {
  return await table.findAll({
    where: {
      key: {
        [Op.like]: `%${key}%`
      }
    }
  })
}

/**
 * 通过表情关键词获取表情信息
 * @param {string} keyword 表情的关键字
 * @returns 表情信息
 */
export async function getByKeyWord (keyword) {
  return await table.findOne({
    where: literal(`json_extract(keyWords, '$') LIKE '%"${keyword}"%'`)
  })
}

/**
 * 通过表情关键词模糊获取所有相关的表情信息
 * @param {string} keywod 关键词
 * @returns 表情信息
 */
export async function getKeyWordsByAbout (keyword) {
  return await table.findAll({
    where: literal(`json_extract(keyWords, '$') LIKE '%${keyword}%'`)
  })
}

/**
 * 通过表情标签获取表情信息
 * @param {string} tag 表情的标签
 * @returns 表情信息
 */
export async function getByTag (tag) {
  return await table.findOne({
    where: literal(`json_extract(tags, '$') LIKE '%"${tag}"%'`)
  })
}

/**
 * 通过表情标签模糊获取所有相关的表情信息
 * @param {string} tag 标签关键词
 * @returns 表情信息列表
 */
export async function getTagsByAbout (tag) {
  return await table.findAll({
    where: literal(`json_extract(tags, '$') LIKE '%${tag}%'`)
  })
}

/**
 * 获取表情信息列表
 * @returns 表情信息列表
 */
export async function getAll () {
  return await table.findAll()
}

/**
 * 清空所有表情信息
 */
export async function clear () {
  await table.destroy({
    truncate: true
  })
  await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "meme"')
}