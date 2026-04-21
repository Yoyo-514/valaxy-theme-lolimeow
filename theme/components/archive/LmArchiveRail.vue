<script setup lang="ts">
import type { ArchiveGroup } from '@theme/composables'

defineProps<{
  groups: ArchiveGroup[]
  activeYear: string | null
  isAccordionMode: boolean
  unknownYearLabel: string
  countLabel: string
}>()

const emit = defineEmits<{
  (e: 'previewYear', year: string): void
  (e: 'selectYear', year: string): void
}>()

function displayYear(year: string, unknownYearLabel: string) {
  return year === 'Unknown' ? unknownYearLabel : year
}
</script>

<template>
  <div class="lm-archive-rail" :class="{ 'lm-archive-rail--accordion': isAccordionMode }">
    <section
      v-for="group in groups"
      :key="group.year"
      class="lm-archive-rail__block"
      :class="{ 'lm-archive-rail__block--active': activeYear === group.year }"
    >
      <button
        type="button"
        class="lm-archive-rail__button"
        :aria-expanded="isAccordionMode ? activeYear === group.year : undefined"
        @mouseenter="emit('previewYear', group.year)"
        @focus="emit('previewYear', group.year)"
        @click="emit('selectYear', group.year)"
      >
        <span class="lm-archive-rail__year">
          {{ displayYear(group.year, unknownYearLabel) }}
        </span>

        <span class="lm-archive-rail__meta">
          <span class="lm-archive-rail__count">{{ group.count }}</span>
          <span class="lm-archive-rail__unit">{{ countLabel }}</span>
        </span>
      </button>

      <Transition name="lm-archive-mobile">
        <div
          v-if="isAccordionMode && activeYear === group.year"
          class="lm-archive-rail__mobile-panel"
        >
          <LmArchiveEntryList :entries="group.entries" />
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped lang="scss">
.lm-archive-rail {
  @apply flex flex-col gap-5;
}

.lm-archive-rail__block {
  @apply relative;
}

.lm-archive-rail__button {
  @apply relative flex w-full items-center justify-between px-0 py-3 text-left transition-[color,transform] duration-220 ease-out;
  background: transparent;
  border: 0;
}

.lm-archive-rail__button::before {
  content: '';
  @apply absolute rounded-full;
  left: calc(100% + 0.9rem);
  top: 1.05rem;
  width: 0.7rem;
  height: 0.7rem;
  border: 2px solid color-mix(in srgb, var(--lm-c-brand) 28%, white);
  background: color-mix(in srgb, var(--lm-c-brand) 88%, white);
  box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--lm-c-brand-soft) 36%, transparent);
}

.lm-archive-rail__block--active .lm-archive-rail__button,
.lm-archive-rail__button:hover,
.lm-archive-rail__button:focus-visible {
  transform: translateX(0.12rem);
}

.lm-archive-rail__year {
  @apply inline-flex items-center text-lg leading-none font-800;
  color: var(--lm-c-text-primary);
}

.lm-archive-rail__meta {
  @apply inline-flex items-baseline gap-1.5;
}

.lm-archive-rail__count {
  @apply text-base leading-none font-800;
  color: color-mix(in srgb, var(--lm-c-brand) 96%, var(--lm-c-text-secondary));
}

.lm-archive-rail__unit {
  @apply text-[0.78rem] leading-none font-700;
  color: var(--lm-c-text-muted);
}

.lm-archive-rail__block--active .lm-archive-rail__year,
.lm-archive-rail__button:hover .lm-archive-rail__year,
.lm-archive-rail__button:focus-visible .lm-archive-rail__year {
  color: color-mix(in srgb, var(--lm-c-brand) 96%, var(--lm-c-text-secondary));
}

.lm-archive-rail__mobile-panel {
  @apply mt-3 pl-5;
}

.lm-archive-rail--accordion {
  @apply gap-2.5;
}

.lm-archive-rail--accordion .lm-archive-rail__button {
  @apply pl-8 pr-0 py-3;
}

.lm-archive-rail--accordion .lm-archive-rail__button::before {
  left: 0.63rem;
}

.lm-archive-rail--accordion .lm-archive-rail__block--active .lm-archive-rail__button,
.lm-archive-rail--accordion .lm-archive-rail__button:hover,
.lm-archive-rail--accordion .lm-archive-rail__button:focus-visible {
  transform: none;
}
</style>
