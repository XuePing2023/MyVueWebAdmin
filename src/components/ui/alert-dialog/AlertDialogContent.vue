<script setup lang="ts">
import { AlertDialogContent as Content, AlertDialogOverlay, AlertDialogPortal } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-overlay"
      class="fixed inset-0 z-50 bg-black/80"
    />
    <Content
      data-slot="alert-content"
      :class="cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg duration-200',
        props.class,
      )"
    >
      <slot />
    </Content>
  </AlertDialogPortal>
</template>
