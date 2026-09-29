<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2, Lock, User as UserIcon } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'

import FormField from '@/components/FormField.vue'
import Button from '@/components/ui/button/Button.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useUserStore } from '@/stores/modules/user'
import { toast } from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = useStorage('webadmin:login-username', 'admin')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const errors = reactive<{ username?: string; password?: string }>({})

function validate() {
  errors.username = username.value ? undefined : '请输入用户名'
  errors.password = password.value ? undefined : '请输入密码'
  return !errors.username && !errors.password
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  try {
    await userStore.login({
      username: username.value.trim(),
      password: password.value,
      remember: remember.value,
    })
    toast.success(`欢迎回来，${userStore.userInfo?.nickname}`)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
  catch {
    // 错误提示由 http 拦截器统一处理
  }
  finally {
    loading.value = false
  }
}

function quickFill(name: 'admin' | 'user') {
  username.value = name
  password.value = '123456'
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted p-4">
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

    <div class="relative w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center gap-3">
        <img src="/favicon.svg" alt="logo" class="h-12 w-12">
        <div class="text-center">
          <h1 class="text-2xl font-semibold tracking-tight">
            WebAdmin
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            开箱即用的后台管理系统
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <form class="grid gap-4" @submit.prevent="handleSubmit">
          <FormField label="用户名" required :error="errors.username">
            <div class="relative">
              <UserIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="username"
                placeholder="请输入用户名"
                class="pl-9"
                :invalid="!!errors.username"
                autocomplete="username"
              />
            </div>
          </FormField>

          <FormField label="密码" required :error="errors.password">
            <div class="relative">
              <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="px-9"
                :invalid="!!errors.password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </FormField>

          <div class="flex items-center justify-between">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox v-model="remember" />
              记住我
            </label>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            <Loader2 v-if="loading" class="animate-spin" />
            {{ loading ? '登录中…' : '登 录' }}
          </Button>
        </form>

        <div class="my-4 flex items-center gap-3">
          <div class="h-px flex-1 bg-border" />
          <span class="text-xs text-muted-foreground">演示账号一键登录</span>
          <div class="h-px flex-1 bg-border" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline" @click="quickFill('admin')">
            管理员 admin
          </Button>
          <Button variant="outline" @click="quickFill('user')">
            普通用户 user
          </Button>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-muted-foreground">
        演示环境数据存储在浏览器内存中，刷新后重置
      </p>
    </div>
  </div>
</template>
