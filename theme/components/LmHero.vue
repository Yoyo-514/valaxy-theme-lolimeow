<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useBackgroundRuntime, useResolvedBackground, useThemeConfig } from '../composables'
import { createBackgroundImageStyle } from '../utils'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const heroBackground = useResolvedBackground('hero')
// Hero 显式使用 transparentUntilLoaded，目的是在随机 API 图未到达前
// 直接穿透到底层全局背景，而不是先盖一层重复的静态图。
const runtimeBackground = useBackgroundRuntime('hero', heroBackground, {
  transparentUntilLoaded: true,
})

const motto = computed(() => {
  if (!themeConfig.value.hero.motto) {
    return ''
  }

  if (Array.isArray(themeConfig.value.hero.motto)) {
    return themeConfig.value.hero.motto[0]
  }

  return themeConfig.value.hero.motto
})

const hasHeroCover = computed(() => heroBackground.value.source === 'hero')
const hasBaseImageLayer = computed(() => Boolean(runtimeBackground.currentImageUrl.value))
const hasIncomingImageLayer = computed(() => Boolean(runtimeBackground.incomingImageUrl.value))
const incomingImageVisible = computed(() => runtimeBackground.incomingImageVisible.value)
// Hero 只有在确实拥有自己的可见图层时才叠加 overlay，
// 否则首屏初始化阶段应直接透出全局背景
const hasHeroVisualLayer = computed(() => hasBaseImageLayer.value || hasIncomingImageLayer.value)

const baseImageStyle = computed(() => {
  if (!hasBaseImageLayer.value)
    return {}

  return createBackgroundImageStyle(runtimeBackground.currentImageUrl.value, {
    fixed: heroBackground.value.fixed,
    position: heroBackground.value.position,
    size: heroBackground.value.size,
  })
})

const incomingImageStyle = computed(() => {
  if (!hasIncomingImageLayer.value)
    return {}

  return createBackgroundImageStyle(runtimeBackground.incomingImageUrl.value, {
    fixed: heroBackground.value.fixed,
    position: heroBackground.value.position,
    size: heroBackground.value.size,
  })
})

const overlayStyle = computed(() => ({
  opacity: String(heroBackground.value.overlayOpacity),
  background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
}))
</script>

<template>
  <section
    class="py-4 flex flex-col min-h-screen items-center justify-center relative overflow-hidden"
  >
    <div
      v-if="hasHeroCover && hasBaseImageLayer"
      class="lm-hero-bg-layer"
      :style="baseImageStyle"
    />
    <div
      v-if="hasHeroCover && hasIncomingImageLayer"
      class="lm-hero-bg-fade-layer"
      :class="incomingImageVisible ? 'opacity-100' : 'opacity-0'"
      :style="incomingImageStyle"
    />
    <div
      v-if="hasHeroCover && hasHeroVisualLayer"
      class="lm-hero-bg-layer"
      :style="overlayStyle"
    />

    <div class="mb-4 text-center relative z-10">
      <h1 class="text-4xl text-[var(--lm-c-text-primary)] font-bold mb-2 md:text-5xl">
        {{ siteConfig.title }}
      </h1>
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ siteConfig.subtitle }}
      </p>
    </div>
    <div class="text-center relative z-10">
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ motto }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.lm-hero-bg-layer {
  @apply inset-0 absolute;
}

.lm-hero-bg-fade-layer {
  @apply inset-0 absolute transition-opacity duration-500 ease-out;
}
</style>
