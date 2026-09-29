<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const target = Array.isArray(route.params.path) ? route.params.path[0] : route.params.path
  router.replace({ path: `/${target ?? ''}`, query: route.query })
})
</script>

<template>
  <div />
</template>
