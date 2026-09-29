<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'

import { useAppStore } from '@/stores/modules/app'

const props = defineProps<{
  option: EChartsOption
}>()

const appStore = useAppStore()
const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function render() {
  if (!el.value) return
  chart?.dispose()
  chart = echarts.init(el.value)
  chart.setOption(props.option)
}

onMounted(render)

watch(() => props.option, () => {
  chart?.setOption(props.option, true)
}, { deep: true })

// 切换暗黑模式时重建图表（颜色来自 CSS 变量）
watch(() => appStore.isDark, () => {
  nextTick(render)
})

useResizeObserver(el, () => {
  chart?.resize()
})

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="h-full w-full" />
</template>
