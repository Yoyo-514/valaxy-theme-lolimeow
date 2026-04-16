<script setup lang="ts">
import type { Post } from 'valaxy'
import { useThemeConfig } from '@theme/composables'
import { useElementSize } from '@vueuse/core'
import { useSiteStore } from 'valaxy'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
  animateItems?: boolean
}>(), {
  curPage: 1,
  animateItems: false,
})

const themeConfig = useThemeConfig()
const site = useSiteStore()

const listSection = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(listSection)

const title = computed(() => themeConfig.value.postList.title ?? 'Discovery')

const allPosts = computed(() => {
  const list = site.postList || []
  if (!props.type)
    return list

  return list.filter(post => post.type === props.type)
})

const posts = computed(() => props.posts ?? allPosts.value)

const WIDTH_REGEX = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem)?$/i
const DEFAULT_MIN_CARD_WIDTH = '18rem'
const GRID_GAP_PX = 16

function clampColumnCount(value: unknown) {
  const count = Number(value)

  if (!Number.isFinite(count))
    return 1

  return Math.min(6, Math.max(1, Math.floor(count)))
}

function resolveLengthToPx(value: number | string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value))
    return value

  const raw = String(value ?? DEFAULT_MIN_CARD_WIDTH).trim()
  const match = raw.match(WIDTH_REGEX)

  if (!match)
    return 288

  const amount = Number(match[1])
  const unit = (match[2] ?? 'px').toLowerCase()
  const rootFontSize = typeof window !== 'undefined'
    ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16

  if (unit === 'rem')
    return amount * rootFontSize

  return amount
}

const maxColumns = computed(() => {
  return clampColumnCount(themeConfig.value.postList.maxColumns ?? 1)
})

const minCardWidth = computed(() => {
  return themeConfig.value.postList.minCardWidth ?? DEFAULT_MIN_CARD_WIDTH
})

const minCardWidthPx = computed(() => resolveLengthToPx(minCardWidth.value))

const actualColumns = computed(() => {
  if (!containerWidth.value)
    return 1

  const fittedColumns = Math.floor((containerWidth.value + GRID_GAP_PX) / (minCardWidthPx.value + GRID_GAP_PX))
  return Math.max(1, Math.min(maxColumns.value, fittedColumns || 1))
})

const gridStyle = computed(() => {
  return {
    '--lm-post-list-columns': String(actualColumns.value),
  }
})
</script>

<template>
  <section ref="listSection" class="py-6 md:py-8">
    <div class="mb-6">
      <h2 class="text-[1.5rem] text-[var(--lm-c-text-primary)] leading-[1.3] font-700 m-0">
        {{ title }}
      </h2>
    </div>
    <ul v-if="posts.length > 0" :style="gridStyle" class="lm-post-list m-0 p-0 list-none">
      <li
        v-for="(post, index) in posts"
        :key="post.path"
        class="lm-post-list__item m-0"
        :class="{ 'lm-post-list__item--animated': props.animateItems }"
      >
        <LmPostCard :post="post" :index="index" />
      </li>
    </ul>
    <div
      v-else
      class="text-[var(--lm-c-text-secondary)] px-4 py-12 text-center border border-[var(--lm-c-border)] rounded-4 border-dashed bg-[color-mix(in_srgb,var(--lm-c-bg-glass)_72%,transparent)]"
    >
      No posts found.
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-post-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(var(--lm-post-list-columns, 1), minmax(0, 1fr));
}

.lm-post-list__item {
  min-width: 0;
  display: flex;
  container-type: inline-size;
}

.lm-post-list__item--animated {
  animation: lm-post-list-item-enter 0.45s ease-out both;
}

@keyframes lm-post-list-item-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-post-list__item--animated {
    animation: none;
  }
}
</style>
