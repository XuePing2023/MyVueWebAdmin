/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 接口基础路径 */
  readonly VITE_BASE_API: string
  /** 是否启用内置 Mock：'true' | 'false' */
  readonly VITE_USE_MOCK: string
  /** 真实后端地址（代理目标） */
  readonly VITE_API_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
