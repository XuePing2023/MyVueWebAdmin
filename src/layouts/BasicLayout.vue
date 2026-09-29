<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView } from 'vue-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import SidebarMenu from '@/components/layout/SidebarMenu.vue'

import { useTabStore } from '@/stores/modules/tab'
import { useUserStore } from '@/stores/modules/user'
import { generateMenus, type MenuNode } from '@/utils/menu'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTabs from '@/components/layout/AppTabs.vue'

const userStore = useUserStore()
const tabStore = useTabStore()

const menus = computed<MenuNode[]>(() => generateMenus(userStore.roles))

const mobileMenuOpen = ref(false)
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="flex h-screen overflow-hidden bg-background text-foreground">
      <!-- 桌面端侧边栏 -->
      <AppSidebar :menus="menus" />

      <!-- 移动端抽屉菜单 -->
      <Sheet v-model:open="mobileMenuOpen">
        <SheetContent side="left" class="w-64 gap-0 p-0">
          <SheetHeader class="flex h-14 shrink-0 flex-row items-center gap-2.5 border-b border-border px-4">
            <img src="/favicon.svg" alt="logo" class="h-7 w-7">
            <SheetTitle>WebAdmin</SheetTitle>
          </SheetHeader>
          <nav class="flex-1 overflow-y-auto p-2">
            <SidebarMenu :menus="menus" :collapsed="false" />
          </nav>
        </SheetContent>
      </Sheet>

      <!-- 主区域 -->
      <div class="flex min-w-0 flex-1 flex-col">
        <AppHeader @open-mobile-menu="mobileMenuOpen = true" />
        <AppTabs />

        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <RouterView v-slot="{ Component, route: viewRoute }">
            <Transition name="fade-slide" mode="out-in">
              <KeepAlive :include="tabStore.cachedViews">
                <component
                  :is="Component"
                  :key="`${viewRoute.path}#${tabStore.reloadFlag}`"
                />
              </KeepAlive>
            </Transition>
          </RouterView>
        </main>
      </div>
    </div>
  </TooltipProvider>
</template>
