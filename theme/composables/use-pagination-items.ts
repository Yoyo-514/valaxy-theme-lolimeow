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
    return basePath

  const normalizedBasePath = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath

  return `${normalizedBasePath}/page/${page}`
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

    if (totalPages.value <= MAX_VISIBLE_PAGES)
      return Array.from({ length: totalPages.value }, (_, index) => createPageItem(index + 1))

    const items: PaginationItem[] = [createPageItem(1)]
    const windowStart = Math.max(2, currentPage.value - SIBLING_COUNT)
    const windowEnd = Math.min(totalPages.value - 1, currentPage.value + SIBLING_COUNT)

    if (windowStart > 2) {
      items.push({
        key: 'ellipsis-left',
        type: 'ellipsis',
      })
    }
    else {
      for (let page = 2; page < windowStart; page += 1)
        items.push(createPageItem(page))
    }

    for (let page = windowStart; page <= windowEnd; page += 1)
      items.push(createPageItem(page))

    if (windowEnd < totalPages.value - 1) {
      items.push({
        key: 'ellipsis-right',
        type: 'ellipsis',
      })
    }
    else {
      for (let page = windowEnd + 1; page < totalPages.value; page += 1)
        items.push(createPageItem(page))
    }

    items.push(createPageItem(totalPages.value))

    return items
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
