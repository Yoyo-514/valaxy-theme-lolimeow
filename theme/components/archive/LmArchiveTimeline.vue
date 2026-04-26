<script setup lang="ts">
import type { ArchiveGroup } from '../../composables'
import { useArchiveTimelineState } from '../../composables'

const props = defineProps<{
  groups: ArchiveGroup[]
  emptyLabel: string
  unknownYearLabel: string
  countLabel: string
}>()

const {
  isAccordionMode,
  activeYear,
  activeGroup,
  previewGroup,
  resetDesktopPreview,
  selectGroup,
} = useArchiveTimelineState(() => props.groups)
</script>

<template>
  <div v-if="groups.length" class="lm-archive">
    <div
      class="lm-archive__shell"
      :class="{ 'lm-archive__shell--accordion': isAccordionMode }"
      @mouseleave="resetDesktopPreview"
    >
      <LmArchiveRail
        :groups="groups"
        :active-year="activeYear"
        :is-accordion-mode="isAccordionMode"
        :unknown-year-label="unknownYearLabel"
        :count-label="countLabel"
        @preview-year="previewGroup"
        @select-year="selectGroup"
      />

      <div v-if="!isAccordionMode" class="lm-archive__stage">
        <Transition name="lm-archive-stage" mode="out-in">
          <section
            v-if="activeGroup"
            :key="activeGroup.year"
            class="lm-archive__panel"
          >
            <LmArchiveEntryList :entries="activeGroup.entries" />
          </section>
        </Transition>
      </div>
    </div>
  </div>

  <div v-else class="lm-archive__empty">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-archive {
  @apply flex flex-col;
}

.lm-archive__shell {
  @apply relative grid gap-x-8;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
}

.lm-archive__shell::before {
  content: '';
  position: absolute;
  left: calc(12rem + 1.25rem);
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
}

.lm-archive__shell--accordion {
  grid-template-columns: minmax(0, 1fr);
}

.lm-archive__shell--accordion::before {
  left: 0.95rem;
}

.lm-archive__stage {
  @apply min-h-[12rem];
}

.lm-archive__panel {
  @apply h-full;
}

.lm-archive__empty {
  @apply rounded-6 border border-dashed px-5 py-12 text-center text-sm leading-7;
  border-color: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  color: var(--lm-c-text-secondary);
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 82%, transparent);
}

.lm-archive-stage-enter-active,
.lm-archive-stage-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.lm-archive-stage-enter-from,
.lm-archive-stage-leave-to {
  opacity: 0;
  transform: translateY(0.35rem);
}

:deep(.lm-archive-mobile-enter-active),
:deep(.lm-archive-mobile-leave-active) {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

:deep(.lm-archive-mobile-enter-from),
:deep(.lm-archive-mobile-leave-to) {
  opacity: 0;
  transform: translateY(-0.2rem);
}
</style>
