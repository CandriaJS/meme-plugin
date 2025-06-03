import { col, DataTypes, fn, literal, Op, sequelize } from './base.js'

/**
 * 定义 `meme` 表（包含 JSON 数据存储、关键字、参数、标签等）
 */
export const table = sequelize.define('meme', {
  /**
   * 唯一标识符
   * @type {string}
   */
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  /**
   * 存储信息的 JSON 字段
   * @type {object}
   */
  info: {
    type: DataTypes.JSON,
    allowNull: false
  },
  /**
   * 关键字列表（JSON 数组）
   * @type {string[]}
   */
  keyWords: {
    type: DataTypes.JSON,
    allowNull: false
  },
  /**
   * 参数列表（JSON 数组）
   * @type {object}
   */
  params: {
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
   * 默认文本（可选 JSON 数组）
   * @type {string[] | null}
   */
  defText: {
    type: DataTypes.JSON,
    allowNull: true
  },
  /**
   * 参数类型（可选 JSON 字段）
   * @type {object | null}
   */
  args_type: {
    type: DataTypes.JSON,
    allowNull: true
  },
  /**
   * 标签（可选 JSON 数组）
   * @type {string[] | null}
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
 * 添加或更新表情包记录。
 *
 * 如果 `force` 为 `true`，将删除现有的记录并重新创建新的记录。
 * 如果 `force` 为 `false`，将更新现有的记录（如果存在），否则创建新的记录。
 *
 * @param {string} key - 表情包的唯一标识符
 * @param {object} info - 存储表情包的基本信息（JSON 格式）
 * @param {string[] | null} keyWords - 表情包的关键字（JSON 数组），如果没有提供，传 `null`
 * @param {object | null} params - 表情包的参数（JSON 格式），如果没有提供，传 `null`
 * @param {number} min_texts - 表情包的最小文本数量
 * @param {number} max_texts - 表情包的最大文本数量
 * @param {number} min_images - 表情包的最小图片数量
 * @param {number} max_images - 表情包的最大图片数量
 * @param {string[] | null} defText - 默认文本数组（可选），如果没有提供，传 `null`
 * @param {object | null} args_type - 参数类型（JSON 格式，可选），如果没有提供，传 `null`
 * @param {string[] | null} tags - 表情包的标签（JSON 数组，可选），如果没有提供，传 `null`
 * @param {object} options - 选项对象，包含 `force` 属性来控制是否全量更新（默认为 `false`，表示增量更新）
 */
export async function add (
  key,
  info,
  keyWords,
  params,
  min_texts,
  max_texts,
  min_images,
  max_images,
  defText,
  args_type,
  tags,
  { force = false }
) {
  const data = {
    key,
    info,
    keyWords,
    params,
    min_texts,
    max_texts,
    min_images,
    max_images,
    defText,
    args_type,
    tags
  }

  if (force) {
    await table.destroy({ where: { key } })
  }

  return await table.upsert(data)
}


/**
 * 通过 key 查询表情包数据
 * @param {string} key - 唯一标识符
 * @returns 返回查询到的记录或 null
 */
export async function get (key) {
  return await table.findOne({
    where: { key }
  })
}

/**
 * 通过 key 查询指定字段的值
 * @param {string} key - 表情包的唯一标识符
 * @param {string | string[]} name - 需要查询的字段（支持单个或多个字段）
 * @returns 返回查询到的数据或 null
 */
export async function getByKey (key, name = '*') {
  const queryOptions = {}

  if (name !== '*' && Array.isArray(name)) {
    queryOptions.attributes = name
  } else if (name !== '*') {
    queryOptions.attributes = [ name ]
  }

  const res = await table.findByPk(key, queryOptions)

  if (!res) return null

  if (typeof name === 'string' && name !== '*') {
    return res[name] ?? null
  }

  return res.toJSON()
}

/**
 * 通过指定字段查询数据（支持 JSON 数组、字符串、数值）
 * @param {string} field - 需要查询的字段（可能是 JSON 或字符串）
 * @param {string | number | string[] | number[]} value - 需要匹配的值（支持多个）
 * @param {string | string[]} returnField - 返回字段（默认 key）
 * @returns 返回符合条件的记录
 */
export async function getByField (field, value, returnField = 'key') {
  if (!field) {
    throw new Error('查询字段不能为空')
  }

  const values = Array.isArray(value) ? value : [ value ]

  const whereConditions = values.map(v => {
    if (typeof v === 'number') {
      return { [field]: v }
    }
    return {
      [Op.or]: [
        { [field]: v },
        literal(`CASE WHEN json_valid(${field}) THEN EXISTS (SELECT 1 FROM json_each(${field}) WHERE json_each.value = '${v}') ELSE 0 END`)
      ]
    }
  })

  const whereClause = { [Op.and]: whereConditions }

  const attributes = Array.isArray(returnField) ? returnField : [ returnField ]

  const res = await table.findAll({
    attributes,
    where: whereClause
  })

  return Array.isArray(returnField)
    ? res.map(item => item.toJSON())
    : res.map(item => item[returnField])
}

/**
 * 通过字段名查询所有不同的值
 * @param {string} name - 需要查询的字段
 * @returns 返回该字段的所有值
 */
export async function getAllSelect (name) {
  const res = await table.findAll({
    attributes: [ [ fn('DISTINCT', col(name)), name ] ]
  })
  return res.map(item => item[name])
}

/**
 * 获取所有记录
 * @returns 返回所有记录
 */
export async function getAll () {
  return await table.findAll()
}

/**
 * 删除指定 key 的表情包记录
 * @param {string} key - 需要删除的表情包的唯一标识符
 * @returns {Promise<boolean>} - 如果成功删除返回 `true`，否则返回 `false`
 */
export async function remove (key) {
  return Boolean(await table.destroy({ where: { key } }))
}
