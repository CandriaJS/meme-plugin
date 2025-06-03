import { DataTypes, sequelize } from './base.js'

const stat = sequelize.define('stat', {
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '群组ID'
  },
  memeKey: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '表情ID'
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用次数'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await stat.sync()

/**
 * 增加表情统计信息
 * @param groupId 群组ID
 * @param memeKey 表情ID
 */
export async function add ({
  groupId,
  memeKey,
  count
}) {
  const data = {
    groupId,
    memeKey,
    count
  }
  return await stat.upsert(data)
}

/**
 * 获取表情统计信息
 * @param groupId 群组ID
 * @param memeKey 表情ID
 * @returns 表情统计信息
 */
export async function get ({
  groupId,
  memeKey
}) {
  return await stat.findOne({
    where: {
      groupId,
      memeKey
    }
  })
}

/**
 * 获取所有表情统计信息
 * @returns 所有表情统计信息
 */
export async function getAll () {
  return await stat.findAll()
}

/**
 * 获取指定群组的所有表情统计信息
 * @param groupId 群组ID
 * @returns 该群组的所有表情统计信息
 */
export async function getAllByGroupId (groupId) {
  return await stat.findAll({
    where: {
      groupId
    }
  })
}
