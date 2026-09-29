<script setup lang="ts">
import { SelectIcon, SelectTrigger as Trigger } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Trigger
    :class="cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
    </SelectIcon>
  </Trigger>
</template>
