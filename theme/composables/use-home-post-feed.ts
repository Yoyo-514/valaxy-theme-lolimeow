import type { Post } from 'valaxy'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useSiteConfig, useSiteStore } from 'valaxy'
import { computed, ref, toValue, watch } from 'vue'
import { useThemeConfig } from './config'

const DEFAULT_PAGE_SIZE = 10

export function useHomePostFeed(
  curPage: MaybeRefOrGetter<number | undefined> = 1,
  infiniteScrollTrigger?: Readonly<ShallowRef<HTMLElement | null>>,
) {
  const themeConfig = useThemeConfig()
  const siteConfig = useSiteConfig()
  const site = useSiteStore()
  const innerInfiniteScrollTrigger = ref<HTMLElement | null>(null)
  // 允许组件传入自有触发点；未传入时由 composable 暴露内部默认触发点。
  const resolvedInfiniteScrollTrigger = infiniteScrollTrigger ?? innerInfiniteScrollTrigger

  const allPosts = computed<Post[]>(() => site.postList ?? [])
  const paginationType = computed(() => themeConfig.value.pagination?.type ?? 'standard')
  const isStandardPagination = computed(() => paginationType.value === 'standard')
  const isInfiniteScroll = computed(() => paginationType.value === 'infinite-scroll')
  const paginationAnimation = computed(() => {
    return isInfiniteScroll.value && Boolean(themeConfig.value.pagination?.animation)
  })

  const showHomeNotice = computed(() => {
    const notice = themeConfig.value.notice
    return notice.enable && Boolean(notice.message?.trim()) && ['home', 'global'].includes(notice.scope ?? 'home')
  })

  const currentPage = computed(() => {
    const page = Number(toValue(curPage))

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

  // 无限滚动只增加可见页数，真实文章切片仍统一由 pagedPosts 负责。
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
    () => resolvedInfiniteScrollTrigger.value,
    ([entry]) => {
      // 触发器进入预加载区域时再推进一页，避免滚动过程中一次性展开过多内容。
      if (!entry?.isIntersecting || !isInfiniteScroll.value || !hasMorePosts.value)
        return

      visiblePageCount.value += 1
    },
    {
      rootMargin: infiniteScrollRootMargin.value,
    },
  )

  return {
    currentPage,
    hasMorePosts,
    isInfiniteScroll,
    pagedPosts,
    paginationAnimation,
    showHomeNotice,
    showPagination,
    totalPages,
  }
}
