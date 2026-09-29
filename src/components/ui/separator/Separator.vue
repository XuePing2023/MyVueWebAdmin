<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  orientation?: 'horizontal' | 'vertical'
  class?: HTMLAttributes['class']
}>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <div
    role="separator"
    :aria-orientation="orientation"
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
      props.class,
    )"
  />
</template>
