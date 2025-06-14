import { utils } from '#models'

/**
 * 获取图片
 * @param image_id 图片 ID
 * @param type 返回类型 base64 或 buffer  默认 base64
 * @returns 图片
 */
export const get_image = async (image_id, type = 'base64') => {
  try {
    const url = await utils.get_base_url()
    const res = await utils.Request.get(`${url}/image/${image_id}`, {}, {}, 'arraybuffer')
    switch (type) {
      case 'buffer':
        return res.data
      case 'base64':
      default:
        return await utils.get_image_base64(res.data)
    }
  } catch (error) {
    throw new Error(`获取图片失败: ${erro.message}`)
  }
}
/**
 * 获取图片信息
 * @param image_id 图片 ID
 * @returns 图片信息
 */
export const get_image_info = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/inspect`, data)
    return res.data
  } catch (error) {
    throw new Error(`获取图片信息失败: ${error.message}`)
  }
}

/**
 * 水平翻转图片
 * @param image_id 图片 ID
 * @returns 图片 ID
 */
export const flip_horizontal = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/flip_horizontal`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`水平翻转图片失败: ${error.message}`)
  }
}

/**
 * 垂直翻转图片
 * @param image_id 图片id
 * @returns 图片id
 */
export const flip_vertical = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/flip_vertical`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`垂直翻转图片失败: ${error.message}`)
  }
}

/**
 * 旋转图片
 * @param image_id 图片id
 * @param degrees 旋转角度
 * @returns 图片id
 */
export const rotate = async (image_id, degrees) => {
  try {
    const data = {
      image_id,
      degrees
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/rotate`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`旋转图片失败: ${error.message}`)
  }
}

/**
 * 缩放图片
 * @param image_id 图片id
 * @param width 宽度
 * @param height 高度
 * @returns 图片id
 */
export const resize = async (image_id, width, height) => {
  try {
    const data = {
      image_id,
      width,
      height
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/resize`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`缩放图片失败: ${error.message}`)
  }
}

/**
 * 裁剪图片
 * @param image_id 图片id
 * @param left 左
 * @param top 上
 * @param right 右
 * @param bottom 下
 * @returns 图片id
 */
export const crop = async (image_id, left, top, right, bottom) => {
  try {
    const data = {
      image_id,
      left,
      top,
      right,
      bottom
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/crop`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`裁剪图片失败: ${error.message}`)
  }
}

/**
 * 灰度化图片
 * @param image_id 图片id
 * @returns 图片id
 */
export const grayscale = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/grayscale`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`灰度化图片失败: ${error.message}`)
  }
}

/**
 * 反色图片
 * @param image_id 图片id
 * @returns 图片id
 */
export const invert = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/invert`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`反色图片失败: ${error.message}`)
  }
}

/**
 * 水平拼接图片
 * @param image_ids 图片id数组
 * @returns 图片id
 */
export const merge_horizontal = async (image_ids) => {
  try {
    const data = {
      image_ids
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/merge_horizontal`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`水平拼接图片失败: ${error.message}`)
  }
}

/**
 * 垂直拼接图片
 * @param image_ids 图片id数组
 * @returns 图片id
 */
export const merge_vertical = async (image_ids) => {
  try {
    const data = {
      image_ids
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/merge_vertical`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`垂直拼接图片失败: ${error.message}`)
  }
}

/**
 * gif分解
 * @param image_id 图片id
 * @returns 图片id数组
 */
export const gif_split = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/gif_split`, data)
    return res.data.image_ids
  } catch (error) {
    throw new Error(`gif分解失败: ${error.message}`)
  }
}

/**
 * gif合成
 * @param image_ids 图片id数组
 * @returns 图片id
 */
export const gif_merge = async (image_ids) => {
  try {
    const data = {
      image_ids
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/gif_merge`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`gif合成失败: ${error.message}`)
  }
}

/**
 * gif反转
 * @param image_id 图片id
 * @returns 图片id
 */
export const gif_reverse = async (image_id) => {
  try {
    const data = {
      image_id
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/gif_reverse`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`gif反转失败: ${error.message}`)
  }
}

/**
 * gif变速帧率
 * @param image_id 图片id
 * @param duration 图片帧率间隔
 * @returns 图片id
 */
export const gif_change_duration = async (image_id, duration) => {
  try {
    const data = {
      image_id,
      duration
    }
    const url = await utils.get_base_url()
    const res = await utils.Request.post(`${url}/tools/image_operations/gif_change_duration`, data)
    return res.data.image_id
  } catch (error) {
    throw new Error(`gif变速帧率失败: ${error.message}`)
  }
}
