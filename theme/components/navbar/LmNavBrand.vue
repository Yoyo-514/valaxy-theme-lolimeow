<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <RouterLink
    class="lm-nav-brand"
    to="/"
    :aria-label="siteConfig.title"
  >
    <img
      class="lm-nav-brand__logo"
      style="width: 40px; height: 28px"
      alt="logo"
      :src="siteConfig.favicon"
    >
    <span class="lm-nav-brand__title">{{ siteConfig.title }}</span>
  </RouterLink>
</template>

<style lang="scss" scoped>
.lm-nav-brand {
  @apply inline-flex items-center gap-2 text-[var(--lm-c-text-primary)] no-underline;
}

.lm-nav-brand__logo {
  @apply block shrink-0;
}

.lm-nav-brand__title {
  @apply hidden text-sm leading-[1.2] font-700 sm:text-base md:inline;
}
</style>
