<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

import Button from '@/components/ui/button/Button.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
}>(), {
  pageSizes: () => [10, 20, 50],
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

/** 生成页码数组，超出范围用省略号（-1）占位 */
const pages = computed<(number | -1)[]>(() => {
  const total = totalPages.value
  const current = props.page
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const list: (number | -1)[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) list.push(-1)
  for (let i = start; i <= end; i++) list.push(i)
  if (end < total - 1) list.push(-1)
  list.push(total)
  return list
})

function goPage(p: number) {
  if (p < 1 || p > totalPages.value || p === props.page) return
  emit('update:page', p)
}

function onPageSizeChange(size: string) {
  emit('update:pageSize', Number(size))
  emit('update:page', 1)
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 py-3">
    <div class="flex items-center gap-3 text-sm text-muted-foreground">
      <span>共 {{ props.total }} 条</span>
      <div class="flex items-center gap-2">
        <span>每页</span>
        <Select :model-value="String(props.pageSize)" @update:model-value="onPageSizeChange">
          <SelectTrigger class="h-8 w-18 px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in props.pageSizes" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
        <span>条</span>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="props.page <= 1"
        @click="goPage(props.page - 1)"
      >
        <ChevronLeft />
      </Button>
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <span v-if="p === -1" class="px-1.5 text-sm text-muted-foreground">…</span>
        <Button
          v-else
          :variant="p === props.page ? 'default' : 'outline'"
          size="icon-sm"
          @click="goPage(p)"
        >
          {{ p }}
        </Button>
      </template>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="props.page >= totalPages"
        @click="goPage(props.page + 1)"
      >
        <ChevronRight />
      </Button>
    </div>
  </div>
</template>
