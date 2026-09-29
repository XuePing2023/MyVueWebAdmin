<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getIcon } from '@/utils/icons'
import type { MenuNode } from '@/utils/menu'
import { cn } from '@/utils/cn'

defineOptions({ name: 'SidebarMenu' })

defineProps<{
  menus: MenuNode[]
  collapsed?: boolean
}>()

const route = useRoute()

function isActive(node: MenuNode): boolean {
  if (route.path === node.path) return true
  return node.children?.some(child => isActive(child)) ?? false
}
</script>

<template>
  <ul class="space-y-0.5">
    <li v-for="menu in menus" :key="menu.path">
      <!-- 有子菜单 -->
      <template v-if="menu.children?.length">
        <!-- 折叠模式：仅图标 -->
        <Tooltip v-if="collapsed">
          <TooltipTrigger as-child>
            <RouterLink
              :to="menu.path"
              :class="cn(
                'flex-center h-9 w-full rounded-md transition-colors',
                isActive(menu) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )"
            >
              <component :is="getIcon(menu.icon)" class="h-4 w-4 shrink-0" />
            </RouterLink>
          </TooltipTrigger>
          <TooltipContent side="right">{{ menu.title }}</TooltipContent>
        </Tooltip>

        <CollapsibleRoot v-else :default-open="true">
          <CollapsibleTrigger
            :class="cn(
              'group flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors',
              isActive(menu) ? 'text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )"
          >
            <component :is="getIcon(menu.icon)" class="h-4 w-4 shrink-0" />
            <span class="flex-1 truncate text-left">{{ menu.title }}</span>
            <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
              <SidebarMenu :menus="menu.children" :collapsed="false" />
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </template>

      <!-- 无子菜单 -->
      <template v-else>
        <Tooltip v-if="collapsed">
          <TooltipTrigger as-child>
            <RouterLink
              :to="menu.path"
              :class="cn(
                'flex-center h-9 w-full rounded-md transition-colors',
                route.path === menu.path ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )"
            >
              <component :is="getIcon(menu.icon)" class="h-4 w-4 shrink-0" />
            </RouterLink>
          </TooltipTrigger>
          <TooltipContent side="right">{{ menu.title }}</TooltipContent>
        </Tooltip>

        <RouterLink
          v-else
          :to="menu.path"
          :class="cn(
            'flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors',
            route.path === menu.path
              ? 'bg-accent font-medium text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )"
        >
          <component :is="getIcon(menu.icon)" class="h-4 w-4 shrink-0" />
          <span class="flex-1 truncate">{{ menu.title }}</span>
        </RouterLink>
      </template>
    </li>
  </ul>
</template>
