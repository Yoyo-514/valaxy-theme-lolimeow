<script setup lang="ts">
import type { ResolvedLinkGroup } from '../../features/link'

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
      <LmAggregateSectionHeader :title="group.title" />

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

  <LmAggregateEmpty v-else class="lm-link-list__empty" :label="emptyLabel" />
</template>

<style scoped lang="scss">
.lm-link-list {
  @apply grid gap-10;
}

.lm-link-list__section {
  @apply grid gap-5;
}

.lm-link-list__grid {
  @apply grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
</style>
