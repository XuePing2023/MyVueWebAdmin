<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { House } from 'lucide-vue-next'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const route = useRoute()

const items = computed(() =>
  route.matched.filter(r => r.meta?.title && r.name !== 'Layout'),
)
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <RouterLink
          to="/"
          class="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <House class="h-3.5 w-3.5" />
          首页
        </RouterLink>
      </BreadcrumbItem>
      <template v-for="(item, i) in items" :key="item.path">
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <RouterLink
            v-if="i < items.length - 1"
            :to="item.path"
            class="transition-colors hover:text-foreground"
          >
            {{ item.meta.title }}
          </RouterLink>
          <BreadcrumbPage v-else>
            {{ item.meta.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
