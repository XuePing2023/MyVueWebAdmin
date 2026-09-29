import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { useUserStore } from '@/stores/modules/user'
import type { ApiResponse } from '@/types/api'
import { installMock } from '@/utils/mock'
import { toast } from '@/utils/toast'

const baseURL = import.meta.env.VITE_BASE_API || '/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
})

// 请求拦截：附加 Token
service.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截：统一解包 { code, message, data }，处理业务错误与 HTTP 错误
service.interceptors.response.use(
  ((response: AxiosResponse) => {
    const res = response.data as ApiResponse
    if (typeof res !== 'object' || res === null || !('code' in res)) {
      // 非标准封装（如文件流、第三方接口），原样返回
      return res
    }
    if (res.code !== 0) {
      toast.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
    // 解包后的数据类型与 AxiosResponse 不一致，这里刻意断言
  }) as unknown as (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
  (error: AxiosError<ApiResponse>) => {
    const { response } = error
    if (response) {
      if (response.status === 401) {
        useUserStore().resetToken()
        toast.error('登录已过期，请重新登录')
        if (!window.location.pathname.startsWith('/login')) {
          const redirect = window.location.pathname + window.location.search
          window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
        }
      }
      else {
        toast.error(response.data?.message || `请求错误（${response.status}）`)
      }
    }
    else {
      toast.error(error.message || '网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  },
)

// 开箱即用：默认启用内置 Mock，无需后端即可运行（.env 中 VITE_USE_MOCK=false 关闭）
if (import.meta.env.VITE_USE_MOCK === 'true') {
  installMock(service)
}

export const http = {
  get<T = unknown>(url: string, params?: object, config?: AxiosRequestConfig) {
    return service.get<unknown, T>(url, { params, ...config })
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return service.post<unknown, T>(url, data, config)
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return service.put<unknown, T>(url, data, config)
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return service.delete<unknown, T>(url, config)
  },
}
