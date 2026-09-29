<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>(), {
  title: '确认操作',
  description: '',
  confirmText: '确认',
  cancelText: '取消',
  danger: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <AlertDialog :open="props.open" @update:open="emit('update:open', $event)">
    <AlertDialogContent class="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="props.description">
          {{ props.description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ props.cancelText }}</AlertDialogCancel>
        <AlertDialogAction
          :class="props.danger ? 'bg-destructive text-destructive-foreground hover:bg-destructive-hover' : ''"
          @click="emit('confirm')"
        >
          {{ props.confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
