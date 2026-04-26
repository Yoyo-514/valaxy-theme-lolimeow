<script lang="ts" setup>
import { useHeroMotto, useHeroStage, useThemeConfig } from '@theme/composables'
import { useSiteConfig } from 'valaxy'
import { computed, useTemplateRef } from 'vue'

interface SocialLink {
  name: string
  link: string
  icon?: string
  color?: string
}

interface SiteAuthor {
  avatar?: string
  name?: string
}

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const { hasMotto, renderedMotto, shouldShowMotto } = useHeroMotto()
const heroSection = useTemplateRef<HTMLElement>('heroSection')

const {
  baseImageStyle,
  contentAlignmentClass,
  hasBaseImageLayer,
  hasHeroCover,
  hasHeroVisualLayer,
  hasIncomingImageLayer,
  heroLayoutStyle,
  incomingImageStyle,
  incomingImageVisible,
  overlayStyle,
  scrollToNextSection,
  showScrollDown,
} = useHeroStage(heroSection)

const socialLinks = computed<SocialLink[]>(() => {
  const rawLinks = siteConfig.value.social
  if (!Array.isArray(rawLinks))
    return []

  // showSocialIcons 应直接消费站点层 social 数据，而不是再定义一套 Hero 私有社交配置。
  // 这样站点身份信息仍然归 siteConfig 管，Hero 只负责决定“是否展示”。
  return rawLinks.filter(link => link?.name && link?.link)
})

const author = computed<SiteAuthor>(() => siteConfig.value.author || {})
const authorAvatar = computed(() => author.value.avatar || '')
const siteTitle = computed(() => siteConfig.value.title || '')
const siteSubtitle = computed(() => siteConfig.value.subtitle || '')
const authorName = computed(() => author.value.name || siteTitle.value)
const showSocialIcons = computed(() => themeConfig.value.hero.showSocialIcons && socialLinks.value.length > 0)
</script>

<template>
  <section
    ref="heroSection"
    class="flex w-full justify-center relative overflow-hidden"
    :style="heroLayoutStyle"
  >
    <LmHeroVisualLayer
      :has-hero-cover="hasHeroCover"
      :has-base-image-layer="hasBaseImageLayer"
      :has-incoming-image-layer="hasIncomingImageLayer"
      :has-hero-visual-layer="hasHeroVisualLayer"
      :incoming-image-visible="incomingImageVisible"
      :base-image-style="baseImageStyle"
      :incoming-image-style="incomingImageStyle"
      :overlay-style="overlayStyle"
    />

    <div
      class="lm-hero-content"
      :class="contentAlignmentClass"
    >
      <LmHeroIdentity
        :avatar="authorAvatar"
        :author-name="authorName"
        :title="siteTitle"
        :subtitle="siteSubtitle"
        :has-motto="hasMotto"
        :rendered-motto="renderedMotto"
        :should-show-motto="shouldShowMotto"
      />

      <LmHeroSocialLinks
        v-if="showSocialIcons"
        :items="socialLinks"
      />
    </div>

    <button
      v-if="showScrollDown"
      type="button"
      class="lm-hero-scroll-down"
      aria-label="Scroll to next section"
      @click="scrollToNextSection"
    >
      <div i-ri-arrow-down-s-line class="lm-hero-scroll-down__icon" />
    </button>
  </section>
</template>

<style scoped lang="scss">
@use '@theme/styles/mixins/surface' as *;

.lm-hero-content {
  @apply relative z-10 flex w-full max-w-5xl flex-col justify-center px-4 sm:px-6 lg:px-8;
  --lm-hero-surface-blur: 5px;
  // Hero 使用固定舞台高度时，内部节奏需要随视口高度轻量缩放，
  // 否则在短屏和长屏上都会出现“堆得太紧”或“飘得太散”的问题。
  gap: clamp(0.95rem, 1.6vh, 1.35rem);
  padding-block: clamp(4.5rem, 10vh, 7.5rem);
}

.lm-hero-content--left :deep(.lm-hero-subtitle) {
  align-self: flex-start;
  text-align: left;
}

.lm-hero-content--center :deep(.lm-hero-subtitle) {
  align-self: center;
  text-align: center;
}

.lm-hero-content--right :deep(.lm-hero-subtitle) {
  align-self: flex-end;
  text-align: right;
}

.lm-hero-content--left :deep(.lm-hero-social-list) {
  align-self: flex-start;
  justify-content: flex-start;
}

.lm-hero-content--center :deep(.lm-hero-social-list) {
  align-self: center;
  justify-content: center;
}

.lm-hero-content--right :deep(.lm-hero-social-list) {
  align-self: flex-end;
  justify-content: flex-end;
}

@media (max-width: 767px) {
  .lm-hero-content {
    gap: 0.95rem;
    padding-block: 4.25rem 5rem;
  }
}

.lm-hero-scroll-down {
  @apply absolute bottom-5 left-1/2 z-10 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center text-[var(--lm-c-text-primary)] transition-colors duration-250 ease-out md:bottom-7;
  filter: drop-shadow(0 4px 10px rgb(15 23 42 / 0.18));
}

.lm-hero-scroll-down:hover,
.lm-hero-scroll-down:focus-visible {
  color: var(--lm-c-brand);
}

.lm-hero-scroll-down__icon {
  @apply text-4xl leading-none;
  animation: lm-hero-scroll-bounce 1.9s ease-in-out infinite;
}

@keyframes lm-hero-scroll-bounce {
  0%,
  100% {
    opacity: 0.68;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(7px);
  }
}
</style>
