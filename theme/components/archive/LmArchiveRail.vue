<script setup lang="ts">
import type { ArchiveGroup } from '../../features/archive'

defineProps<{
  groups: ArchiveGroup[]
  selectedYear: string | null
  panelIdPrefix: string
  unknownYearLabel: string
  countLabel: string
}>()

const emit = defineEmits<{
  (e: 'selectYear', year: string): void
}>()
</script>

<template>
  <div class="lm-archive-rail">
    <section v-for="group in groups" :key="group.year" class="lm-archive-rail__year-group">
      <h2 class="lm-archive-rail__heading">
        <button
          :id="`${panelIdPrefix}-trigger-${group.year}`"
          type="button"
          class="lm-archive-rail__button"
          :aria-controls="`${panelIdPrefix}-panel-${group.year}`"
          :aria-expanded="selectedYear === group.year"
          @click="emit('selectYear', group.year)"
        >
          <span class="lm-archive-rail__year">{{ group.year === 'Unknown' ? unknownYearLabel : group.year }}</span>
          <span class="lm-archive-rail__meta">{{ group.count }} {{ countLabel }}</span>
          <span class="lm-archive-rail__toggle i-ri-arrow-down-s-line" aria-hidden="true" />
        </button>
      </h2>
      <div
        v-show="selectedYear === group.year"
        :id="`${panelIdPrefix}-panel-${group.year}`"
        class="lm-archive-rail__panel"
        role="region"
        :aria-labelledby="`${panelIdPrefix}-trigger-${group.year}`"
      >
        <LmArchiveEntryList :entries="group.entries" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.lm-archive-rail {
  @apply grid min-w-0;
}

.lm-archive-rail__year-group {
  @apply grid min-w-0 gap-x-8 gap-y-4 border-b py-5 md:grid-cols-[10rem_minmax(0,1fr)];
  border-color: var(--lm-c-primary-border-subtle);
}

.lm-archive-rail__year-group:last-child {
  border-bottom: 0;
}

.lm-archive-rail__heading {
  @apply m-0 self-start;
}

.lm-archive-rail__button {
  @apply grid min-h-12 w-full grid-cols-[1fr_auto_auto] items-center gap-3 border-0 px-2 py-2 text-left;
  border-radius: var(--lm-radius-sm);
  color: var(--lm-c-text-primary);
  background: transparent;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.lm-archive-rail__year {
  @apply text-2xl leading-8 font-800;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.lm-archive-rail__meta {
  @apply whitespace-nowrap text-sm font-500;
  color: var(--lm-c-text-secondary);
  font-variant-numeric: tabular-nums;
}

.lm-archive-rail__toggle {
  @apply text-base;
  transition: transform 0.2s ease;
}

.lm-archive-rail__button[aria-expanded='true'] .lm-archive-rail__toggle {
  transform: rotate(180deg);
}

.lm-archive-rail__button:hover,
.lm-archive-rail__button:focus-visible {
  color: var(--lm-c-primary-text-hover);
  background: var(--lm-c-primary-soft-hover);
}

.lm-archive-rail__panel {
  min-width: 0;
}

@media (min-width: 768px) {
  .lm-archive-rail__heading {
    position: sticky;
    top: calc(var(--lm-navbar-offset, 4.5rem) + 1rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-archive-rail__button,
  .lm-archive-rail__toggle {
    transition: none;
  }
}
</style>
