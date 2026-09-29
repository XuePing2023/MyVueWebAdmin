<script setup lang="ts">
import { SelectContent as Content, SelectPortal, SelectViewport } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  position?: 'popper' | 'item-aligned'
}>(), {
  position: 'popper',
})
</script>

<template>
  <SelectPortal>
    <Content
      data-slot="select-content"
      :position="props.position"
      :side-offset="4"
      :class="cn(
        'relative z-50 max-h-80 min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        props.class,
      )"
    >
      <SelectViewport
        :class="cn(
          'p-1',
          props.position === 'popper' && 'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]',
        )"
      >
        <slot />
      </SelectViewport>
    </Content>
  </SelectPortal>
</template>
