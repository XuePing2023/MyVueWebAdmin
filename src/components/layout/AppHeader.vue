<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Maximize,
  Menu as MenuIcon,
  Minimize,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-vue-next'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Button from '@/components/ui/button/Button.vue'
import Separator from '@/components/ui/separator/Separator.vue'

import { notifyApi } from '@/api/notify'
import AppBreadcrumb from './AppBreadcrumb.vue'
import SearchDialog from './SearchDialog.vue'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'
import type { NotificationItem } from '@/types/api'

const emit = defineEmits<{
  'open-mobile-menu': []
}>()

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const searchOpen = ref(false)
const logoutOpen = ref(false)
const isFullscreen = ref(false)
const notifications = ref<NotificationItem[]>([])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

async function readAll() {
  await notifyApi.readAll()
  notifications.value.forEach((n) => {
    n.read = true
  })
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  else {
    document.documentElement.requestFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}

async function handleLogout() {
  await userStore.logout()
  // 整页跳转，重置路由与全局状态
  window.location.href = '/login'
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('keydown', onKeydown)
  notifyApi.list().then((list) => {
    notifications.value = list
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header class="flex h-14 shrink-0 items-center gap-1.5 border-b border-border bg-background px-3 md:px-4">
    <!-- 移动端菜单按钮 -->
    <Button variant="ghost" size="icon-sm" class="md:hidden" @click="emit('open-mobile-menu')">
      <MenuIcon />
    </Button>

    <AppBreadcrumb class="hidden md:flex" />

    <div class="flex-1" />

    <!-- 菜单搜索 -->
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @click="searchOpen = true">
          <Search />
        </Button>
      </TooltipTrigger>
      <TooltipContent>搜索菜单（Ctrl + K）</TooltipContent>
    </Tooltip>

    <!-- 通知中心 -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="relative">
          <Bell />
          <span
            v-if="unreadCount > 0"
            class="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-80">
        <div class="flex items-center justify-between px-2 py-1.5">
          <span class="text-sm font-medium">通知</span>
          <button
            class="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            @click="readAll"
          >
            全部已读
          </button>
        </div>
        <DropdownMenuSeparator />
        <div class="max-h-80 overflow-y-auto">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="flex gap-2 rounded-sm px-2 py-2 transition-colors hover:bg-accent"
          >
            <span
              class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              :class="n.read ? 'bg-border' : 'bg-destructive'"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ n.title }}</p>
              <p class="line-clamp-2 text-xs leading-4 text-muted-foreground">{{ n.content }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ n.time }}</p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- 主题切换 -->
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @click="appStore.toggleDark()">
          <Sun v-if="appStore.isDark" />
          <Moon v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ appStore.isDark ? '切换亮色模式' : '切换暗色模式' }}</TooltipContent>
    </Tooltip>

    <!-- 全屏 -->
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @click="toggleFullscreen">
          <Minimize v-if="isFullscreen" />
          <Maximize v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ isFullscreen ? '退出全屏' : '全屏' }}</TooltipContent>
    </Tooltip>

    <Separator orientation="vertical" class="mx-1 h-6" />

    <!-- 用户菜单 -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-accent">
          <Avatar class="h-8 w-8">
            <AvatarImage
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              :alt="userStore.userInfo?.nickname"
            />
            <AvatarFallback>{{ userStore.userInfo?.nickname?.slice(0, 1) ?? 'U' }}</AvatarFallback>
          </Avatar>
          <span class="hidden text-sm md:inline">{{ userStore.userInfo?.nickname }}</span>
          <ChevronsUpDown class="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-44">
        <DropdownMenuLabel class="font-normal">
          <p class="text-sm font-medium">{{ userStore.userInfo?.nickname }}</p>
          <p class="text-xs text-muted-foreground">{{ userStore.userInfo?.email }}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="router.push('/profile')">
          <User />
          个人中心
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="text-destructive focus:text-destructive" @click="logoutOpen = true">
          <LogOut />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>

  <SearchDialog v-model:open="searchOpen" />

  <ConfirmDialog
    v-model:open="logoutOpen"
    title="退出登录"
    description="确定要退出当前账号吗？"
    confirm-text="退出"
    @confirm="handleLogout"
  />
</template>
