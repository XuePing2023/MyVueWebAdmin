import { defineStore } from 'pinia'
import { useDark, useStorage, useToggle } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  /** 暗黑模式（持久化到 localStorage） */
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  /** 侧边栏折叠 */
  const sidebarCollapsed = useStorage('webadmin:sidebar-collapsed', false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { isDark, toggleDark, sidebarCollapsed, toggleSidebar }
})
