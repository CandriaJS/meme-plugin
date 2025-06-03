import { utils } from '#models'
export async function handleOption (
  e,
  memekey,
  userText,
  formdata,
  isPreset,
  PresetKeyWord
) {
  let options = {}
  const optionsMatches = userText.match(/#(\S+)\s+([^#]+)/g)
  const optionArray = []

  if (isPreset) {
    const presetInfo = await utils.get_preset_info_by_keyword(PresetKeyWord)
    if (!presetInfo) {
      return {
        success: false,
        message: '获取预设信息失败'
      }
    }
    optionArray.push({
      name: presetInfo.option_name,
      value: presetInfo.option_value
    })
  }
  if (optionsMatches) {
    for (const match of optionsMatches) {
      const [ , name, value ] = match.match(/#(\S+)\s+([^#]+)/) ?? null
      if (name && value) {
        optionArray.push({
          name: name.trim(),
          value: value.trim()
        })
      }
    }
  }

  const optionsInfo = (await utils.get_meme_info(memekey))?.options ?? null
  if (!optionsInfo) {
    return {
      success: false,
      message: '获取选项信息失败'
    }
  }

  const optionsArray = Array.isArray(optionsInfo)
    ? optionsInfo
    : JSON.parse(optionsInfo)

  for (const option of optionArray) {
    const supportedOption = optionsArray.find(
      (opt) => opt.name === option.name
    )
    if (!supportedOption) {
      return {
        success: false,
        message: `该表情不支持参数：${option.name}`
      }
    }

    const result = convertOptionValue(option, supportedOption)
    if (!result.success) {
      return {
        success: false,
        message: result.message
      }
    }

    options[option.name] = result.value
  }

  formdata['options'] = options
  return {
    success: true,
    text: userText.replace(/#(\S+)\s+([^#]+)/g, '').trim()
  }
}

/**
 * 转换选项值为指定类型
 *
 * @param option - 选项对象
 * @param option.name - 选项名称
 * @param option.value - 选项值（字符串形式）
 * @param supportedOption - 支持的选项类型定义
 * @returns 转换结果对象
 */
function convertOptionValue (option, supportedOption) {
  let convertedValue

  switch (supportedOption.type) {
    case 'boolean': {
      const boolValue = option.value.toLowerCase()
      if ([ 'true', '真', '是', 'yes', '1' ].includes(boolValue)) {
        convertedValue = true
      } else if ([ 'false', '假', '否', 'no', '0' ].includes(boolValue)) {
        convertedValue = false
      } else {
        return {
          success: false,
          message: `参数 ${option.name} 需要是布尔值`
        }
      }
      return { success: true, value: convertedValue }
    }

    case 'integer': {
      const intValue = parseInt(option.value)
      if (isNaN(intValue)) {
        return {
          success: false,
          message: `参数 ${option.name} 需要是整数`
        }
      }
      if (
        supportedOption.minimum !== null &&
        intValue < supportedOption.minimum
      ) {
        return {
          success: false,
          message: `参数 ${option.name} 不能小于 ${supportedOption.minimum}`
        }
      }
      if (
        supportedOption.maximum !== null &&
        intValue > supportedOption.maximum
      ) {
        return {
          success: false,
          message: `参数 ${option.name} 不能大于 ${supportedOption.maximum}`
        }
      }
      return {
        success: true,
        value: intValue
      }
    }

    case 'float': {
      const floatValue = parseFloat(option.value)
      if (isNaN(floatValue)) {
        return {
          success: false,
          message: `参数 ${option.name} 需要是数字`
        }
      }
      if (
        supportedOption.minimum !== null &&
        floatValue < supportedOption.minimum
      ) {
        return {
          success: false,
          message: `参数 ${option.name} 不能小于 ${supportedOption.minimum}`
        }
      }
      if (
        supportedOption.maximum !== null &&
        floatValue > supportedOption.maximum
      ) {
        return {
          success: false,
          message: `参数 ${option.name} 不能大于 ${supportedOption.maximum}`
        }
      }
      return {
        success: true,
        value: floatValue
      }
    }

    case 'string':
      convertedValue = option.value
      if (
        supportedOption.choices &&
        !supportedOption.choices.includes(convertedValue)
      ) {
        return {
          success: false,
          message: `参数 ${
            option.name
          } 的值必须是: ${supportedOption.choices.join(', ')} 之一`
        }
      }
      return {
        success: true,
        value: convertedValue
      }

    default:
      return {
        success: false,
        message: `不支持的参数类型：${supportedOption.type}`
      }
  }
}
