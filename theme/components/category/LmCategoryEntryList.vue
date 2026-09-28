<script setup lang="ts">
import type { CategoryEntry } from '../../features/category'
import { formatDate } from 'valaxy'

defineProps<{
  entries: CategoryEntry[]
}>()

/** 将分类条目的日期格式化为列表展示文本。 */
function formatEntryDate(date?: string | number | Date) {
  return formatDate(date ?? '')
}
</script>

<template>
  <ul class="lm-category-entry-list">
    <li
      v-for="entry in entries"
      :key="entry.path"
      class="lm-category-entry-list__item"
    >
      <RouterLink class="lm-category-entry-list__link" :to="entry.path">
        <span class="lm-category-entry-list__title">{{ entry.title }}</span>

        <time class="lm-category-entry-list__date" :datetime="formatEntryDate(entry.date)">
          {{ formatEntryDate(entry.date) }}
        </time>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.lm-category-entry-list {
  @apply m-0 grid min-w-0 list-none p-0;
}

.lm-category-entry-list__item {
  min-width: 0;
}

.lm-category-entry-list__link {
  @apply grid min-h-11 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-2 py-2 text-sm leading-6 no-underline;
  border-radius: var(--lm-radius-sm);
  color: var(--lm-c-text-primary);
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.lm-category-entry-list__title {
  overflow-wrap: anywhere;
}

.lm-category-entry-list__link:hover,
.lm-category-entry-list__link:focus-visible {
  color: var(--lm-c-primary-text-hover);
  background: var(--lm-c-primary-soft);
}

.lm-category-entry-list__date {
  @apply text-xs leading-5;
  color: var(--lm-c-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 639px) {
  .lm-category-entry-list__link {
    @apply grid-cols-1 items-start gap-x-0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-category-entry-list__link {
    transition: none;
  }
}
</style>
