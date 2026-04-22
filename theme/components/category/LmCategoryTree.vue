<script setup lang="ts">
import type { CategoryNode } from '@theme/composables'

const props = withDefaults(defineProps<{
  nodes: CategoryNode[]
  depth?: number
  emptyLabel?: string
  postCountLabel: string
  childCountLabel: string
  uncategorizedLabel: string
}>(), {
  depth: 0,
  emptyLabel: '',
})

function displayName(name: string) {
  return name === 'Uncategorized' ? props.uncategorizedLabel : name
}
</script>

<template>
  <div v-if="nodes.length" class="lm-category-tree" :class="{ 'lm-category-tree--nested': depth > 0 }">
    <section
      v-for="node in nodes"
      :key="node.fullPath"
      class="lm-category-tree__node"
    >
      <header class="lm-category-tree__head">
        <p v-if="node.parentPath" class="lm-category-tree__breadcrumb">
          {{ node.parentPath }}
        </p>

        <component
          :is="depth === 0 ? 'h2' : 'h3'"
          class="lm-category-tree__title"
        >
          {{ displayName(node.name) }}
        </component>

        <ul class="lm-category-tree__stats">
          <li class="lm-category-tree__stats-item">
            {{ node.total }} {{ postCountLabel }}
          </li>
          <li v-if="node.childCount" class="lm-category-tree__stats-item">
            {{ node.childCount }} {{ childCountLabel }}
          </li>
        </ul>
      </header>

      <div v-if="node.entries.length" class="lm-category-tree__entries">
        <LmCategoryEntryList :entries="node.entries" />
      </div>

      <div v-if="node.children.length" class="lm-category-tree__children">
        <LmCategoryTree
          :nodes="node.children"
          :depth="depth + 1"
          :post-count-label="postCountLabel"
          :child-count-label="childCountLabel"
          :uncategorized-label="uncategorizedLabel"
        />
      </div>
    </section>
  </div>

  <div v-else-if="emptyLabel && depth === 0" class="lm-category-tree__empty">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-category-tree {
  @apply grid gap-4 md:gap-5;
}

.lm-category-tree--nested {
  @apply mt-4 pl-4 md:pl-5;
  border-left: 1px solid color-mix(in srgb, var(--lm-c-brand) 12%, var(--lm-c-border));
}

.lm-category-tree__node {
  @apply border-b pb-4 md:pb-5;
  border-color: color-mix(in srgb, var(--lm-c-brand) 10%, var(--lm-c-border));
}

.lm-category-tree__node:last-child {
  @apply border-b-0 pb-0;
}

.lm-category-tree__head {
  @apply flex flex-col gap-2;
}

.lm-category-tree__breadcrumb {
  @apply m-0 text-xs leading-5 font-700 uppercase tracking-[0.14em];
  color: var(--lm-c-text-muted);
}

.lm-category-tree__title {
  @apply m-0 text-xl leading-8 font-800 md:text-2xl;
  color: var(--lm-c-text-primary);
}

.lm-category-tree__stats {
  @apply m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-sm leading-6;
  color: var(--lm-c-text-secondary);
}

.lm-category-tree__stats-item {
  @apply inline-flex items-center gap-1.5;
}

.lm-category-tree__stats-item::before {
  content: '';
  @apply inline-block h-1.5 w-1.5 rounded-full;
  background: color-mix(in srgb, var(--lm-c-brand) 60%, transparent);
}

.lm-category-tree__entries {
  @apply mt-3;
}

.lm-category-tree__children {
  @apply mt-4;
}

.lm-category-tree__empty {
  @apply rounded-6 border border-dashed px-5 py-12 text-center text-sm leading-7;
  border-color: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  color: var(--lm-c-text-secondary);
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 82%, transparent);
}

@media (max-width: 767px) {
  .lm-category-tree__title {
    @apply text-lg leading-7;
  }
}
</style>
