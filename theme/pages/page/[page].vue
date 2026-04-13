<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentPage = computed(() => {
  const rawPage = Array.isArray(route.params.page)
    ? route.params.page[0]
    : route.params.page

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
