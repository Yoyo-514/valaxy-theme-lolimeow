<script setup lang="ts">
import type { TagCloudSourceItem } from '../../features/tag'
import { useTemplateRef } from 'vue'
import { usePackedTagCloud } from '../../features/tag/use-packed-tag-cloud'

const props = defineProps<{
  items: TagCloudSourceItem[]
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const container = useTemplateRef<HTMLElement>('cloud')
const { items: cloudItems, packed } = usePackedTagCloud(() => props.items, container)
</script>

<template>
  <div
    ref="cloud"
    class="lm-tag-cloud"
    :class="{ 'lm-tag-cloud--packed': packed, 'lm-tag-cloud--small': cloudItems.length <= 3 }"
    :style="packed ? { minHeight: `${packed.height}px` } : undefined"
  >
    <button
      v-for="item in cloudItems"
      :key="item.id"
      type="button"
      class="lm-tag-cloud__item"
      :class="{ 'lm-tag-cloud__item--active': item.id === activeId }"
      :data-tag-id="item.id"
      :style="{
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        transform: packed?.positions[item.id] ? `translate(${packed.positions[item.id].x}px, ${packed.positions[item.id].y}px)` : undefined,
      }"
      :aria-pressed="item.id === activeId"
      :aria-label="`${item.name}, ${item.count}`"
      @click="emit('select', item.id)"
    >
      <span class="lm-tag-cloud__name">{{ item.name }}</span>
      <span class="lm-tag-cloud__count" aria-hidden="true">{{ item.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.lm-tag-cloud {
  @apply relative mx-auto flex min-h-48 w-full max-w-3xl flex-wrap content-start items-center justify-center gap-x-5 gap-y-2 py-3 text-center;
}

.lm-tag-cloud--small {
  min-height: 7.5rem;
}

.lm-tag-cloud__item {
  @apply relative inline-flex min-h-6 max-w-full items-center border-0 bg-transparent p-0;
  line-height: 1.1;
  color: var(--lm-c-text-secondary);
  font-family: inherit;
  transition: color 0.15s ease;
}

.lm-tag-cloud__item:hover,
.lm-tag-cloud__item:focus-visible {
  color: var(--lm-c-primary-text-hover);
}

.lm-tag-cloud__item--active {
  color: var(--lm-c-text-primary);
}

.lm-tag-cloud__name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.lm-tag-cloud__item--active .lm-tag-cloud__name {
  text-decoration: underline;
  text-decoration-color: var(--lm-c-primary-border-strong);
  text-decoration-thickness: 0.12em;
  text-underline-offset: 0.18em;
}

.lm-tag-cloud__count {
  @apply pointer-events-none absolute text-xs font-700;
  top: -0.25rem;
  right: -0.5rem;
  color: var(--lm-c-text-secondary);
  opacity: 0;
  font-variant-numeric: tabular-nums;
  transition: opacity 0.15s ease;
}

.lm-tag-cloud__item:hover .lm-tag-cloud__count,
.lm-tag-cloud__item:focus-visible .lm-tag-cloud__count,
.lm-tag-cloud__item--active .lm-tag-cloud__count {
  opacity: 1;
}
</style>
