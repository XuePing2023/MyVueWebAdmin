<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Ban } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

defineOptions({ name: 'ForbiddenPage' })

const router = useRouter()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
    <div class="flex items-center gap-3 text-destructive">
      <Ban class="h-16 w-16" />
      <span class="text-7xl font-bold tracking-tight">403</span>
    </div>
    <p class="text-lg font-medium">抱歉，您没有权限访问该页面</p>
    <p class="text-sm text-muted-foreground">
      请联系管理员开通权限，或返回首页继续操作
    </p>
    <div class="mt-2 flex gap-3">
      <Button @click="router.push('/')">
        返回首页
      </Button>
      <Button variant="outline" @click="router.back()">
        返回上一页
      </Button>
    </div>
  </div>
</template>
