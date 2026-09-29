<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Check, Minus } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const model = defineModel<boolean | 'indeterminate'>()
</script>

<template>
  <CheckboxRoot
    v-model="model"
    :disabled="props.disabled"
    :class="cn(
      'h-4 w-4 shrink-0 rounded-sm border border-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
      props.class,
    )"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Minus v-if="model === 'indeterminate'" class="h-3.5 w-3.5" />
      <Check v-else class="h-3.5 w-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
