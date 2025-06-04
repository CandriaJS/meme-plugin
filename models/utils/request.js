import axios from 'axios'
import axiosRetry from 'axios-retry'

import { Config, Version } from '#components'

class Request {
  axiosInstance

  constructor () {
    this.axiosInstance = axios.create({
      timeout: Config.server.timeout * 1000,
      headers: {
        'User-Agent': `${Version.Plugin_Name}/v${Version.Plugin_Version}`
      }
    })

    // 配置重试机制
    axiosRetry(this.axiosInstance, {
      retries: Config.server.retry,
      retryDelay: () => 0,
      shouldResetTimeout: true,
      retryCondition: (error) => {
        if (error.response) {
          return error.response.status === 500
        }
        return axiosRetry.isNetworkOrIdempotentRequestError(error)
      }
    })
  }

  /**
   * 发送请求
   * @param {'get' | 'post' | 'head'} method 请求方法 get post head
   * @param {string} url 请求地址
   * @param {any} data 请求数据
   * @param {Record<string, string> | null} params 请求参数
   * @param {Record<string, string> | null} headers 请求头
   * @param {'json' | 'arraybuffer'} responseType 响应类型
   * @returns 响应数据
   */
  async request (
    method,
    url,
    data,
    params,
    headers,
    responseType = 'json'
  ) {
    const config = {
      params,
      headers,
      responseType
    }

    try {
      let response
      switch (method.toLowerCase()) {
        case 'get':
          response = await this.axiosInstance.get(url, config)
          break
        case 'post':
          response = await this.axiosInstance.post(url, data, config)
          break
        case 'head':
          response = await this.axiosInstance.head(url, config)
          return {
            success: response.status >= 200 && response.status < 500,
            statusCode: response.status,
            data: Object.fromEntries(
              Object.entries(response.headers).map(([ k, v ]) => [ k.toLowerCase(), v ])
            ),
            msg: response.status >= 200 && response.status < 500 ? '请求成功' : '请求失败'
          }
        default:
          throw new Error('暂不支持该请求方法')
      }
      return {
        success: response.status >= 200 && response.status < 500,
        statusCode: response.status,
        data: response.data,
        msg: response.status >= 200 && response.status < 500 ? '请求成功' : '请求失败'
      }
    } catch (error) {
      logger.error(error)
      const axiosError = error
      const errorMessage = this.handleError(axiosError)
      return {
        success: false,
        statusCode: axiosError.response?.status ?? 500,
        data: null,
        msg: errorMessage
      }
    }
  }

  /**
   * 发送 GET 请求
   * @param {string} url 请求地址
   * @param {Record<string, string> | null} params 请求参数
   * @param {Record<string, string> | null} headers 请求头
   * @param {'json' | 'arraybuffer'}responseType 响应类型
   * @returns 响应数据
   */
  async get (
    url,
    params,
    headers,
    responseType = 'json'
  ) {
    return this.request('get', url, null, params, headers, responseType)
  }

  /**
   * 发送 HEAD 请求
   * @param {string} url 请求地址
   * @param {Record<string, string> | null} params 请求参数
   * @param {Record<string, string> | null} headers 请求头
   * @param {'json' | 'arraybuffer'}responseType 响应类型
   * @returns 响应数据
   */
  async head (
    url,
    params,
    headers,
    responseType = 'json'
  ) {
    return this.request('head', url, null, params, headers, responseType)
  }

  /**
   * 发送 POST 请求
   * @param {string} url 请求地址
   * @param {any} data 请求数据
   * @param {Record<string, string> | null} headers 请求头
   * @param {'json' | 'arraybuffer'} responseType 响应类型
   * @returns 响应数据
   */
  async post (
    url,
    data,
    headers,
    responseType = 'json'
  ) {
    return this.request('post', url, data, null, headers, responseType)
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @returns 错误信息
   */
  handleError (error) {
    if (axios.isAxiosError(error)) {
      let errorMessage

      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接'
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = '网络连接异常, 请检查网络连接'
      } else if (error.response?.data) {
        if (Buffer.isBuffer(error.response.data)) {
          errorMessage = error.response.data.toString()
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else {
          errorMessage = JSON.stringify(error.response.data)
        }
      } else if (error.response?.statusText) {
        errorMessage = error.response.statusText.toString()
      } else if (error.message) {
        errorMessage = error.message
      } else {
        errorMessage = '未知网络错误'
      }

      return errorMessage
    } else {
      return error?.message ?? error
    }
  }
}

export default new Request()