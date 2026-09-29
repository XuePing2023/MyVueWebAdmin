import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
  path: string
  title: string
  name: string
  icon?: string
  affix?: boolean
  noCache?: boolean
}

/** 多标签页状态：配合 keep-alive 实现页面缓存与刷新 */
export const useTabStore = defineStore('tab', () => {
  const tabs = ref<TabItem[]>([])
  /** 刷新计数器：作为 <component :key> 的一部分，自增可强制重挂载当前页面 */
  const reloadFlag = ref(0)

  const cachedViews = computed(() =>
    tabs.value.filter(t => !t.noCache && t.name).map(t => t.name),
  )

  function addTab(route: RouteLocationNormalized) {
    const { title, icon, affix, noCache, hideInTab } = route.meta
    if (!title || hideInTab) return
    if (tabs.value.some(t => t.path === route.path)) return
    tabs.value.push({
      path: route.path,
      title,
      icon,
      name: String(route.name ?? ''),
      affix,
      noCache,
    })
  }

  /** 关闭标签；若关闭的是当前页，返回应跳转的路径 */
  function closeTab(path: string, currentPath: string): string | null {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index === -1) return null
    tabs.value.splice(index, 1)
    if (path !== currentPath) return null
    const next = tabs.value[index] ?? tabs.value[index - 1]
    return next?.path ?? '/'
  }

  /** 关闭其他标签；若当前页被关闭，返回应跳转的路径 */
  function closeOthers(path: string, currentPath: string): string | null {
    tabs.value = tabs.value.filter(t => t.path === path || t.affix)
    if (!tabs.value.some(t => t.path === currentPath)) return path
    return null
  }

  /** 关闭右侧标签；若当前页被关闭，返回应跳转的路径 */
  function closeRight(path: string, currentPath: string): string | null {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index === -1) return null
    tabs.value = tabs.value.slice(0, index + 1)
    if (!tabs.value.some(t => t.path === currentPath)) return path
    return null
  }

  /** 关闭全部标签；返回应跳转的路径 */
  function closeAll(currentPath: string): string | null {
    tabs.value = tabs.value.filter(t => t.affix)
    if (!tabs.value.some(t => t.path === currentPath)) {
      return tabs.value[0]?.path ?? '/'
    }
    return null
  }

  /** 刷新当前页面 */
  function refresh() {
    reloadFlag.value++
  }

  return { tabs, reloadFlag, cachedViews, addTab, closeTab, closeOthers, closeRight, closeAll, refresh }
})
