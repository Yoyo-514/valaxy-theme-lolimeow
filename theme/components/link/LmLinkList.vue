<script setup lang="ts">
import type { ResolvedLinkGroup } from '@theme/composables'

defineProps<{
  groups: ResolvedLinkGroup[]
  emptyLabel: string
  statusCheck: boolean
}>()
</script>

<template>
  <div v-if="groups.length" class="lm-link-list">
    <section
      v-for="group in groups"
      :key="group.title"
      class="lm-link-list__section"
    >
      <h2 class="lm-link-list__title">
        {{ group.title }}
      </h2>

      <div class="lm-link-list__grid">
        <LmLinkCard
          v-for="item in group.items"
          :key="item.url"
          :item="item"
          :status-check="statusCheck"
        />
      </div>
    </section>
  </div>

  <div v-else class="lm-link-list__empty">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-link-list {
  @apply grid gap-10;
}

.lm-link-list__section {
  @apply grid gap-5;
}

.lm-link-list__title {
  @apply relative m-0 inline-flex w-fit text-2xl leading-8 font-900;
  color: var(--lm-c-text-primary);
}

.lm-link-list__title::after {
  content: '';
  @apply absolute left-0 h-2.5 rounded-full;
  right: -0.35rem;
  bottom: 0.08rem;
  z-index: -1;
  background: color-mix(in srgb, var(--lm-c-brand) 24%, transparent);
}

.lm-link-list__grid {
  @apply grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3;
}

.lm-link-list__empty {
  @apply rounded-6 border border-dashed px-5 py-12 text-center text-sm leading-7;
  border-color: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  color: var(--lm-c-text-secondary);
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 82%, transparent);
}
</style>
