<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '../composables'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const motto = computed(() => {
  if (!themeConfig.value.hero.motto) {
    return ''
  }

  if (Array.isArray(themeConfig.value.hero.motto)) {
    return themeConfig.value.hero.motto[0]
  }

  return themeConfig.value.hero.motto
})
</script>

<template>
  <section class="py-4 flex flex-col min-h-screen items-center justify-center">
    <div class="mb-4 text-center">
      <h1 class="text-4xl text-[var(--lm-c-text-primary)] font-bold mb-2 md:text-5xl">
        {{ siteConfig.title }}
      </h1>
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ siteConfig.subtitle }}
      </p>
    </div>
    <div class="text-center">
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ motto }}
      </p>
    </div>
  </section>
</template>
