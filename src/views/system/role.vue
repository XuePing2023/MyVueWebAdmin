<script setup lang="ts">
import { Loader2, Pencil, Plus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormField from '@/components/FormField.vue'
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
import { menuApi } from '@/api/menu'
import { roleApi } from '@/api/role'
import type { MenuItem, RoleItem } from '@/types/api'
import { toast } from '@/utils/toast'

defineOptions({ name: 'SystemRole' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<RoleItem[]>([])

async function loadData() {
  loading.value = true
  try {
    list.value = await roleApi.list()
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)

// ---------- 新增 / 编辑 ----------
const dialogOpen = ref(false)
const editing = ref<RoleItem | null>(null)
const saving = ref(false)
const form = reactive({
  name: '',
  code: '',
  description: '',
  status: 1,
})
const errors = reactive<Record<string, string | undefined>>({})

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', code: '', description: '', status: 1 })
  Object.keys(errors).forEach(k => (errors[k] = undefined))
  dialogOpen.value = true
}

function openEdit(row: RoleItem) {
  editing.value = row
  Object.assign(form, {
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
  })
  Object.keys(errors).forEach(k => (errors[k] = undefined))
  dialogOpen.value = true
}

function validate() {
  errors.name = form.name.trim() ? undefined : '请输入角色名称'
  errors.code = form.code.trim()
    ? /^[a-zA-Z][\w-]*$/.test(form.code.trim())
      ? undefined
      : '仅支持字母开头，字母 / 数字 / 下划线 / 中划线'
    : '请输入权限字符'
  return Object.values(errors).every(v => !v)
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      status: form.status as 0 | 1,
    }
    if (editing.value) {
      await roleApi.update(editing.value.id, payload)
      toast.success('角色已更新')
    }
    else {
      await roleApi.create(payload)
      toast.success('角色创建成功')
    }
    dialogOpen.value = false
    loadData()
  }
  finally {
    saving.value = false
  }
}

// ---------- 删除 ----------
const removeConfirm = reactive({
  open: false,
  id: 0,
  name: '',
})

function askRemove(row: RoleItem) {
  removeConfirm.id = row.id
  removeConfirm.name = row.name
  removeConfirm.open = true
}

async function handleRemove() {
  try {
    await roleApi.remove(removeConfirm.id)
    toast.success(`角色「${removeConfirm.name}」已删除`)
    loadData()
  }
  finally {
    removeConfirm.open = false
  }
}

// ---------- 权限分配 ----------
const permOpen = ref(false)
const permSaving = ref(false)
const permRole = ref<RoleItem | null>(null)
const menuTree = ref<MenuItem[]>([])
const checkedIds = ref<Set<number>>(new Set())

async function openPerm(row: RoleItem) {
  permRole.value = row
  permOpen.value = true
  menuTree.value = await menuApi.tree()
  checkedIds.value = new Set(row.menuIds)
}

function collectIds(node: MenuItem): number[] {
  return [node.id, ...node.children.flatMap(collectIds)]
}

/** 节点是否「完全勾选」（自身 + 全部后代） */
function isFullyChecked(node: MenuItem): boolean {
  if (!node.children.length) return checkedIds.value.has(node.id)
  return checkedIds.value.has(node.id) && node.children.every(isFullyChecked)
}

/** 复选框三态值 */
function nodeState(node: MenuItem): boolean | 'indeterminate' {
  if (!node.children.length) return checkedIds.value.has(node.id)
  const allChecked = node.children.every(isFullyChecked)
  if (allChecked && checkedIds.value.has(node.id)) return true
  const someChecked = node.children.some(c => isFullyChecked(c)) || checkedIds.value.has(node.id)
  return someChecked ? 'indeterminate' : false
}

function toggleNode(node: MenuItem, val: boolean | 'indeterminate' | undefined) {
  const ids = collectIds(node)
  ids.forEach((id) => {
    if (val === true) checkedIds.value.add(id)
    else checkedIds.value.delete(id)
  })
  syncParents(menuTree.value)
}

/** 根据子级状态回溯同步父级勾选 */
function syncParents(menus: MenuItem[]) {
  menus.forEach((node) => {
    if (node.children.length) {
      syncParents(node.children)
      const allChecked = node.children.every(isFullyChecked)
      if (allChecked) checkedIds.value.add(node.id)
      else checkedIds.value.delete(node.id)
    }
  })
}

async function savePerm() {
  if (!permRole.value) return
  permSaving.value = true
  try {
    await roleApi.assignMenus(permRole.value.id, [...checkedIds.value])
    permRole.value.menuIds = [...checkedIds.value]
    toast.success(`角色「${permRole.value.name}」权限已更新`)
    permOpen.value = false
  }
  finally {
    permSaving.value = false
  }
}

const roleBadgeVariant = (code: string) => {
  if (code === 'admin') return 'default'
  if (code === 'operator') return 'secondary'
  return 'outline'
}

const menuTypeText: Record<MenuItem['type'], string> = {
  dir: '目录',
  menu: '菜单',
  button: '按钮',
}
</script>

<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="text-sm text-muted-foreground">
        共 {{ list.length }} 个角色
      </div>
      <div class="flex-1" />
      <Button @click="openCreate">
        <Plus />
        新增角色
      </Button>
    </div>

    <!-- 角色表格 -->
    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="pl-4">
              角色名称
            </TableHead>
            <TableHead>权限字符</TableHead>
            <TableHead class="hidden lg:table-cell">
              描述
            </TableHead>
            <TableHead>状态</TableHead>
            <TableHead class="hidden md:table-cell">
              创建时间
            </TableHead>
            <TableHead class="w-40 text-right pr-4">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in list" :key="row.id">
            <TableCell class="pl-4">
              <div class="flex items-center gap-2.5">
                <div class="flex-center h-8 w-8 rounded-lg bg-secondary">
                  <ShieldCheck class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ row.name }}</p>
                  <Badge :variant="roleBadgeVariant(row.code)" class="mt-0.5">
                    {{ row.code }}
                  </Badge>
                </div>
              </div>
            </TableCell>
            <TableCell class="font-mono text-xs text-muted-foreground">
              {{ row.code }}
            </TableCell>
            <TableCell class="hidden text-muted-foreground lg:table-cell">
              {{ row.description || '—' }}
            </TableCell>
            <TableCell>
              <Badge :variant="row.status === 1 ? 'success' : 'destructive'">
                {{ row.status === 1 ? '正常' : '停用' }}
              </Badge>
            </TableCell>
            <TableCell class="hidden text-muted-foreground md:table-cell">
              {{ row.createdAt }}
            </TableCell>
            <TableCell class="pr-4 text-right">
              <Button variant="ghost" size="sm" @click="openEdit(row)">
                <Pencil />
                编辑
              </Button>
              <Button variant="ghost" size="sm" @click="openPerm(row)">
                <ShieldCheck />
                权限
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
            <TableCell colspan="6" class="h-32 text-center text-muted-foreground">
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
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? '编辑角色' : '新增角色' }}</DialogTitle>
          <DialogDescription>
            {{ editing ? `修改角色「${editing.name}」的信息` : '创建一个新的角色' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-2">
          <FormField label="角色名称" required :error="errors.name">
            <Input v-model="form.name" placeholder="如：运营人员" :invalid="!!errors.name" />
          </FormField>
          <FormField label="权限字符" required :error="errors.code">
            <Input
              v-model="form.code"
              placeholder="如：operator"
              :disabled="editing?.code === 'admin'"
              :invalid="!!errors.code"
            />
          </FormField>
          <FormField label="描述">
            <Textarea v-model="form.description" placeholder="角色职责说明（选填）" />
          </FormField>
          <FormField label="状态">
            <div class="flex h-9 items-center gap-2.5">
              <Switch
                :model-value="form.status === 1"
                @update:model-value="form.status = $event ? 1 : 0"
              />
              <span class="text-sm text-muted-foreground">{{ form.status === 1 ? '正常' : '停用' }}</span>
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

    <!-- 权限分配弹窗 -->
    <Dialog v-model:open="permOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>分配权限</DialogTitle>
          <DialogDescription>
            配置角色「{{ permRole?.name }}」可访问的菜单与操作权限
          </DialogDescription>
        </DialogHeader>

        <div class="max-h-96 overflow-y-auto rounded-lg border border-border p-3">
          <template v-if="menuTree.length">
            <div v-for="node in menuTree" :key="node.id" class="menu-node">
              <div class="tree-row" :style="{ paddingLeft: 0 }">
                <Checkbox
                  :model-value="nodeState(node)"
                  @update:model-value="toggleNode(node, $event)"
                />
                <span class="text-sm">{{ node.name }}</span>
                <span class="text-xs text-muted-foreground">{{ menuTypeText[node.type] }}</span>
              </div>
              <div v-if="node.children.length" class="ml-6 space-y-1 border-l border-border pl-3">
                <template v-for="child in node.children" :key="child.id">
                  <div class="tree-row">
                    <Checkbox
                      :model-value="nodeState(child)"
                      @update:model-value="toggleNode(child, $event)"
                    />
                    <span class="text-sm">{{ child.name }}</span>
                    <span class="text-xs text-muted-foreground">{{ menuTypeText[child.type] }}</span>
                  </div>
                  <div v-if="child.children.length" class="ml-6 space-y-1 border-l border-border pl-3">
                    <div v-for="leaf in child.children" :key="leaf.id" class="tree-row">
                      <Checkbox
                        :model-value="nodeState(leaf)"
                        @update:model-value="toggleNode(leaf, $event)"
                      />
                      <span class="text-sm">{{ leaf.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ menuTypeText[leaf.type] }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <div v-else class="flex-center py-10 text-sm text-muted-foreground">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            加载中…
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="permOpen = false">
            取消
          </Button>
          <Button :disabled="permSaving" @click="savePerm">
            <Loader2 v-if="permSaving" class="animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认 -->
    <ConfirmDialog
      v-model:open="removeConfirm.open"
      title="删除角色"
      :description="`确定删除角色「${removeConfirm.name}」吗？`"
      confirm-text="删除"
      @confirm="handleRemove"
    />
  </div>
</template>

<style scoped>
.tree-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.tree-row > span:last-child {
  margin-left: auto;
}
</style>
