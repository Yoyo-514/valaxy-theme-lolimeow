<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const navbarOptions = computed(() => themeConfig.value.navbarOptions ?? {})
const siteTitle = computed(() => siteConfig.value.title || '')
const navbarTitle = computed(() => {
  const title = navbarOptions.value.title

  return title || siteTitle.value
})
const siteFavicon = computed(() => siteConfig.value.favicon || '')
const showFavicon = computed(() => navbarOptions.value.showFavicon !== false && Boolean(siteFavicon.value))
</script>

<template>
  <RouterLink
    class="lm-nav-brand"
    to="/"
    :aria-label="navbarTitle"
  >
    <img
      v-if="showFavicon"
      class="lm-nav-brand__logo"
      style="width: auto; height: 32px"
      alt="logo"
      :src="siteFavicon"
    >
    <span class="lm-nav-brand__title">{{ navbarTitle }}</span>
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
