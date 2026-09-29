<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { getIcon } from '@/utils/icons'
import { flattenMenus, generateMenus, type MenuNode } from '@/utils/menu'
import { useUserStore } from '@/stores/modules/user'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const userStore = useUserStore()
const router = useRouter()

const keyword = ref('')
const activeIndex = ref(0)

const results = computed<Array<MenuNode & { parentTitle?: string }>>(() => {
  const all = flattenMenus(generateMenus(userStore.roles))
  const k = keyword.value.trim().toLowerCase()
  if (!k) return all.slice(0, 9)
  return all
    .filter(m => m.title.toLowerCase().includes(k) || m.path.toLowerCase().includes(k))
    .slice(0, 9)
})

watch(keyword, () => {
  activeIndex.value = 0
})

watch(() => props.open, (v) => {
  if (v) {
    keyword.value = ''
    activeIndex.value = 0
  }
})

function go(menu: MenuNode) {
  emit('update:open', false)
  router.push(menu.path)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  }
  else if (e.key === 'Enter') {
    const target = results.value[activeIndex.value]
    if (target) go(target)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="top-1/4 max-w-lg gap-0 p-0" :show-close="false">
      <DialogTitle class="sr-only">搜索菜单</DialogTitle>

      <div class="flex items-center gap-2 border-b border-border px-3">
        <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          v-model="keyword"
          placeholder="搜索菜单，回车打开…"
          class="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          @keydown="onKeydown"
        >
      </div>

      <div class="max-h-72 overflow-y-auto p-2">
        <template v-if="results.length">
          <div
            v-for="(menu, i) in results"
            :key="menu.path"
            :class="i === activeIndex ? 'bg-accent text-accent-foreground' : ''"
            class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm"
            @mouseenter="activeIndex = i"
            @click="go(menu)"
          >
            <component :is="getIcon(menu.icon)" class="h-4 w-4 shrink-0 text-muted-foreground" />
            <span class="shrink-0">{{ menu.title }}</span>
            <span v-if="menu.parentTitle" class="shrink-0 text-xs text-muted-foreground">{{ menu.parentTitle }}</span>
            <span class="ml-auto truncate text-xs text-muted-foreground">{{ menu.path }}</span>
          </div>
        </template>
        <p v-else class="py-8 text-center text-sm text-muted-foreground">
          未找到「{{ keyword }}」相关菜单
        </p>
      </div>

      <div class="flex items-center gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>↑ ↓ 切换</span>
        <span>↵ 打开</span>
        <span>Esc 关闭</span>
      </div>
    </DialogContent>
  </Dialog>
</template>
