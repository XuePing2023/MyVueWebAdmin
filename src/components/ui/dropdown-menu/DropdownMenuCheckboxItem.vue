<script setup lang="ts">
import { DropdownMenuItemIndicator, DropdownMenuCheckboxItem as CheckboxItem } from 'reka-ui'
import { Check } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const modelValue = defineModel<boolean | 'indeterminate'>()
</script>

<template>
  <CheckboxItem
    v-model="modelValue"
    :disabled="props.disabled"
    :class="cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class,
    )"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <Check class="h-4 w-4" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </CheckboxItem>
</template>
