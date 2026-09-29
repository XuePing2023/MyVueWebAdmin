<script setup lang="ts">
import { Loader2, LockKeyhole } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import FormField from '@/components/FormField.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Input from '@/components/ui/input/Input.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { profileApi, type PasswordPayload, type ProfilePayload } from '@/api/profile'
import { roleApi } from '@/api/role'
import { useUserStore } from '@/stores/modules/user'
import type { LoginLogItem, RoleItem } from '@/types/api'
import { toast } from '@/utils/toast'

defineOptions({ name: 'Profile' })

const userStore = useUserStore()

const roles = ref<RoleItem[]>([])
const logs = ref<LoginLogItem[]>([])

onMounted(() => {
  roleApi.list().then((r) => {
    roles.value = r
  })
  profileApi.logs().then((l) => {
    logs.value = l
  })
})

const roleName = (code: string) => roles.value.find(r => r.code === code)?.name ?? code

// ---------- 基本资料 ----------
const profileForm = reactive<ProfilePayload>({
  nickname: '',
  email: '',
  phone: '',
  bio: '',
})

const profileSaving = ref(false)
const profileErrors = reactive<Record<string, string | undefined>>({})

// 用 store 初始化一次（store 后加载的场景：getInfo 已在路由守卫完成）
Object.assign(profileForm, {
  nickname: userStore.userInfo?.nickname ?? '',
  email: userStore.userInfo?.email ?? '',
  phone: userStore.userInfo?.phone ?? '',
  bio: userStore.userInfo?.bio ?? '',
})

function validateProfile() {
  profileErrors.nickname = profileForm.nickname.trim() ? undefined : '请输入昵称'
  if (!profileForm.email.trim()) {
    profileErrors.email = '请输入邮箱'
  }
  else if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(profileForm.email.trim())) {
    profileErrors.email = '邮箱格式不正确'
  }
  else {
    profileErrors.email = undefined
  }
  if (!profileForm.phone.trim()) {
    profileErrors.phone = undefined
  }
  else if (!/^1[3-9]\d{9}$/.test(profileForm.phone.trim())) {
    profileErrors.phone = '手机号格式不正确'
  }
  else {
    profileErrors.phone = undefined
  }
  return Object.values(profileErrors).every(v => !v)
}

async function saveProfile() {
  if (!validateProfile()) return
  profileSaving.value = true
  try {
    const info = await profileApi.update(profileForm)
    if (userStore.userInfo) {
      Object.assign(userStore.userInfo, info)
    }
    toast.success('个人资料已更新')
  }
  finally {
    profileSaving.value = false
  }
}

// ---------- 修改密码 ----------
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const pwdSaving = ref(false)
const pwdErrors = reactive<Record<string, string | undefined>>({})

function validatePwd() {
  pwdErrors.oldPassword = pwdForm.oldPassword ? undefined : '请输入原密码'
  pwdErrors.newPassword = !pwdForm.newPassword
    ? '请输入新密码'
    : pwdForm.newPassword.length < 6
      ? '新密码至少 6 位'
      : undefined
  pwdErrors.confirmPassword = pwdForm.confirmPassword === pwdForm.newPassword
    ? undefined
    : '两次输入的密码不一致'
  return Object.values(pwdErrors).every(v => !v)
}

const pwdStrength = computed(() => {
  const v = pwdForm.newPassword
  if (!v) return 0
  let score = 0
  if (v.length >= 6) score++
  if (v.length >= 10) score++
  if (/[a-zA-Z]/.test(v) && /\d/.test(v)) score++
  if (/[^a-zA-Z0-9]/.test(v)) score++
  return score
})

const pwdStrengthText = ['', '弱', '一般', '较强', '强']

async function savePassword() {
  if (!validatePwd()) return
  pwdSaving.value = true
  try {
    const payload: PasswordPayload = {
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    }
    await profileApi.updatePassword(payload)
    toast.success('密码修改成功')
    Object.assign(pwdForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  }
  finally {
    pwdSaving.value = false
  }
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <!-- 左侧个人信息卡 -->
    <Card class="h-fit">
      <CardContent class="flex flex-col items-center gap-4 pt-6 text-center">
        <Avatar class="h-20 w-20">
          <AvatarFallback class="text-2xl">
            {{ userStore.userInfo?.nickname?.slice(0, 1) ?? 'U' }}
          </AvatarFallback>
        </Avatar>
        <div>
          <p class="text-lg font-semibold">{{ userStore.userInfo?.nickname }}</p>
          <p class="mt-0.5 text-sm text-muted-foreground">@{{ userStore.userInfo?.username }}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-1.5">
          <Badge v-for="role in userStore.roles" :key="role" variant="secondary">
            {{ roleName(role) }}
          </Badge>
        </div>
        <div class="w-full space-y-2 border-t border-border pt-4 text-left text-sm">
          <p class="flex justify-between gap-2">
            <span class="text-muted-foreground">邮箱</span>
            <span class="truncate">{{ userStore.userInfo?.email }}</span>
          </p>
          <p class="flex justify-between gap-2">
            <span class="text-muted-foreground">手机</span>
            <span>{{ userStore.userInfo?.phone || '—' }}</span>
          </p>
          <p class="flex justify-between gap-2">
            <span class="shrink-0 text-muted-foreground">简介</span>
            <span class="text-right">{{ userStore.userInfo?.bio || '—' }}</span>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 右侧表单区 -->
    <Card class="lg:col-span-2">
      <CardContent class="pt-6">
        <Tabs default-value="profile">
          <TabsList>
            <TabsTrigger value="profile">
              基本资料
            </TabsTrigger>
            <TabsTrigger value="password">
              修改密码
            </TabsTrigger>
            <TabsTrigger value="logs">
              登录日志
            </TabsTrigger>
          </TabsList>

          <!-- 基本资料 -->
          <TabsContent value="profile" class="mt-6 max-w-lg space-y-4">
            <FormField label="昵称" required :error="profileErrors.nickname">
              <Input v-model="profileForm.nickname" :invalid="!!profileErrors.nickname" />
            </FormField>
            <FormField label="邮箱" required :error="profileErrors.email">
              <Input v-model="profileForm.email" :invalid="!!profileErrors.email" />
            </FormField>
            <FormField label="手机号" :error="profileErrors.phone">
              <Input v-model="profileForm.phone" :invalid="!!profileErrors.phone" />
            </FormField>
            <FormField label="个人简介">
              <Textarea v-model="profileForm.bio" class="min-h-24" />
            </FormField>
            <Button :disabled="profileSaving" @click="saveProfile">
              <Loader2 v-if="profileSaving" class="animate-spin" />
              保存修改
            </Button>
          </TabsContent>

          <!-- 修改密码 -->
          <TabsContent value="password" class="mt-6 max-w-lg space-y-4">
            <FormField label="原密码" required :error="pwdErrors.oldPassword">
              <Input
                v-model="pwdForm.oldPassword"
                type="password"
                :invalid="!!pwdErrors.oldPassword"
              />
            </FormField>
            <FormField label="新密码" required :error="pwdErrors.newPassword">
              <Input
                v-model="pwdForm.newPassword"
                type="password"
                :invalid="!!pwdErrors.newPassword"
              />
              <div v-if="pwdForm.newPassword" class="flex items-center gap-2">
                <div class="flex flex-1 gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1.5 flex-1 rounded-full transition-colors"
                    :class="i <= pwdStrength ? 'bg-primary' : 'bg-muted'"
                  />
                </div>
                <span class="w-8 text-right text-xs text-muted-foreground">{{ pwdStrengthText[pwdStrength] }}</span>
              </div>
            </FormField>
            <FormField label="确认新密码" required :error="pwdErrors.confirmPassword">
              <Input
                v-model="pwdForm.confirmPassword"
                type="password"
                :invalid="!!pwdErrors.confirmPassword"
              />
            </FormField>
            <Button :disabled="pwdSaving" @click="savePassword">
              <LockKeyhole v-if="!pwdSaving" />
              <Loader2 v-else class="animate-spin" />
              确认修改
            </Button>
          </TabsContent>

          <!-- 登录日志 -->
          <TabsContent value="logs" class="mt-4">
            <div class="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="pl-4">
                      登录时间
                    </TableHead>
                    <TableHead>IP 地址</TableHead>
                    <TableHead class="hidden md:table-cell">
                      登录地点
                    </TableHead>
                    <TableHead class="hidden lg:table-cell">
                      浏览器 / 系统
                    </TableHead>
                    <TableHead>结果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="log in logs" :key="log.id">
                    <TableCell class="pl-4 text-muted-foreground">
                      {{ log.time }}
                    </TableCell>
                    <TableCell class="font-mono text-xs">
                      {{ log.ip }}
                    </TableCell>
                    <TableCell class="hidden md:table-cell">
                      {{ log.location }}
                    </TableCell>
                    <TableCell class="hidden text-muted-foreground lg:table-cell">
                      {{ log.browser }} · {{ log.os }}
                    </TableCell>
                    <TableCell>
                      <Badge :variant="log.status === 1 ? 'success' : 'destructive'">
                        {{ log.status === 1 ? '成功' : '失败' }}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
