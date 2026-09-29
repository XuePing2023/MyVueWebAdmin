<script setup lang="ts">
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-vue-next'

import { cn } from '@/utils/cn'
import { dismiss, toasts } from '@/utils/toast'

const iconMap = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
} as const

const colorMap = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
} as const
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="item in toasts"
          :key="item.id"
          class="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
        >
          <component :is="iconMap[item.type]" :class="cn('mt-0.5 h-4.5 w-4.5 shrink-0', colorMap[item.type])" />
          <p class="flex-1 break-all text-sm leading-5">{{ item.message }}</p>
          <button
            class="shrink-0 rounded-sm opacity-50 transition-opacity hover:opacity-100"
            @click="dismiss(item.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
