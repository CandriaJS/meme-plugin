import axios from 'axios'
import axiosRetry from 'axios-retry'

import { Config, Version } from '#components'

class Request {
  constructor () {
    this.axiosInstance = axios.create({
      timeout: Config.server.timeout * 1000,
      headers: {
        'User-Agent': `${Version.Plugin_Name}/v${Version.Plugin_Version}`
        /** 未来会针对插件提供的默认服务增加一个鉴权, 仅供插件使用或优先处理插件的请求, 这里暂时不做处理 */
      },
      proxy: false
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

  async request (config) {
    try {
      const response = await this.axiosInstance.request(config)
      return {
        success: true,
        statcode: response.status,
        data: response.data
      }
    } catch (error) {
      const errorMessage = this.handleError(error)
      return {
        success: false,
        statcode: error.code,
        data: {},
        message: errorMessage
      }
    }
  }

  /**
   * GET 请求
   */
  async get (url, params = {}, headers = {}, responseType = 'json') {
    return this.request({
      url,
      method: 'GET',
      params,
      headers: {
        ...this.axiosInstance.defaults.headers,
        ...headers
      },
      responseType
    })
  }

  /**
   * HEAD 请求
   */
  async head (url, params = {}, headers = {}) {
    return this.request({
      url,
      method: 'HEAD',
      params,
      headers: {
        ...this.axiosInstance.defaults.headers,
        ...headers
      }
    })
  }

  /**
   * POST 请求
   */
  async post (url, data = {}, headers = {}, responseType = 'json') {
    const isFormData = data instanceof FormData

    return this.request({
      url,
      method: 'POST',
      data,
      headers: {
        ...this.axiosInstance.defaults.headers,
        ...headers,
        ...(isFormData ? {} : {})
      },
      responseType
    })
  }

  /**
   * 处理错误信息
   */
  handleError (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      let errorMessage

      if (error.code === 'ECONNABORTED' || status === 502) {
        errorMessage = '网络错误'
      } else if (error.response?.data) {
        if (Buffer.isBuffer(error.response.data)) {
          errorMessage = error.response.data.toString('utf-8')
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else {
          errorMessage = JSON.stringify(error.response.data)
        }
      } else {
        errorMessage = JSON.stringify('未知错误')
      }

      return errorMessage
    } else {
      return error.toString()
    }
  }
}

export default new Request()
