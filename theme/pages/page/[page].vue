<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentPage = computed(() => {
  const params = route.params as { page?: string | string[] }
  const rawPage = Array.isArray(params.page)
    ? params.page[0]
    : params.page

  const page = Number(rawPage)

  if (!Number.isFinite(page))
    return 1

  return Math.max(1, Math.floor(page))
})
</script>

<template>
  <LmHomeContent :cur-page="currentPage" />
</template>

<route lang="yaml">
meta:
  layout: home
</route>
