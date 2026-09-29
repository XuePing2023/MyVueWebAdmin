<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const model = defineModel<boolean>()
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="props.disabled"
    :class="cn(
      'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      props.class,
    )"
  >
    <SwitchThumb
      :class="cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )"
    />
  </SwitchRoot>
</template>
