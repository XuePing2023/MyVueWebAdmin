import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题（菜单/面包屑/标签页） */
    title?: string
    /** 菜单图标名（lucide，见 utils/icons.ts） */
    icon?: string
    /** 是否在菜单中隐藏 */
    hideInMenu?: boolean
    /** 是否在标签页中隐藏 */
    hideInTab?: boolean
    /** 是否固定标签（不可关闭） */
    affix?: boolean
    /** 是否不缓存页面（keep-alive） */
    noCache?: boolean
    /** 访问该路由所需角色，为空则不限制 */
    roles?: string[]
  }
}
