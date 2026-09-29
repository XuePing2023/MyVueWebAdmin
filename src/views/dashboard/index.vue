<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Megaphone,
  ShoppingCart,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import EChart from '@/components/EChart.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dashboardApi } from '@/api/dashboard'
import { useAppStore } from '@/stores/modules/app'
import type { DashboardData, TodoItem } from '@/types/api'
import { chartPalette, hslVar } from '@/utils/chart'
import { cn } from '@/utils/cn'

defineOptions({ name: 'Dashboard' })

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)

const data = ref<DashboardData | null>(null)
const todos = ref<TodoItem[]>([])

onMounted(async () => {
  data.value = await dashboardApi.getData()
  todos.value = data.value.todos
})

const statCards = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  return [
    { label: '用户总数', value: s.userTotal, growth: s.userGrowth, icon: Users, color: 'bg-blue-500' },
    { label: '今日访问', value: s.pvToday, growth: s.pvGrowth, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: '活跃用户', value: s.activeUser, growth: s.activeGrowth, icon: UserRound, color: 'bg-amber-500' },
    { label: '订单总量', value: s.orderTotal, growth: s.orderGrowth, icon: ShoppingCart, color: 'bg-violet-500' },
  ]
})

/** 访问趋势折线图 */
const trendOption = computed<EChartsOption>(() => {
  const trend = data.value?.trend ?? []
  const primary = hslVar('--primary')
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: hslVar('--popover'),
      borderColor: hslVar('--border'),
      textStyle: { color: hslVar('--popover-foreground') },
    },
    legend: {
      data: ['访问量（PV）', '独立访客（UV）'],
      textStyle: { color: hslVar('--muted-foreground') },
      top: 0,
      right: 0,
    },
    grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map(t => t.date),
      axisLine: { lineStyle: { color: hslVar('--border') } },
      axisLabel: { color: hslVar('--muted-foreground') },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: hslVar('--border') } },
      axisLabel: { color: hslVar('--muted-foreground') },
    },
    series: [
      {
        name: '访问量（PV）',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.map(t => t.pv),
        lineStyle: { width: 3, color: primary },
        itemStyle: { color: primary },
        areaStyle: { opacity: 0.12, color: primary },
      },
      {
        name: '独立访客（UV）',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.map(t => t.uv),
        lineStyle: { width: 3, color: chartPalette[1] },
        itemStyle: { color: chartPalette[1] },
        areaStyle: { opacity: 0.08, color: chartPalette[1] },
      },
    ],
  }
})

/** 角色分布环形图 */
const pieOption = computed<EChartsOption>(() => {
  const dist = data.value?.roleDist ?? []
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: hslVar('--popover'),
      borderColor: hslVar('--border'),
      textStyle: { color: hslVar('--popover-foreground') },
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: hslVar('--muted-foreground') },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: hslVar('--background'), borderWidth: 2 },
        label: { show: false },
        data: dist.map((d, i) => ({ ...d, itemStyle: { color: chartPalette[i % chartPalette.length] } })),
      },
    ],
  }
})

const roleBadgeVariant = (code: string) => {
  if (code === 'admin') return 'default'
  if (code === 'operator') return 'secondary'
  return 'outline'
}
</script>

<template>
  <div class="space-y-4">
    <!-- 统计卡片 -->
    <div v-if="data" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in statCards" :key="card.label" class="gap-0 py-5">
        <CardContent class="flex items-center justify-between px-5">
          <div class="space-y-1.5">
            <p class="text-sm text-muted-foreground">{{ card.label }}</p>
            <p class="text-2xl font-semibold tracking-tight">{{ card.value.toLocaleString() }}</p>
            <p class="flex items-center gap-1 text-xs">
              <span
                :class="cn(
                  'flex items-center gap-0.5 font-medium',
                  card.growth >= 0 ? 'text-success' : 'text-destructive',
                )"
              >
                <ArrowUpRight v-if="card.growth >= 0" class="h-3 w-3" />
                <ArrowDownRight v-else class="h-3 w-3" />
                {{ Math.abs(card.growth) }}%
              </span>
              <span class="text-muted-foreground">较上周</span>
            </p>
          </div>
          <div :class="cn('flex-center h-11 w-11 rounded-xl text-white', card.color)">
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28" />
    </div>

    <!-- 图表 -->
    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>访问趋势</CardTitle>
          <CardDescription>近 7 日站内访问量与独立访客统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="data" class="h-72">
            <EChart :option="trendOption" />
          </div>
          <Skeleton v-else class="h-72" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>用户角色分布</CardTitle>
          <CardDescription>系统内各角色用户占比</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="data" class="h-72">
            <EChart :option="pieOption" />
          </div>
          <Skeleton v-else class="h-72" />
        </CardContent>
      </Card>
    </div>

    <!-- 最新用户 / 待办 / 公告 -->
    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex flex-col gap-1.5">
            <CardTitle>最新注册用户</CardTitle>
            <CardDescription>最近加入系统的用户列表</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead class="hidden md:table-cell">
                  注册时间
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in data?.latestUsers ?? []" :key="user.id">
                <TableCell>
                  <div class="flex items-center gap-2.5">
                    <Avatar class="h-8 w-8">
                      <AvatarFallback class="text-xs">{{ user.nickname.slice(0, 1) }}</AvatarFallback>
                    </Avatar>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium">{{ user.nickname }}</p>
                      <p class="truncate text-xs text-muted-foreground">{{ user.username }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="role in user.roles" :key="role" :variant="roleBadgeVariant(role)">
                      {{ role }}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="user.status === 1 ? 'success' : 'destructive'">
                    {{ user.status === 1 ? '正常' : '禁用' }}
                  </Badge>
                </TableCell>
                <TableCell class="hidden text-muted-foreground md:table-cell">
                  {{ user.createdAt }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card>
          <CardHeader class="flex-row items-center justify-between">
            <div class="flex flex-col gap-1.5">
              <CardTitle>我的待办</CardTitle>
              <CardDescription>{{ todos.filter(t => !t.done).length }} 项待完成</CardDescription>
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <label
              v-for="todo in todos"
              :key="todo.id"
              class="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                :model-value="todo.done"
                @update:model-value="todo.done = $event === true"
              />
              <span :class="todo.done && 'text-muted-foreground line-through'">{{ todo.title }}</span>
            </label>
            <p v-if="!todos.length" class="py-4 text-center text-sm text-muted-foreground">
              暂无待办事项
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex-row items-center justify-between">
            <div class="flex flex-col gap-1.5">
              <CardTitle>系统公告</CardTitle>
              <CardDescription>平台最新动态</CardDescription>
            </div>
            <Megaphone class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="notice in data?.notices ?? []" :key="notice.id" class="flex items-start gap-2 text-sm">
              <Badge
                :variant="notice.level === 'warning' ? 'warning' : notice.level === 'success' ? 'success' : 'secondary'"
                class="mt-0.5 shrink-0"
              >
                公告
              </Badge>
              <div class="min-w-0">
                <p class="truncate">{{ notice.title }}</p>
                <p class="mt-0.5 text-xs text-muted-foreground">{{ notice.time }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
