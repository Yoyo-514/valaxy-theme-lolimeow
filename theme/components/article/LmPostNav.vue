<script setup lang="ts">
import { useFrontmatter, usePrevNext } from 'valaxy'

const frontmatter = useFrontmatter()
const [prev, next] = usePrevNext()
</script>

<template>
  <footer v-if="frontmatter.nav !== false && (prev?.path || next?.path)" class="lm-post-nav">
    <RouterLink
      v-if="prev?.path"
      :to="prev.path"
      class="lm-post-nav__item"
    >
      <span class="lm-post-nav__label">Previous Article</span>
      <span class="lm-post-nav__title">{{ prev.title }}</span>
    </RouterLink>

    <RouterLink
      v-if="next?.path"
      :to="next.path"
      class="lm-post-nav__item lm-post-nav__item--next"
    >
      <span class="lm-post-nav__label">Next Article</span>
      <span class="lm-post-nav__title">{{ next.title }}</span>
    </RouterLink>
  </footer>
</template>

<style lang="scss" scoped>
@use '@theme/styles/mixins/surface' as *;

.lm-post-nav {
  @apply mx-auto mt-4 flex w-full flex-col gap-3 md:flex-row md:justify-between px-4 sm:px-6 xl:px-0;
}

.lm-post-nav__item {
  @include lm-surface-panel;
  @apply flex min-w-0 flex-col rounded px-5 py-4 no-underline transition-transform duration-200 ease-out md:flex-1;

  &:hover {
    transform: translateY(-2px);
  }

  &:only-child {
    @apply w-full;
  }
}

.lm-post-nav__item--next {
  @apply text-left md:text-right;
}

.lm-post-nav__item:not(:only-child) {
  @apply md:max-w-[calc(50%-0.375rem)];
}

.lm-post-nav__label {
  @apply text-xs tracking-wide uppercase;
  color: var(--lm-c-text-muted);
}

.lm-post-nav__title {
  @apply mt-2 text-base leading-6 font-700;
  color: var(--lm-c-text-primary);
}
</style>
