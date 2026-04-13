<script setup lang="ts">
import type { Post } from 'valaxy'
import { useIntersectionObserver } from '@vueuse/core'
import { useSiteConfig, useSiteStore } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { useThemeConfig } from '../composables'

const props = withDefaults(defineProps<{
  curPage?: number
}>(), {
  curPage: 1,
})

const DEFAULT_PAGE_SIZE = 10

const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()
const site = useSiteStore()
const infiniteScrollTrigger = ref<HTMLElement | null>(null)

const allPosts = computed<Post[]>(() => site.postList ?? [])
const paginationType = computed(() => themeConfig.value.pagination?.type ?? 'standard')
const isStandardPagination = computed(() => paginationType.value === 'standard')
const isInfiniteScroll = computed(() => paginationType.value === 'infinite-scroll')
const paginationAnimation = computed(() => {
  return isInfiniteScroll.value && Boolean(themeConfig.value.pagination?.animation)
})

const currentPage = computed(() => {
  const page = Number(props.curPage)

  if (!Number.isFinite(page))
    return 1

  return Math.max(1, Math.floor(page))
})

// 优先消费主题分页配置；若用户没显式配置，再回退到 Valaxy 站点级 pageSize。
const itemsPerPage = computed(() => {
  const themePageSize = Number(themeConfig.value.pagination?.itemsPerPage)

  if (Number.isFinite(themePageSize) && themePageSize > 0)
    return Math.floor(themePageSize)

  const sitePageSize = Number(siteConfig.value.pageSize)

  if (Number.isFinite(sitePageSize) && sitePageSize > 0)
    return Math.floor(sitePageSize)

  return DEFAULT_PAGE_SIZE
})

const infiniteScrollOptions = computed(() => {
  return themeConfig.value.pagination?.infiniteScrollOptions ?? {}
})

const infiniteScrollThreshold = computed(() => {
  const threshold = Number(infiniteScrollOptions.value.threshold)

  if (!Number.isFinite(threshold) || threshold < 0)
    return 200

  return Math.floor(threshold)
})

const infiniteScrollPreload = computed(() => {
  return infiniteScrollOptions.value.preload ?? true
})

const infiniteScrollRootMargin = computed(() => {
  return infiniteScrollPreload.value
    ? `0px 0px ${infiniteScrollThreshold.value}px 0px`
    : '0px'
})

const visiblePageCount = ref(1)

const totalPages = computed(() => {
  if (allPosts.value.length === 0)
    return 0

  return Math.ceil(allPosts.value.length / itemsPerPage.value)
})

const isPageOutOfRange = computed(() => {
  return totalPages.value > 0 && currentPage.value > totalPages.value
})

const visiblePostLimit = computed(() => {
  return visiblePageCount.value * itemsPerPage.value
})

const hasMorePosts = computed(() => {
  if (!isInfiniteScroll.value)
    return false

  return visiblePostLimit.value < allPosts.value.length
})

const pagedPosts = computed<Post[]>(() => {
  if (isInfiniteScroll.value)
    return allPosts.value.slice(0, visiblePostLimit.value)

  if (isPageOutOfRange.value)
    return []

  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allPosts.value.slice(start, end)
})

const showPagination = computed(() => {
  return isStandardPagination.value && totalPages.value > 1
})

watch(
  [itemsPerPage, totalPages, isInfiniteScroll],
  () => {
    visiblePageCount.value = 1
  },
  { immediate: true },
)

useIntersectionObserver(
  infiniteScrollTrigger,
  ([entry]) => {
    if (!entry?.isIntersecting || !isInfiniteScroll.value || !hasMorePosts.value)
      return

    visiblePageCount.value += 1
  },
  {
    rootMargin: infiniteScrollRootMargin.value,
  },
)
</script>

<template>
  <div id="lm-home-content" class="flex flex-col">
    <LmPostList :posts="pagedPosts" :cur-page="currentPage" :animate-items="paginationAnimation" />

    <LmPagination
      v-if="showPagination"
      :current-page="currentPage"
      :total-pages="totalPages"
      base-path="/"
    />

    <div
      v-if="isInfiniteScroll && hasMorePosts"
      ref="infiniteScrollTrigger"
      class="h-1 w-full"
      aria-hidden="true"
    />
  </div>
</template>
