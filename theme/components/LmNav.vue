<script lang="ts" setup>
import { useAppStore, useSiteConfig } from 'valaxy'
import { useThemeConfig } from '../composables'

const appStore = useAppStore()

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <nav class="py-6 flex gap-4 items-center justify-between">
    <RouterLink
      class="text-[var(--lm-c-text-primary)] no-underline inline-flex gap-2 items-center"
      to="/"
      :aria-label="siteConfig.title"
    >
      <img
        class="shrink-0 block"
        style="width: 50px; height: 35px"
        alt="logo"
        :src="siteConfig.favicon"
      >
      <span class="text-base leading-[1.2] font-700 hidden md:inline">{{ siteConfig.title }}</span>
    </RouterLink>

    <div class="text-sm text-[var(--lm-c-text-secondary)] leading-6 ml-auto flex gap-2 items-center justify-center">
      <template v-for="(item, i) in themeConfig.navbar" :key="i">
        <AppLink
          class="text-inherit no-underline transition-colors duration-250 ease-in-out hover:text-[var(--lm-c-text-primary)]"
          :to="item.link"
          rel="noopener"
        >
          {{ item.text }}
        </AppLink>
        <span v-if="i !== themeConfig.navbar.length - 1" class="text-[var(--lm-c-text-muted)]">·</span>
      </template>
    </div>

    <button
      type="button"
      class="text-[var(--lm-c-text-primary)] ml-3 border border-[var(--lm-c-border)] rounded-full bg-[var(--lm-c-bg-glass)] inline-flex h-9 w-9 transition-[border-color,background-color,transform] duration-250 ease-in-out items-center justify-center hover:border-[var(--lm-c-brand)] hover:-translate-y-0.25"
      aria-label="Toggle Dark Mode"
      @click="appStore.toggleDarkWithTransition"
    >
      <div v-if="!appStore.isDark" i-ri-sun-line />
      <div v-else i-ri-moon-line />
    </button>
  </nav>
</template>
