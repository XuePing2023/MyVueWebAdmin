import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import { authApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  const token = useStorage('webadmin:token', '')
  const userInfo = ref<UserInfo | null>(null)

  const roles = computed(() => userInfo.value?.roles ?? [])
  const isLoggedIn = computed(() => !!token.value)

  async function login(form: LoginParams) {
    const { token: t, userInfo: u } = await authApi.login(form)
    token.value = t
    userInfo.value = u
  }

  async function getInfo() {
    userInfo.value = await authApi.getInfo()
    return userInfo.value
  }

  async function logout() {
    try {
      await authApi.logout()
    }
    catch {
      // 登出接口失败不阻断本地清理
    }
    resetToken()
  }

  function resetToken() {
    token.value = ''
    userInfo.value = null
  }

  return { token, userInfo, roles, isLoggedIn, login, getInfo, logout, resetToken }
})
