<script setup lang="ts">
import type { TagGroup } from '../../features/tag'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  groups: TagGroup[]
  emptyLabel: string
  postCountLabel: string
}>()

const activeId = ref('')

const activeGroup = computed(() => {
  return props.groups.find(group => group.id === activeId.value) ?? props.groups[0]
})

watch(
  () => props.groups,
  (groups) => {
    if (!groups.length) {
      activeId.value = ''
      return
    }

    if (!groups.some(group => group.id === activeId.value))
      activeId.value = groups[0].id
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="groups.length" class="lm-tag-index">
    <LmTagCloud
      :items="groups"
      :active-id="activeId"
      @select="activeId = $event"
    />

    <Transition name="lm-tag-index-panel" mode="out-in">
      <section
        v-if="activeGroup"
        :key="activeGroup.id"
        class="lm-tag-index__panel"
      >
        <LmAggregateSectionHeader
          :title="activeGroup.name"
          :meta="`${activeGroup.count} ${postCountLabel}`"
        />

        <LmTagEntryList :entries="activeGroup.entries" />
      </section>
    </Transition>
  </div>

  <LmAggregateEmpty v-else class="lm-tag-index__empty" :label="emptyLabel" />
</template>

<style scoped lang="scss">
.lm-tag-index {
  @apply flex flex-col gap-7;
}

.lm-tag-index__panel {
  @apply grid gap-4 border-t pt-5 md:grid-cols-[minmax(8rem,13rem)_minmax(0,1fr)] md:gap-7;
  border-color: var(--lm-c-primary-border-subtle);
}

.lm-tag-index-panel-enter-active,
.lm-tag-index-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.lm-tag-index-panel-enter-from,
.lm-tag-index-panel-leave-to {
  opacity: 0;
  transform: translateY(0.2rem);
}

@media (max-width: 767px) {
  .lm-tag-index {
    @apply gap-6;
  }
}
</style>
