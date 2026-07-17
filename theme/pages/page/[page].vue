<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomePaginationBoundary } from '../../features/home'
import NotFoundLayout from '../../layouts/404.vue'
import HomeLayout from '../../layouts/home.vue'

const route = useRoute()
const router = useRouter()

const rawPage = computed(() => {
  const params = route.params as { page?: string | string[] }

  return Array.isArray(params.page)
    ? params.page[0]
    : params.page
})

const parsedPage = computed(() => Number(rawPage.value))

const currentPage = computed(() => {
  if (!Number.isFinite(parsedPage.value))
    return 1

  return Math.max(1, Math.floor(parsedPage.value))
})

const isPositiveIntegerPage = computed(() => {
  return Number.isInteger(parsedPage.value) && parsedPage.value > 0
})

const {
  isPageOutOfRange,
  isStandardPagination,
} = useHomePaginationBoundary(currentPage)

const shouldShowNotFound = computed(() => {
  return isPositiveIntegerPage.value
    && isStandardPagination.value
    && isPageOutOfRange.value
})

/**
 * 静态生成无法为动态分页路径设置真实 HTTP 状态码。
 * 首屏先同步渲染项目现有 404 布局，挂载后再进入站点的实际 404 页面。
 */
onMounted(() => {
  watch(shouldShowNotFound, (shouldRedirect) => {
    if (shouldRedirect)
      router.replace('/404')
  }, { immediate: true })
})
</script>

<template>
  <NotFoundLayout v-if="shouldShowNotFound" />

  <HomeLayout v-else>
    <LmHomeContent :cur-page="currentPage" />
  </HomeLayout>
</template>

<route lang="yaml">
meta:
  layout: false
</route>
