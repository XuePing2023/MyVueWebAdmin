<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import SidebarMenu from './SidebarMenu.vue'
import { useAppStore } from '@/stores/modules/app'
import type { MenuNode } from '@/utils/menu'
import { cn } from '@/utils/cn'

defineProps<{
  menus: MenuNode[]
}>()

const appStore = useAppStore()
const collapsed = computed(() => appStore.sidebarCollapsed)
</script>

<template>
  <aside
    :class="cn(
      'hidden shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 md:flex',
      collapsed ? 'w-14' : 'w-60',
    )"
  >
    <RouterLink
      to="/"
      class="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4"
    >
      <img src="/favicon.svg" alt="logo" class="h-7 w-7 shrink-0">
      <span v-if="!collapsed" class="text-ellipsis whitespace-nowrap text-base font-semibold">WebAdmin</span>
    </RouterLink>

    <nav class="flex-1 overflow-y-auto overflow-x-hidden p-2">
      <SidebarMenu :menus="menus" :collapsed="collapsed" />
    </nav>

    <div class="shrink-0 border-t border-border p-2">
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            :class="cn(
              'flex h-9 w-full items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center px-0',
            )"
            @click="appStore.toggleSidebar()"
          >
            <PanelLeftOpen v-if="collapsed" class="h-4 w-4 shrink-0" />
            <PanelLeftClose v-else class="h-4 w-4 shrink-0" />
            <span v-if="!collapsed" class="ml-2">收起菜单</span>
          </button>
        </TooltipTrigger>
        <TooltipContent v-if="collapsed" side="right">
          展开菜单
        </TooltipContent>
      </Tooltip>
    </div>
  </aside>
</template>
