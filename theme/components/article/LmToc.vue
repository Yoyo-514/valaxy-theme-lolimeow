<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArticleToc } from '../../features/article/toc-context'

const { t } = useI18n()
const { items, visible, activeLink, handleClick } = useArticleToc()
const navRef = ref<HTMLElement>()

watch(activeLink, async () => {
  await nextTick()

  const nav = navRef.value
  const activeItem = nav?.querySelector<HTMLElement>('.lm-toc__link--active')
  if (!nav?.clientHeight || !activeItem)
    return

  // 只滚动目录自身；scrollIntoView 会连带滚动页面，窄桌面下还可能横向挪动视口。
  const bounds = nav.getBoundingClientRect()
  const itemBounds = activeItem.getBoundingClientRect()
  const offset = itemBounds.top < bounds.top
    ? itemBounds.top - bounds.top
    : Math.max(0, itemBounds.bottom - bounds.bottom)
  nav.scrollTop += offset
})
</script>

<template>
  <aside
    v-if="visible"
    class="lm-toc"
    :aria-label="t('toc.label')"
  >
    <div class="lm-toc__inner">
      <div class="lm-toc__header">
        <p class="lm-toc__eyebrow">
          {{ t('toc.eyebrow') }}
        </p>
        <h2 class="lm-toc__title">
          {{ t('toc.title') }}
        </h2>
      </div>

      <nav ref="navRef" class="lm-toc__nav">
        <a
          v-for="item in items"
          :key="item.link"
          :href="item.link"
          class="lm-toc__link"
          :class="{
            'lm-toc__link--active': activeLink === item.link,
            'lm-toc__link--nested': item.depth > 0,
          }"
          @click="handleClick"
        >
          {{ item.title }}
        </a>
      </nav>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.lm-toc {
  @apply hidden xl:block;
  height: 100%;
}

.lm-toc__inner {
  @apply sticky flex min-h-0 flex-col;
  top: calc(var(--lm-navbar-offset, 5.25rem) + 0.75rem);
  max-height: calc(100vh - var(--lm-navbar-offset, 5.25rem) - 1.5rem);
  transition: top 0.25s ease-in-out;
}

.lm-toc__header {
  @apply px-1;
}

.lm-toc__eyebrow {
  @apply m-0 text-xs font-700 uppercase tracking-[0.16em];
  color: var(--lm-c-text-muted);
}

.lm-toc__title {
  @apply mt-2 text-lg font-700;
  color: var(--lm-c-text-primary);
}

.lm-toc__nav {
  @apply mt-5 min-h-0 flex flex-col gap-1.5 overflow-y-auto border-l pl-4 pr-2;
  border-color: var(--lm-c-primary-border);
  overscroll-behavior: contain;
  --lm-scrollbar-size: 0.45rem;
}

.lm-toc__link {
  @apply relative py-1 text-[0.98rem] leading-7 no-underline transition-colors duration-200 ease-out;
  color: var(--lm-c-text-secondary);
  overflow-wrap: anywhere;

  &::before {
    content: '';
    position: absolute;
    left: -1.0625rem;
    top: 50%;
    width: 2px;
    height: 1rem;
    transform: translateY(-50%);
    background: transparent;
    transition: background-color 0.2s ease;
  }

  &:hover,
  &:focus-visible {
    color: var(--lm-c-primary-text-hover);
  }
}

.lm-toc__link--nested {
  @apply pl-3 text-[0.93rem];
  color: var(--lm-c-text-secondary);
}

.lm-toc__link--active {
  color: var(--lm-c-primary-text);
  font-weight: 700;

  &::before {
    background: var(--lm-c-primary-base);
  }
}
</style>
