<script setup lang="ts">
import { Loader2, Pencil, Plus, RotateCcw, Search, Trash2, UserRoundPlus } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormField from '@/components/FormField.vue'
import TablePagination from '@/components/TablePagination.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Input from '@/components/ui/input/Input.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Switch from '@/components/ui/switch/Switch.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { roleApi } from '@/api/role'
import { userApi } from '@/api/user'
import type { RoleItem, UserItem } from '@/types/api'
import { toast } from '@/utils/toast'

defineOptions({ name: 'SystemUser' })

// ---------- 列表查询 ----------
const loading = ref(false)
const list = ref<UserItem[]>([])
const total = ref(0)
const roles = ref<RoleItem[]>([])

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: '' as number | '',
})

async function loadData() {
  loading.value = true
  try {
    const res = await userApi.page({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword,
      status: query.status,
    })
    list.value = res.list
    total.value = res.total
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  roleApi.list().then((r) => {
    roles.value = r
  })
})

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.keyword = ''
  query.status = ''
  handleSearch()
}

const roleName = (code: string) => roles.value.find(r => r.code === code)?.name ?? code

// ---------- 选择与批量删除 ----------
const selectedIds = ref<number[]>([])

const allSelected = computed(() => {
  if (!list.value.length) return false
  return list.value.every(u => selectedIds.value.includes(u.id))
})

function toggleAll(val: boolean | 'indeterminate' | undefined) {
  selectedIds.value = val === true ? list.value.map(u => u.id) : []
}

function toggleRow(row: UserItem, val: boolean | 'indeterminate' | undefined) {
  selectedIds.value = val
    ? [...selectedIds.value, row.id]
    : selectedIds.value.filter(id => id !== row.id)
}

// ---------- 状态切换 ----------
async function handleStatusChange(row: UserItem, val: boolean | undefined) {
  const next = val ? 1 : 0
  const prev = row.status
  row.status = next as 0 | 1
  try {
    await userApi.updateStatus(row.id, next as 0 | 1)
    toast.success(`用户「${row.nickname}」已${val ? '启用' : '禁用'}`)
  }
  catch {
    row.status = prev
  }
}

// ---------- 删除确认 ----------
const removeConfirm = reactive({
  open: false,
  ids: [] as number[],
  title: '删除用户',
  description: '',
})

function askRemove(row: UserItem) {
  removeConfirm.ids = [row.id]
  removeConfirm.description = `确定删除用户「${row.nickname}」吗？删除后不可恢复。`
  removeConfirm.open = true
}

function askBatchRemove() {
  removeConfirm.ids = [...selectedIds.value]
  removeConfirm.description = `确定删除选中的 ${selectedIds.value.length} 个用户吗？删除后不可恢复。`
  removeConfirm.open = true
}

async function handleRemove() {
  try {
    if (removeConfirm.ids.length === 1) {
      await userApi.remove(removeConfirm.ids[0])
    }
    else {
      await userApi.batchRemove(removeConfirm.ids)
    }
    toast.success('删除成功')
    selectedIds.value = []
    if (list.value.length <= removeConfirm.ids.length && query.page > 1) {
      query.page--
    }
    loadData()
  }
  finally {
    removeConfirm.open = false
  }
}

// ---------- 新增 / 编辑 ----------
const dialogOpen = ref(false)
const editing = ref<UserItem | null>(null)
const saving = ref(false)
const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  status: 1,
  remark: '',
})
const errors = reactive<Record<string, string | undefined>>({})

function resetForm() {
  form.username = ''
  form.nickname = ''
  form.email = ''
  form.phone = ''
  form.role = ''
  form.status = 1
  form.remark = ''
  Object.keys(errors).forEach(k => (errors[k] = undefined))
}

function openCreate() {
  editing.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(row: UserItem) {
  editing.value = row
  resetForm()
  Object.assign(form, {
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    role: row.roles[0] ?? '',
    status: row.status,
    remark: row.remark,
  })
  dialogOpen.value = true
}

function validate() {
  errors.username = !form.username.trim()
    ? '请输入用户名'
    : form.username.trim().length < 3
      ? '用户名至少 3 个字符'
      : undefined
  errors.nickname = form.nickname.trim() ? undefined : '请输入昵称'
  if (!form.email.trim()) {
    errors.email = '请输入邮箱'
  }
  else if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
    errors.email = '邮箱格式不正确'
  }
  else {
    errors.email = undefined
  }
  if (!form.phone.trim()) {
    errors.phone = undefined
  }
  else if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = '手机号格式不正确'
  }
  else {
    errors.phone = undefined
  }
  errors.role = form.role ? undefined : '请选择角色'
  return Object.values(errors).every(v => !v)
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      username: form.username.trim(),
      nickname: form.nickname.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      roles: [form.role],
      status: form.status as 0 | 1,
      remark: form.remark.trim(),
    }
    if (editing.value) {
      await userApi.update(editing.value.id, payload)
      toast.success('用户信息已更新')
    }
    else {
      await userApi.create(payload)
      toast.success('用户创建成功')
    }
    dialogOpen.value = false
    loadData()
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 搜索工具栏 -->
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="query.keyword"
          placeholder="用户名 / 昵称 / 邮箱"
          class="w-60 pl-9"
          @keydown.enter="handleSearch"
        />
      </div>
      <Select
        :model-value="query.status === '' ? 'all' : String(query.status)"
        @update:model-value="(v) => query.status = v === 'all' ? '' : Number(v)"
      >
        <SelectTrigger class="w-32">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="1">启用</SelectItem>
          <SelectItem value="0">禁用</SelectItem>
        </SelectContent>
      </Select>
      <Button @click="handleSearch">
        <Search />
        搜索
      </Button>
      <Button variant="outline" @click="handleReset">
        <RotateCcw />
        重置
      </Button>

      <div class="flex-1" />

      <Button
        v-if="selectedIds.length"
        variant="outline"
        class="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        @click="askBatchRemove"
      >
        <Trash2 />
        批量删除 ({{ selectedIds.length }})
      </Button>
      <Button @click="openCreate">
        <UserRoundPlus />
        新增用户
      </Button>
    </div>

    <!-- 用户表格 -->
    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10 pl-4">
              <Checkbox
                :model-value="allSelected ? true : (selectedIds.length ? 'indeterminate' : false)"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <TableHead>用户</TableHead>
            <TableHead class="hidden lg:table-cell">
              邮箱
            </TableHead>
            <TableHead class="hidden xl:table-cell">
              手机号
            </TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead class="hidden md:table-cell">
              创建时间
            </TableHead>
            <TableHead class="w-28 text-right pr-4">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in list" :key="row.id">
            <TableCell class="pl-4">
              <Checkbox
                :model-value="selectedIds.includes(row.id)"
                @update:model-value="toggleRow(row, $event)"
              />
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2.5">
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">{{ row.nickname.slice(0, 1) }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ row.nickname }}</p>
                  <p class="truncate text-xs text-muted-foreground">{{ row.username }}</p>
                </div>
              </div>
            </TableCell>
            <TableCell class="hidden text-muted-foreground lg:table-cell">
              {{ row.email }}
            </TableCell>
            <TableCell class="hidden text-muted-foreground xl:table-cell">
              {{ row.phone }}
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge v-for="role in row.roles" :key="role" variant="secondary">
                  {{ roleName(role) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Switch
                :model-value="row.status === 1"
                @update:model-value="handleStatusChange(row, $event)"
              />
            </TableCell>
            <TableCell class="hidden text-muted-foreground md:table-cell">
              {{ row.createdAt }}
            </TableCell>
            <TableCell class="pr-4 text-right">
              <Button variant="ghost" size="icon-sm" title="编辑" @click="openEdit(row)">
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-destructive hover:text-destructive"
                title="删除"
                @click="askRemove(row)"
              >
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>

          <TableRow v-if="!loading && !list.length">
            <TableCell colspan="8" class="h-32 text-center text-muted-foreground">
              暂无数据
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="loading" class="flex-center py-2 text-sm text-muted-foreground">
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        加载中…
      </div>

      <div class="px-4 pb-2">
        <TablePagination
          v-model:page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          @update:page="loadData"
          @update:page-size="loadData"
        />
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editing ? '编辑用户' : '新增用户' }}</DialogTitle>
          <DialogDescription>
            {{ editing ? `修改用户「${editing.nickname}」的信息` : '创建一个新的系统用户' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-2 sm:grid-cols-2">
          <FormField label="用户名" required :error="errors.username">
            <Input
              v-model="form.username"
              placeholder="登录账号"
              :disabled="!!editing"
              :invalid="!!errors.username"
            />
          </FormField>
          <FormField label="昵称" required :error="errors.nickname">
            <Input v-model="form.nickname" placeholder="显示名称" :invalid="!!errors.nickname" />
          </FormField>
          <FormField label="邮箱" required :error="errors.email">
            <Input v-model="form.email" placeholder="name@example.com" :invalid="!!errors.email" />
          </FormField>
          <FormField label="手机号" :error="errors.phone">
            <Input v-model="form.phone" placeholder="选填" :invalid="!!errors.phone" />
          </FormField>
          <FormField label="角色" required :error="errors.role">
            <Select v-model="form.role">
              <SelectTrigger :class="errors.role && 'border-destructive'">
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roles" :key="role.code" :value="role.code">
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="状态">
            <div class="flex h-9 items-center gap-2.5">
              <Switch
                :model-value="form.status === 1"
                @update:model-value="form.status = $event ? 1 : 0"
              />
              <span class="text-sm text-muted-foreground">{{ form.status === 1 ? '启用' : '禁用' }}</span>
            </div>
          </FormField>
          <div class="sm:col-span-2">
            <FormField label="备注">
              <Textarea v-model="form.remark" placeholder="选填" />
            </FormField>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            取消
          </Button>
          <Button :disabled="saving" @click="handleSave">
            <Loader2 v-if="saving" class="animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认 -->
    <ConfirmDialog
      v-model:open="removeConfirm.open"
      :title="removeConfirm.title"
      :description="removeConfirm.description"
      confirm-text="删除"
      @confirm="handleRemove"
    />
  </div>
</template>
