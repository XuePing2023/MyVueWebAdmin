<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  invalid?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <textarea
    v-model="model"
    :class="cn(
      'flex min-h-20 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      props.invalid && 'border-destructive focus-visible:ring-destructive',
      props.class,
    )"
  />
</template>
