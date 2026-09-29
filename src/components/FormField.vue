<script setup lang="ts">
import Label from '@/components/ui/label/Label.vue'

defineProps<{
  label?: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div class="grid gap-1.5">
    <Label v-if="label">
      {{ label }}
      <span v-if="required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <slot />
    <p v-if="error" class="text-xs leading-4 text-destructive">
      {{ error }}
    </p>
  </div>
</template>
