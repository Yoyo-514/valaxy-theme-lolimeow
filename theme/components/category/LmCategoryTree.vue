<script setup lang="ts">
import type { CategoryNode } from '../../features/category'

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

/** 将未分类节点的内部名称转换为本地化展示文本。 */
function displayName(name: string) {
  return name === 'Uncategorized' ? props.uncategorizedLabel : name
}
</script>

<template>
  <ul v-if="nodes.length" class="lm-category-tree" :class="{ 'lm-category-tree--nested': depth > 0 }">
    <li
      v-for="node in nodes"
      :key="node.fullPath"
      class="lm-category-tree__node"
    >
      <details class="lm-category-tree__disclosure">
        <summary class="lm-category-tree__trigger">
          <span class="lm-category-tree__toggle i-ri-arrow-right-s-line" aria-hidden="true" />
          <span class="lm-category-tree__title">
            {{ displayName(node.name) }}
          </span>

          <span class="lm-category-tree__stats">
            <span class="lm-category-tree__stats-item">
              {{ node.total }} {{ postCountLabel }}
            </span>
            <span v-if="node.childCount" class="lm-category-tree__stats-item">
              {{ node.childCount }} {{ childCountLabel }}
            </span>
          </span>
        </summary>

        <div class="lm-category-tree__panel">
          <LmCategoryEntryList v-if="node.entries.length" :entries="node.entries" />
          <LmCategoryTree
            v-if="node.children.length"
            :nodes="node.children"
            :depth="depth + 1"
            :post-count-label="postCountLabel"
            :child-count-label="childCountLabel"
            :uncategorized-label="uncategorizedLabel"
          />
        </div>
      </details>
    </li>
  </ul>

  <LmAggregateEmpty v-else-if="emptyLabel && depth === 0" class="lm-category-tree__empty" :label="emptyLabel" />
</template>

<style scoped lang="scss">
.lm-category-tree {
  @apply m-0 grid min-w-0 list-none p-0;
}

.lm-category-tree--nested {
  @apply pl-3;
  border-inline-start: 1px solid var(--lm-c-primary-border-subtle);
}

.lm-category-tree__node {
  @apply min-w-0 border-b py-2;
  border-color: var(--lm-c-primary-border-subtle);
}

.lm-category-tree__node:last-child {
  @apply border-b-0;
}

.lm-category-tree__title {
  @apply min-w-0 text-lg leading-7 font-700 sm:text-xl sm:leading-8;
  color: var(--lm-c-text-primary);
  overflow-wrap: anywhere;
}

.lm-category-tree--nested .lm-category-tree__title {
  @apply text-base leading-7 font-600;
}

.lm-category-tree__trigger {
  @apply grid min-h-14 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-2 py-3 text-left;
  list-style: none;
  border-radius: var(--lm-radius-sm);
  color: inherit;
  transition: background-color 0.2s ease;
}

.lm-category-tree__trigger::-webkit-details-marker {
  display: none;
}

.lm-category-tree__trigger:hover,
.lm-category-tree__trigger:focus-visible {
  background: var(--lm-c-primary-soft);
}

.lm-category-tree__toggle {
  @apply inline-block h-5 w-5;
  color: var(--lm-c-text-secondary);
  transition: transform 0.2s ease;
}

.lm-category-tree__disclosure[open] > .lm-category-tree__trigger > .lm-category-tree__toggle {
  transform: rotate(90deg);
  color: var(--lm-c-primary-text);
}

.lm-category-tree__stats {
  @apply flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm leading-6;
  color: var(--lm-c-text-secondary);
  font-variant-numeric: tabular-nums;
}

.lm-category-tree__stats-item {
  white-space: nowrap;
}

.lm-category-tree__panel {
  @apply grid min-w-0 gap-3 pb-3 pl-8 pr-2;
}

// 支持自动尺寸插值的浏览器使用原生过渡，其余浏览器保留原生展开行为。
@supports (interpolate-size: allow-keywords) and selector(details::details-content) {
  .lm-category-tree__disclosure {
    interpolate-size: allow-keywords;
  }

  .lm-category-tree__disclosure::details-content {
    block-size: 0;
    opacity: 0;
    overflow: clip;
    transition:
      block-size 0.18s ease-out,
      opacity 0.12s ease-out,
      content-visibility 0.18s allow-discrete;
  }

  .lm-category-tree__disclosure[open]::details-content {
    block-size: auto;
    opacity: 1;
    transition-duration: 0.22s, 0.16s, 0.22s;
  }
}

@media (max-width: 767px) {
  .lm-category-tree__trigger {
    @apply grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2;
  }

  .lm-category-tree__stats {
    @apply col-start-2 justify-start text-xs;
  }

  .lm-category-tree__panel {
    @apply pl-3 pr-0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-category-tree__toggle,
  .lm-category-tree__trigger,
  .lm-category-tree__disclosure::details-content {
    transition: none;
  }
}
</style>
