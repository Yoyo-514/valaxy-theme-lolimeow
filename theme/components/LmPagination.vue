<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  currentPage?: number
  totalPages: number
  basePath?: string
}>(), {
  currentPage: 1,
  basePath: '/',
})

interface PaginationItem {
  key: string
  type: 'page' | 'ellipsis'
  page?: number
  to?: string
  current?: boolean
}

const MAX_VISIBLE_PAGES = 6
const SIBLING_COUNT = 1

const currentPage = computed(() => {
  const page = Number(props.currentPage)

  if (!Number.isFinite(page))
    return 1

  return Math.max(1, Math.floor(page))
})

const totalPages = computed(() => {
  const total = Number(props.totalPages)

  if (!Number.isFinite(total) || total < 1)
    return 0

  return Math.floor(total)
})

function resolvePageLink(page: number) {
  if (page <= 1)
    return props.basePath

  const normalizedBasePath = props.basePath.endsWith('/')
    ? props.basePath.slice(0, -1)
    : props.basePath

  return `${normalizedBasePath}/page/${page}`
}

function createPageItem(page: number): PaginationItem {
  return {
    key: `page-${page}`,
    type: 'page',
    page,
    to: resolvePageLink(page),
    current: page === currentPage.value,
  }
}

const paginationItems = computed<PaginationItem[]>(() => {
  if (totalPages.value <= 0)
    return []

  if (totalPages.value <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages.value }, (_, index) => createPageItem(index + 1))
  }

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

  return resolvePageLink(currentPage.value - 1)
})

const nextLink = computed(() => {
  if (currentPage.value >= totalPages.value)
    return null

  return resolvePageLink(currentPage.value + 1)
})
</script>

<template>
  <nav
    v-if="paginationItems.length > 0"
    class="lm-pagination"
    aria-label="Pagination"
  >
    <AppLink
      v-if="prevLink"
      class="lm-pagination__control"
      :to="prevLink"
      aria-label="Previous page"
    >
      <div i-ri-arrow-left-s-line class="lm-pagination__control-icon" />
    </AppLink>

    <div class="lm-pagination__pages">
      <template v-for="item in paginationItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'" class="lm-pagination__ellipsis" aria-hidden="true">
          ...
        </span>

        <AppLink
          v-else
          class="lm-pagination__page"
          :class="{ 'is-current': item.current }"
          :to="item.to"
          :aria-current="item.current ? 'page' : undefined"
        >
          {{ item.page }}
        </AppLink>
      </template>
    </div>

    <AppLink
      v-if="nextLink"
      class="lm-pagination__control"
      :to="nextLink"
      aria-label="Next page"
    >
      <div i-ri-arrow-right-s-line class="lm-pagination__control-icon" />
    </AppLink>
  </nav>
</template>

<style lang="scss" scoped>
@use '../styles/mixins/surface' as *;

.lm-pagination {
  @apply mt-6 flex items-center justify-center gap-3;
}

.lm-pagination__pages {
  @apply flex flex-wrap items-center justify-center gap-2;
}

.lm-pagination__control,
.lm-pagination__page {
  @apply inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-transparent px-3.5 text-sm no-underline transition-all duration-200 ease-out;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 62%, transparent),
    color-mix(in srgb, var(--lm-c-border) 68%, transparent),
    0 10px 18px rgb(15 23 42 / 0.08),
    var(--lm-blur-panel)
  );
  color: var(--lm-c-text-secondary);

  &:hover {
    color: var(--lm-c-text-primary);
    border-color: color-mix(in srgb, var(--lm-c-border-hover) 84%, transparent);
    background: color-mix(in srgb, var(--lm-c-bg-glass) 74%, transparent);
    transform: translateY(-1px);
  }
}

.lm-pagination__page.is-current {
  color: var(--lm-c-brand);
  border-color: color-mix(in srgb, var(--lm-c-brand) 36%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-c-brand) 14%, transparent);
  pointer-events: none;
}

.lm-pagination__control {
  @apply px-0;
  width: 2.5rem;
}

.lm-pagination__control-icon {
  @apply text-lg leading-none;
}

.lm-pagination__ellipsis {
  @apply inline-flex h-10 min-w-8 items-center justify-center text-sm;
  color: var(--lm-c-text-muted);
}

@media (max-width: 640px) {
  .lm-pagination {
    @apply gap-2 px-3 py-3;
  }

  .lm-pagination__pages {
    @apply gap-1.5;
  }

  .lm-pagination__control,
  .lm-pagination__page {
    @apply h-9 min-w-9 px-3;
  }

  .lm-pagination__control {
    width: 2.25rem;
    @apply px-0;
  }

  .lm-pagination__ellipsis {
    @apply h-9 min-w-7;
  }
}
</style>
