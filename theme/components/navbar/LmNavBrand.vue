<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'

const siteConfig = useSiteConfig()
const siteTitle = computed(() => siteConfig.value.title || '')
const siteFavicon = computed(() => siteConfig.value.favicon || '')
</script>

<template>
  <RouterLink
    class="lm-nav-brand"
    to="/"
    :aria-label="siteTitle"
  >
    <img
      class="lm-nav-brand__logo"
      style="width: auto; height: 32px"
      alt="logo"
      :src="siteFavicon"
    >
    <span class="lm-nav-brand__title">{{ siteTitle }}</span>
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
