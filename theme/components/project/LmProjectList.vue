<script setup lang="ts">
import type { ResolvedProjectGroup } from '../../features/project'

defineProps<{
  groups: ResolvedProjectGroup[]
  emptyLabel: string
}>()
</script>

<template>
  <div v-if="groups.length" class="lm-project-list">
    <section
      v-for="group in groups"
      :key="group.title"
      class="lm-project-list__section"
    >
      <LmAggregateSectionHeader :title="group.title" :description="group.desc" />

      <div class="lm-project-list__grid">
        <LmProjectCard
          v-for="item in group.items"
          :key="item.name"
          :item="item"
        />
      </div>
    </section>
  </div>

  <LmAggregateEmpty v-else class="lm-project-list__empty" :label="emptyLabel" />
</template>

<style scoped lang="scss">
.lm-project-list {
  @apply grid gap-10;
}

.lm-project-list__section {
  @apply grid gap-5;
}

.lm-project-list__grid {
  @apply grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
</style>
