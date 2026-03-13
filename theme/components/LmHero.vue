<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useBackgroundRuntime, useResolvedBackground, useThemeConfig } from '../composables'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const heroBackground = useResolvedBackground('hero')
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
const hasHeroVisualLayer = computed(() => hasBaseImageLayer.value || hasIncomingImageLayer.value)

const baseImageStyle = computed(() => {
  if (!hasBaseImageLayer.value)
    return {}

  return {
    backgroundImage: `url(${runtimeBackground.currentImageUrl.value})`,
    backgroundPosition: heroBackground.value.position,
    backgroundSize: heroBackground.value.size,
    backgroundAttachment: heroBackground.value.fixed ? 'fixed' : 'scroll',
  }
})

const incomingImageStyle = computed(() => {
  if (!hasIncomingImageLayer.value)
    return {}

  return {
    backgroundImage: `url(${runtimeBackground.incomingImageUrl.value})`,
    backgroundPosition: heroBackground.value.position,
    backgroundSize: heroBackground.value.size,
    backgroundAttachment: heroBackground.value.fixed ? 'fixed' : 'scroll',
  }
})

const overlayStyle = computed(() => ({
  opacity: String(heroBackground.value.overlayOpacity),
  backdropFilter: 'blur(8px) saturate(1.12)',
  WebkitBackdropFilter: 'blur(8px) saturate(1.12)',
  background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
}))
</script>

<template>
  <section
    class="relative overflow-hidden py-4 flex flex-col min-h-screen items-center justify-center"
  >
    <div
      v-if="hasHeroCover && hasBaseImageLayer"
      class="absolute inset-0"
      :style="baseImageStyle"
    />
    <div
      v-if="hasHeroCover && hasIncomingImageLayer"
      class="absolute inset-0 transition-opacity duration-500 ease-out"
      :class="incomingImageVisible ? 'opacity-100' : 'opacity-0'"
      :style="incomingImageStyle"
    />
    <div
      v-if="hasHeroCover && hasHeroVisualLayer"
      class="absolute inset-0"
      :style="overlayStyle"
    />

    <div class="relative z-10 mb-4 text-center">
      <h1 class="text-4xl text-[var(--lm-c-text-primary)] font-bold mb-2 md:text-5xl">
        {{ siteConfig.title }}
      </h1>
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ siteConfig.subtitle }}
      </p>
    </div>
    <div class="relative z-10 text-center">
      <p class="text-lg text-[var(--lm-c-text-secondary)] md:text-xl">
        {{ motto }}
      </p>
    </div>
  </section>
</template>
