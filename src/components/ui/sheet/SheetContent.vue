<script setup lang="ts">
import { DialogClose, DialogContent as Content, DialogOverlay, DialogPortal } from 'reka-ui'
import { X } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  side?: 'left' | 'right' | 'top' | 'bottom'
  class?: HTMLAttributes['class']
}>(), {
  side: 'right',
})

const sideClasses: Record<string, string> = {
  left: 'inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm',
  right: 'inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm',
  top: 'inset-x-0 top-0 h-auto border-b border-border',
  bottom: 'inset-x-0 bottom-0 h-auto border-t border-border',
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      data-slot="dialog-overlay"
      class="fixed inset-0 z-50 bg-black/80"
    />
    <Content
      data-slot="sheet-content"
      :data-side="props.side"
      :class="cn(
        'fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg',
        sideClasses[props.side],
        props.class,
      )"
    >
      <slot />

      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </Content>
  </DialogPortal>
</template>
