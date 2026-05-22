import { computed, toValue } from 'vue'

interface PaginationItem {
  key: string
  type: 'page' | 'ellipsis'
  page?: number
  to?: string
  current?: boolean
}

interface UsePaginationItemsOptions {
  currentPage?: number
  totalPages: number
  basePath?: string
}

const MAX_VISIBLE_PAGES = 6
const SIBLING_COUNT = 1

function normalizePageNumber(value: number | undefined) {
  const page = Number(value)

  if (!Number.isFinite(page))
    return 1

  return Math.max(1, Math.floor(page))
}

function normalizeTotalPages(value: number) {
  const total = Number(value)

  if (!Number.isFinite(total) || total < 1)
    return 0

  return Math.floor(total)
}

function resolvePageLink(basePath: string, page: number) {
  if (page <= 1)
    return `${basePath}#lm-post-list-section`

  const normalizedBasePath = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath

  return `${normalizedBasePath}/page/${page}#lm-post-list-section`
}

function createPageRange(start: number, end: number) {
  if (end < start)
    return []

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function createEllipsisItem(key: string): PaginationItem {
  return {
    key,
    type: 'ellipsis',
  }
}

export function usePaginationItems(options: UsePaginationItemsOptions) {
  const currentPage = computed(() => normalizePageNumber(toValue(options.currentPage)))
  const totalPages = computed(() => normalizeTotalPages(toValue(options.totalPages)))
  const basePath = computed(() => toValue(options.basePath) || '/')

  function createPageItem(page: number): PaginationItem {
    return {
      key: `page-${page}`,
      type: 'page',
      page,
      to: resolvePageLink(basePath.value, page),
      current: page === currentPage.value,
    }
  }

  const paginationItems = computed<PaginationItem[]>(() => {
    if (totalPages.value <= 0)
      return []

    // 页数较少时完整展示，避免省略号带来额外的认知成本。
    if (totalPages.value <= MAX_VISIBLE_PAGES)
      return createPageRange(1, totalPages.value).map(createPageItem)

    // 页数较多时固定保留首页和尾页，中间只展示当前页附近的窗口。
    const windowStart = Math.max(2, currentPage.value - SIBLING_COUNT)
    const windowEnd = Math.min(totalPages.value - 1, currentPage.value + SIBLING_COUNT)
    const leadingItems = windowStart > 2
      ? [createEllipsisItem('ellipsis-left')]
      : createPageRange(2, windowStart - 1).map(createPageItem)
    const trailingItems = windowEnd < totalPages.value - 1
      ? [createEllipsisItem('ellipsis-right')]
      : createPageRange(windowEnd + 1, totalPages.value - 1).map(createPageItem)

    return [
      createPageItem(1),
      ...leadingItems,
      ...createPageRange(windowStart, windowEnd).map(createPageItem),
      ...trailingItems,
      createPageItem(totalPages.value),
    ]
  })

  const prevLink = computed(() => {
    if (currentPage.value <= 1)
      return null

    return resolvePageLink(basePath.value, currentPage.value - 1)
  })

  const nextLink = computed(() => {
    if (currentPage.value >= totalPages.value)
      return null

    return resolvePageLink(basePath.value, currentPage.value + 1)
  })

  return {
    currentPage,
    totalPages,
    paginationItems,
    prevLink,
    nextLink,
  }
}
