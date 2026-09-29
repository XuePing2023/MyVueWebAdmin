<script setup lang="ts">
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormField from '@/components/FormField.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { menuApi } from '@/api/menu'
import type { MenuItem, MenuType, StatusType } from '@/types/api'
import { getIcon, iconMap, iconNames } from '@/utils/icons'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

defineOptions({ name: 'SystemMenu' })

// ---------- 树形表格 ----------
const loading = ref(false)
const tree = ref<MenuItem[]>([])
const expanded = ref<Set<number>>(new Set([2]))

interface Row {
  menu: MenuItem
  depth: number
  hasChildren: boolean
}

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const walk = (items: MenuItem[], depth: number) => {
    items.forEach((m) => {
      out.push({ menu: m, depth, hasChildren: m.children.length > 0 })
      if (m.children.length && expanded.value.has(m.id)) {
        walk(m.children, depth + 1)
      }
    })
  }
  walk(tree.value, 0)
  return out
})

function toggleExpand(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

async function loadData() {
  loading.value = true
  try {
    tree.value = await menuApi.tree()
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)

const typeBadge: Record<MenuType, { text: string; variant: 'default' | 'secondary' | 'outline' }> = {
  dir: { text: '目录', variant: 'default' },
  menu: { text: '菜单', variant: 'secondary' },
  button: { text: '按钮', variant: 'outline' },
}

// ---------- 上级菜单选项 ----------
interface ParentOption {
  id: number
  label: string
}

const parentOptions = computed<ParentOption[]>(() => {
  const out: ParentOption[] = [{ id: 0, label: '顶级菜单' }]
  const walk = (items: MenuItem[], prefix: string) => {
    items.forEach((m) => {
      if (m.type === 'button') return
      out.push({ id: m.id, label: `${prefix}${m.name}` })
      walk(m.children, `${prefix}　`)
    })
  }
  walk(tree.value, '')
  return out
})

// ---------- 新增 / 编辑 ----------
const dialogOpen = ref(false)
const editing = ref<MenuItem | null>(null)
const saving = ref(false)
const form = reactive({
  parentId: 0,
  type: 'menu' as MenuType,
  name: '',
  path: '',
  perms: '',
  icon: '',
  order: 0,
  status: 1 as StatusType,
  visible: 1 as StatusType,
})
const errors = reactive<Record<string, string | undefined>>({})

function resetForm() {
  Object.assign(form, {
    parentId: 0,
    type: 'menu' as MenuType,
    name: '',
    path: '',
    perms: '',
    icon: '',
    order: 0,
    status: 1 as StatusType,
    visible: 1 as StatusType,
  })
  Object.keys(errors).forEach(k => (errors[k] = undefined))
}

function openCreate(parent?: MenuItem) {
  editing.value = null
  resetForm()
  if (parent) {
    form.parentId = parent.id
  }
  dialogOpen.value = true
}

function openEdit(row: MenuItem) {
  editing.value = row
  resetForm()
  Object.assign(form, {
    parentId: row.parentId,
    type: row.type,
    name: row.name,
    path: row.path,
    perms: row.perms,
    icon: row.icon,
    order: row.order,
    status: row.status,
    visible: row.visible,
  })
  dialogOpen.value = true
}

function validate() {
  errors.name = form.name.trim() ? undefined : '请输入名称'
  if (form.type === 'button') {
    errors.path = undefined
    errors.perms = form.perms.trim() ? undefined : '按钮类型必须填写权限标识'
  }
  else {
    errors.path = form.path.trim()
      ? form.path.trim().startsWith('/')
        ? undefined
        : '路由地址需以 / 开头'
      : '请输入路由地址'
    errors.perms = undefined
  }
  return Object.values(errors).every(v => !v)
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      parentId: form.parentId,
      type: form.type,
      name: form.name.trim(),
      path: form.type === 'button' ? '' : form.path.trim(),
      perms: form.perms.trim(),
      icon: form.type === 'button' ? '' : form.icon,
      order: form.order,
      status: form.status,
      visible: form.visible,
    }
    if (editing.value) {
      await menuApi.update(editing.value.id, payload)
      toast.success('菜单已更新')
    }
    else {
      await menuApi.create(payload)
      toast.success('菜单创建成功')
    }
    dialogOpen.value = false
    loadData()
  }
  finally {
    saving.value = false
  }
}

// ---------- 删除 ----------
const removeConfirm = reactive({ open: false, id: 0, name: '' })

function askRemove(row: MenuItem) {
  removeConfirm.id = row.id
  removeConfirm.name = row.name
  removeConfirm.open = true
}

async function handleRemove() {
  try {
    await menuApi.remove(removeConfirm.id)
    toast.success(`菜单「${removeConfirm.name}」已删除`)
    loadData()
  }
  finally {
    removeConfirm.open = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <div class="flex flex-wrap items-center gap-2.5">
      <Button variant="outline" size="sm" @click="loadData">
        <RotateCcw />
        刷新
      </Button>
      <Button variant="outline" size="sm" @click="expanded = new Set()">
        全部折叠
      </Button>
      <div class="flex-1" />
      <Button size="sm" @click="openCreate()">
        <Plus />
        新增菜单
      </Button>
    </div>

    <!-- 菜单树表格 -->
    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="pl-4">
              菜单名称
            </TableHead>
            <TableHead class="w-20">
              类型
            </TableHead>
            <TableHead class="w-16">
              图标
            </TableHead>
            <TableHead class="hidden md:table-cell">
              路由地址
            </TableHead>
            <TableHead class="hidden lg:table-cell">
              权限标识
            </TableHead>
            <TableHead class="w-16">
              排序
            </TableHead>
            <TableHead class="w-20">
              状态
            </TableHead>
            <TableHead class="w-44 text-right pr-4">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in rows" :key="row.menu.id">
            <TableCell class="pl-4">
              <div class="flex items-center gap-1.5" :style="{ paddingLeft: `${row.depth * 20}px` }">
                <button
                  v-if="row.hasChildren"
                  class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  @click="toggleExpand(row.menu.id)"
                >
                  <ChevronDown v-if="expanded.has(row.menu.id)" class="h-3.5 w-3.5" />
                  <ChevronRight v-else class="h-3.5 w-3.5" />
                </button>
                <span v-else class="inline-block h-4 w-4" />
                <span class="text-sm font-medium">{{ row.menu.name }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="typeBadge[row.menu.type].variant">
                {{ typeBadge[row.menu.type].text }}
              </Badge>
            </TableCell>
            <TableCell>
              <component :is="getIcon(row.menu.icon)" v-if="row.menu.icon" class="h-4 w-4 text-muted-foreground" />
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell class="hidden font-mono text-xs text-muted-foreground md:table-cell">
              {{ row.menu.path || '—' }}
            </TableCell>
            <TableCell class="hidden font-mono text-xs text-muted-foreground lg:table-cell">
              {{ row.menu.perms || '—' }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ row.menu.order }}
            </TableCell>
            <TableCell>
              <Badge :variant="row.menu.status === 1 ? 'success' : 'destructive'">
                {{ row.menu.status === 1 ? '显示' : '隐藏' }}
              </Badge>
            </TableCell>
            <TableCell class="pr-4 text-right">
              <Button
                v-if="row.menu.type !== 'button'"
                variant="ghost"
                size="sm"
                @click="openCreate(row.menu)"
              >
                <Plus />
                子级
              </Button>
              <Button variant="ghost" size="icon-sm" title="编辑" @click="openEdit(row.menu)">
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-destructive hover:text-destructive"
                title="删除"
                @click="askRemove(row.menu)"
              >
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>

          <TableRow v-if="!loading && !rows.length">
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
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editing ? '编辑菜单' : '新增菜单' }}</DialogTitle>
          <DialogDescription>
            菜单配置会同步到侧边栏与权限分配
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-2 sm:grid-cols-2">
          <FormField label="菜单类型">
            <Select v-model="form.type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dir">目录</SelectItem>
                <SelectItem value="menu">菜单</SelectItem>
                <SelectItem value="button">按钮</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="上级菜单">
            <Select :model-value="String(form.parentId)" @update:model-value="(v) => form.parentId = Number(v)">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in parentOptions" :key="opt.id" :value="String(opt.id)">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="名称" required :error="errors.name">
            <Input v-model="form.name" placeholder="菜单名称" :invalid="!!errors.name" />
          </FormField>
          <FormField
            v-if="form.type !== 'button'"
            label="路由地址"
            required
            :error="errors.path"
          >
            <Input v-model="form.path" placeholder="如 /system/user" :invalid="!!errors.path" />
          </FormField>
          <FormField
            v-if="form.type !== 'dir'"
            label="权限标识"
            :required="form.type === 'button'"
            :error="errors.perms"
            :class="form.type !== 'button' && 'sm:col-span-1'"
          >
            <Input v-model="form.perms" placeholder="如 system:user:list" :invalid="!!errors.perms" />
          </FormField>

          <FormField v-if="form.type !== 'button'" label="图标">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="h-9 w-full justify-start font-normal">
                  <component :is="getIcon(form.icon)" v-if="form.icon" class="h-4 w-4" />
                  <span v-else class="text-muted-foreground">选择图标</span>
                  <ChevronDown class="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-64">
                <div class="grid grid-cols-6 gap-1 p-1">
                  <button
                    v-for="name in iconNames"
                    :key="name"
                    :class="cn(
                      'flex-center h-8 cursor-pointer rounded-md transition-colors hover:bg-accent',
                      form.icon === name && 'bg-accent text-accent-foreground',
                    )"
                    :title="name"
                    @click="form.icon = name"
                  >
                    <component :is="iconMap[name]" class="h-4 w-4" />
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </FormField>

          <FormField label="排序">
            <Input
              :model-value="String(form.order)"
              type="number"
              @update:model-value="(v) => form.order = Number(v) || 0"
            />
          </FormField>

          <FormField label="状态">
            <div class="flex h-9 items-center gap-2.5">
              <Switch
                :model-value="form.status === 1"
                @update:model-value="form.status = $event ? 1 : 0"
              />
              <span class="text-sm text-muted-foreground">{{ form.status === 1 ? '显示' : '隐藏' }}</span>
            </div>
          </FormField>
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
      title="删除菜单"
      :description="`确定删除菜单「${removeConfirm.name}」吗？`"
      confirm-text="删除"
      @confirm="handleRemove"
    />
  </div>
</template>
