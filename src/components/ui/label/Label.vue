<script setup lang="ts">
import { Label as LabelPrimitive, type LabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<LabelProps & {
  class?: HTMLAttributes['class']
}>(), {
  for: undefined,
})
</script>

<template>
  <LabelPrimitive
    :for="props.for"
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)"
  >
    <slot />
  </LabelPrimitive>
</template>
