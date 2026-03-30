<script lang="ts" setup>
import { useCssVar, useElementBounding } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { computed, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import {
  useBackgroundRuntime,
  useHeroMotto,
  useResolvedBackground,
  useThemeConfig,
} from '../composables'
import { createBackgroundImageStyle } from '../utils'

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
const heroBackground = useResolvedBackground('hero')
const { hasMotto, renderedMotto } = useHeroMotto()
const heroSection = useTemplateRef<HTMLElement>('heroSection')
const { bottom } = useElementBounding(heroSection)
const pageSurfaceTop = useCssVar(`--lm-page-surface-top`, document.documentElement)

// Hero 在随机 API 图尚未就绪时应直接穿透全局背景。
// 这样首屏不会先叠出一层与全局重复的静态图，背景边界也不会显脏。
const runtimeBackground = useBackgroundRuntime('hero', heroBackground, {
  transparentUntilLoaded: true,
})

const heroLayoutStyle = computed(() => ({
  // Hero height 在当前主题里表示“首屏舞台高度”，
  // 语义应稳定落到 section height
  height: themeConfig.value.hero.height || '100vh',
}))

const contentAlignmentClass = computed(() => {
  switch (themeConfig.value.hero.textAlign) {
    case 'left':
      return 'lm-hero-content--left items-start text-left'
    case 'right':
      return 'lm-hero-content--right items-end text-right'
    default:
      return 'lm-hero-content--center items-center text-center'
  }
})

const hasHeroCover = computed(() => heroBackground.value.source === 'hero')
const hasBaseImageLayer = computed(() => Boolean(runtimeBackground.currentImageUrl.value))
const hasIncomingImageLayer = computed(() => Boolean(runtimeBackground.incomingImageUrl.value))
const incomingImageVisible = computed(() => runtimeBackground.incomingImageVisible.value)

// 只有 Hero 真正持有自己的可见图层时，才应该叠加局部 overlay。
// 否则首屏初始阶段应直接透出 app background，避免局部再盖一层半透明蒙版。
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
const authorName = computed(() => author.value.name || siteConfig.value.title)
const showSocialIcons = computed(() => themeConfig.value.hero.showSocialIcons && socialLinks.value.length > 0)
const showScrollDown = computed(() => Boolean(themeConfig.value.hero.showScrollDown))

function scrollToNextSection() {
  const currentSection = heroSection.value
  if (!currentSection || typeof window === 'undefined')
    return

  // Scroll-down 的目标不应写死为“一个视口高度”，
  // 而应语义化为“Hero 后的第一个首页模块”。
  // 这样后续插入 Notice / Pinned / Featured 等区块时无需重写滚动逻辑。
  const nextSection = currentSection.nextElementSibling as HTMLElement | null

  if (nextSection) {
    nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  window.scrollTo({
    top: currentSection.offsetTop + currentSection.offsetHeight,
    behavior: 'smooth',
  })
}

watch(
  bottom,
  (value) => {
    if (typeof value !== 'number' || Number.isNaN(value))
      return

    pageSurfaceTop.value = `${Math.max(0, value)}px`
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  pageSurfaceTop.value = undefined
})
</script>

<template>
  <section
    ref="heroSection"
    class="flex w-full justify-center relative overflow-hidden"
    :style="heroLayoutStyle"
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

    <div
      class="lm-hero-content"
      :class="contentAlignmentClass"
    >
      <div
        v-if="authorAvatar"
        class="lm-hero-avatar-badge"
      >
        <img
          class="lm-hero-avatar-image"
          :src="authorAvatar"
          :alt="authorName"
        >
      </div>

      <div class="lm-hero-identity-card">
        <h1 class="lm-hero-title">
          {{ siteConfig.title }}
        </h1>
        <p
          v-if="siteConfig.subtitle"
          class="lm-hero-subtitle"
        >
          {{ siteConfig.subtitle }}
        </p>
      </div>

      <div
        v-if="hasMotto"
        class="lm-hero-motto-strip"
      >
        <p
          class="lm-hero-motto"
          aria-live="polite"
        >
          {{ renderedMotto }}
        </p>
      </div>

      <div
        v-if="showSocialIcons"
        class="lm-hero-social-list"
      >
        <AppLink
          v-for="item in socialLinks"
          :key="item.name"
          class="lm-hero-social-link"
          :to="item.link"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="item.name"
          :title="item.name"
          :style="{ '--lm-hero-social-color': item.color || 'var(--lm-c-brand)' }"
        >
          <div
            v-if="item.icon"
            :class="item.icon"
            class="text-lg"
          />
          <span class="sr-only">{{ item.name }}</span>
        </AppLink>
      </div>
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
@use '../styles/mixins/surface' as *;

.lm-hero-bg-layer {
  @apply inset-0 absolute;
}

.lm-hero-bg-fade-layer {
  @apply inset-0 absolute transition-opacity duration-500 ease-out;
}

.lm-hero-content {
  @apply relative z-10 flex w-full max-w-5xl flex-col justify-center px-4 sm:px-6 lg:px-8;
  --lm-hero-surface-blur: 5px;
  // Hero 使用固定舞台高度时，内部节奏需要随视口高度轻量缩放，
  // 否则在短屏和长屏上都会出现“堆得太紧”或“飘得太散”的问题。
  gap: clamp(0.95rem, 1.6vh, 1.35rem);
  padding-block: clamp(4.5rem, 10vh, 7.5rem);
}

.lm-hero-avatar-badge {
  @apply relative z-10 flex h-22 w-22 items-center justify-center rounded-full p-1.5 md:h-24 md:w-24;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 72%, transparent),
    color-mix(in srgb, var(--lm-c-border) 78%, transparent),
    0 14px 30px rgb(15 23 42 / 0.12),
    var(--lm-hero-surface-blur)
  );
  // Avatar 徽章要比主牌更轻，避免视线先被“壳层”吸走。
  margin-bottom: clamp(0.15rem, 0.8vh, 0.65rem);
}

.lm-hero-avatar-image {
  @apply h-full w-full rounded-full object-cover;
}

.lm-hero-identity-card {
  @apply relative flex flex-col gap-2 px-6 py-5 md:px-8 md:py-6;
  width: fit-content;
  max-width: 100%;
  isolation: isolate;
}

.lm-hero-identity-card::before {
  content: '';
  position: absolute;
  inset: -0.35rem -3.5rem;
  background: color-mix(in srgb, var(--lm-c-bg-glass) 52%, transparent);
  backdrop-filter: blur(calc(var(--lm-hero-surface-blur) + 1px)) saturate(1.08);
  -webkit-backdrop-filter: blur(calc(var(--lm-hero-surface-blur) + 1px)) saturate(1.08);
  // 主牌承载区应围绕文字主体存在，而不是形成一整块横幅。
  // 这里通过横向 mask 让模糊从文字外缘向两侧逐步衰减，直到边界透明。
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgb(0 0 0 / 0.42) 8%,
    rgb(0 0 0 / 0.92) 18%,
    black 50%,
    rgb(0 0 0 / 0.92) 82%,
    rgb(0 0 0 / 0.42) 92%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgb(0 0 0 / 0.42) 8%,
    rgb(0 0 0 / 0.92) 18%,
    black 50%,
    rgb(0 0 0 / 0.92) 82%,
    rgb(0 0 0 / 0.42) 92%,
    transparent 100%
  );
  z-index: -2;
}

.lm-hero-identity-card::after {
  content: '';
  position: absolute;
  inset: -0.35rem -3.5rem;
  background:
    linear-gradient(
        to right,
        transparent 0%,
        color-mix(in srgb, var(--lm-c-border) 28%, transparent) 12%,
        color-mix(in srgb, var(--lm-c-border-hover) 64%, transparent) 50%,
        color-mix(in srgb, var(--lm-c-border) 28%, transparent) 88%,
        transparent 100%
      )
      top / 100% 1px no-repeat,
    linear-gradient(
        to right,
        transparent 0%,
        color-mix(in srgb, var(--lm-c-border) 22%, transparent) 12%,
        color-mix(in srgb, var(--lm-c-border-hover) 46%, transparent) 50%,
        color-mix(in srgb, var(--lm-c-border) 22%, transparent) 88%,
        transparent 100%
      )
      bottom / 100% 1px no-repeat;
  pointer-events: none;
  z-index: -1;
}

@media (max-width: 767px) {
  .lm-hero-content {
    gap: 0.95rem;
    padding-block: 4.25rem 5rem;
  }

  .lm-hero-identity-card {
    width: min(100%, 34rem);
  }

  .lm-hero-identity-card::before {
    inset: -0.2rem -1rem;
  }

  .lm-hero-identity-card::after {
    inset: -0.2rem -1rem;
  }

  .lm-hero-subtitle {
    max-width: 100%;
  }

  .lm-hero-motto-strip {
    min-width: min(100%, 20rem);
    max-width: min(100%, 26rem);
  }
}

.lm-hero-title {
  @apply text-4xl leading-tight font-700 text-[var(--lm-c-text-primary)] md:text-5xl xl:text-6xl;
  position: relative;
  z-index: 1;
  text-wrap: balance;
  text-shadow:
    0 2px 14px rgb(15 23 42 / 0.08),
    0 1px 0 rgb(255 255 255 / 0.12);
}

.lm-hero-subtitle {
  @apply text-base leading-7 text-[var(--lm-c-text-secondary)] md:text-lg;
  position: relative;
  z-index: 1;
  // subtitle 仍属于身份主牌的一部分，但它的阅读宽度不应无限跟随 title 变长。
  // 这里把它限制在一个稳定的阅读 measure 内，同时继续服从 Hero 的左右/居中对齐语义。
  width: fit-content;
  max-width: min(100%, 31rem);
  text-wrap: balance;
  text-shadow: 0 1px 10px rgb(15 23 42 / 0.08);
}

.lm-hero-content--left .lm-hero-subtitle {
  align-self: flex-start;
}

.lm-hero-content--center .lm-hero-subtitle {
  align-self: center;
}

.lm-hero-content--right .lm-hero-subtitle {
  align-self: flex-end;
}

.lm-hero-motto-strip {
  @apply flex rounded-[12px] px-5 py-3 md:px-6;
  @include lm-surface-nav(
    color-mix(in srgb, var(--lm-c-bg-glass) 60%, transparent),
    color-mix(in srgb, var(--lm-c-border) 54%, transparent),
    0 10px 20px rgb(15 23 42 / 0.08),
    var(--lm-hero-surface-blur)
  );
  // motto 是动态文案，需要一个稳定的最小阅读宽度；
  // 但它又不能像主牌那样永远撑满，所以用 min/max + fit-content 让其按内容弹性增长。
  min-width: min(100%, 28rem);
  width: fit-content;
  max-width: min(100%, 56rem);
  margin-top: 0.1rem;
  box-shadow:
    0 10px 20px rgb(15 23 42 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.1);
}

.lm-hero-motto {
  @apply min-h-8 w-full text-base leading-7 text-[var(--lm-c-text-secondary)] md:text-[1.0625rem];
  font-family: 'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', 'Comic Sans MS', cursive;
  letter-spacing: 0.01em;
  text-wrap: balance;
}

.lm-hero-social-list {
  @apply mt-1 flex flex-wrap gap-2;
  width: fit-content;
  row-gap: 0.55rem;
}

.lm-hero-content--left .lm-hero-social-list {
  align-self: flex-start;
  justify-content: flex-start;
}

.lm-hero-content--center .lm-hero-social-list {
  align-self: center;
  justify-content: center;
}

.lm-hero-content--right .lm-hero-social-list {
  align-self: flex-end;
  justify-content: flex-end;
}

.lm-hero-social-link {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-250 ease-out;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 58%, transparent),
    color-mix(in srgb, var(--lm-c-border) 62%, transparent),
    0 8px 16px rgb(15 23 42 / 0.08),
    var(--lm-hero-surface-blur)
  );
  color: var(--lm-hero-social-color);
  opacity: 0.9;
  border-color: color-mix(in srgb, var(--lm-hero-social-color) 22%, transparent);
}

.lm-hero-social-link:hover,
.lm-hero-social-link:focus-visible {
  transform: translateY(-2px);
  opacity: 1;
  border-color: color-mix(in srgb, var(--lm-hero-social-color) 38%, transparent);
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
