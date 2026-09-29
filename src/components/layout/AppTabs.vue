<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RotateCw, X } from 'lucide-vue-next'

import { getIcon } from '@/utils/icons'
import { useTabStore } from '@/stores/modules/tab'
import { cn } from '@/utils/cn'

const router = useRouter()
const route = useRoute()
const tabStore = useTabStore()

const ctx = ref({ visible: false, x: 0, y: 0, path: '', affix: false })

function openContextmenu(e: MouseEvent, tab: { path: string; affix?: boolean }) {
  ctx.value = { visible: true, x: e.clientX, y: e.clientY, path: tab.path, affix: !!tab.affix }
  document.addEventListener('click', closeContextmenu, { once: true })
}

function closeContextmenu() {
  ctx.value.visible = false
}

function handleClose(path: string) {
  const next = tabStore.closeTab(path, route.path)
  if (next) router.push(next)
}

type Action = 'refresh' | 'close' | 'closeOthers' | 'closeRight' | 'closeAll'

function handleAction(action: Action) {
  const path = ctx.value.path
  closeContextmenu()
  if (action === 'refresh') {
    tabStore.refresh()
    return
  }
  let next: string | null = null
  if (action === 'close') next = tabStore.closeTab(path, route.path)
  else if (action === 'closeOthers') next = tabStore.closeOthers(path, route.path)
  else if (action === 'closeRight') next = tabStore.closeRight(path, route.path)
  else next = tabStore.closeAll(route.path)
  if (next) router.push(next)
}
</script>

<template>
  <div class="flex h-10 shrink-0 items-center border-b border-border bg-background px-2">
    <div class="flex flex-1 items-center gap-1 overflow-x-auto">
      <div
        v-for="tab in tabStore.tabs"
        :key="tab.path"
        :class="cn(
          'group flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors',
          route.path === tab.path
            ? 'border-border bg-accent font-medium text-accent-foreground'
            : 'border-transparent text-muted-foreground hover:bg-accent',
        )"
        @click="router.push(tab.path)"
        @contextmenu.prevent="openContextmenu($event, tab)"
      >
        <component :is="getIcon(tab.icon)" v-if="tab.icon" class="h-3.5 w-3.5 shrink-0" />
        <span class="whitespace-nowrap">{{ tab.title }}</span>
        <button
          v-if="!tab.affix"
          class="cursor-pointer rounded-sm p-0.5 opacity-50 transition-opacity hover:opacity-100"
          @click.stop="handleClose(tab.path)"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>

  <!-- 标签右键菜单 -->
  <Teleport to="body">
    <div
      v-if="ctx.visible"
      class="fixed z-[90] min-w-36 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
      :style="{ left: `${ctx.x}px`, top: `${ctx.y}px` }"
      @click="closeContextmenu"
      @contextmenu.prevent="closeContextmenu"
    >
      <button
        class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent [&_svg]:h-3.5 [&_svg]:w-3.5"
        @click="handleAction('refresh')"
      >
        <RotateCw />
        刷新页面
      </button>
      <div class="-mx-1 my-1 h-px bg-border" />
      <button
        class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="ctx.affix"
        @click="handleAction('close')"
      >
        关闭标签
      </button>
      <button
        class="w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
        @click="handleAction('closeOthers')"
      >
        关闭其他
      </button>
      <button
        class="w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
        @click="handleAction('closeRight')"
      >
        关闭右侧
      </button>
      <button
        class="w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
        @click="handleAction('closeAll')"
      >
        关闭全部
      </button>
    </div>
  </Teleport>
</template>
