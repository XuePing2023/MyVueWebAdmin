<script setup lang="ts">
import { DialogClose, DialogContent as Content, DialogOverlay, DialogPortal } from 'reka-ui'
import { X } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  showClose?: boolean
}>()
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      data-slot="dialog-overlay"
      class="fixed inset-0 z-50 bg-black/80"
    />
    <Content
      data-slot="dialog-content"
      :class="cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg duration-200',
        props.class,
      )"
    >
      <slot />

      <DialogClose
        v-if="props.showClose !== false"
        class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </Content>
  </DialogPortal>
</template>
