<script setup lang="ts">
import type { ArchiveEntry } from '../../features/archive'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildArchiveMonths } from '../../features/archive'

const props = defineProps<{
  entries: ArchiveEntry[]
}>()

const { t } = useI18n()
const site = useSiteConfig()
const months = computed(() => buildArchiveMonths(props.entries, site.value.timezone))
</script>

<template>
  <div class="lm-archive-entry-list">
    <section v-for="group in months" :key="group.month" class="lm-archive-entry-list__month">
      <h3 class="lm-archive-entry-list__month-title">
        {{ group.month === 'Unknown' ? t('pages.archives.unknownDate') : t('pages.archives.month', { month: Number(group.month.slice(5)) }) }}
      </h3>
      <ol class="lm-archive-entry-list__entries">
        <li v-for="entry in group.entries" :key="entry.path">
          <RouterLink class="lm-archive-entry-list__link" :to="entry.path">
            <time v-if="entry.calendarDate" class="lm-archive-entry-list__date" :datetime="entry.calendarDate">
              {{ entry.calendarDate.slice(5) }}
            </time>
            <span v-else class="lm-archive-entry-list__date">—</span>
            <span class="lm-archive-entry-list__body">
              <span class="lm-archive-entry-list__title">{{ entry.title }}</span>
              <span v-if="entry.categories.length" class="lm-archive-entry-list__meta">{{ entry.categories.join(' / ') }}</span>
            </span>
          </RouterLink>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped lang="scss">
.lm-archive-entry-list {
  @apply grid min-w-0 gap-8;
}

.lm-archive-entry-list__month-title {
  @apply m-0 mb-2 px-2 text-sm leading-7 font-700;
  color: var(--lm-c-text-secondary);
  font-variant-numeric: tabular-nums;
}

.lm-archive-entry-list__entries {
  @apply m-0 grid list-none p-0;
}

.lm-archive-entry-list__link {
  @apply grid min-h-12 grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-3 px-2 py-3 no-underline;
  border-radius: var(--lm-radius-sm);
  color: var(--lm-c-text-primary);
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.lm-archive-entry-list__link:hover,
.lm-archive-entry-list__link:focus-visible {
  color: var(--lm-c-primary-text-hover);
  background: var(--lm-c-primary-soft-hover);
}

.lm-archive-entry-list__date {
  @apply text-sm;
  color: var(--lm-c-text-secondary);
  font-variant-numeric: tabular-nums;
}

.lm-archive-entry-list__body {
  @apply grid min-w-0 gap-1;
  overflow-wrap: anywhere;
}

.lm-archive-entry-list__title {
  @apply text-base leading-7 font-600;
}

.lm-archive-entry-list__meta {
  @apply text-xs leading-5;
  color: var(--lm-c-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .lm-archive-entry-list__link {
    transition: none;
  }
}
</style>
