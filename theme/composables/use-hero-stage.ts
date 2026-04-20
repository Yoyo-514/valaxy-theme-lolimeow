import type { CSSProperties, ShallowRef } from 'vue'
import { createBackgroundImageStyle } from '@theme/utils'
import { useCssVar, useElementBounding } from '@vueuse/core'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useThemeConfig } from './config'
import { useBackgroundRuntime } from './use-background-runtime'
import { useResolvedBackground } from './use-resolved-background'

export function useHeroStage(heroSection: Readonly<ShallowRef<HTMLElement | null>>) {
  const themeConfig = useThemeConfig()
  const heroBackground = useResolvedBackground('hero')
  const { bottom } = useElementBounding(() => heroSection.value)
  const pageSurfaceTop = useCssVar('--lm-page-surface-top', document.documentElement)

  // Hero 在随机 API 图尚未就绪时应直接穿透全局背景。
  // 这样首屏不会先叠出一层与全局重复的静态图，背景边界也不会显脏。
  const runtimeBackground = useBackgroundRuntime('hero', heroBackground, {
    transparentUntilLoaded: true,
  })

  const heroLayoutStyle = computed<CSSProperties>(() => ({
    // Hero height 在当前主题里表示“首屏舞台高度”，
    // 语义应稳定落到 section height。
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

  const baseImageStyle = computed<CSSProperties>(() => {
    if (!hasBaseImageLayer.value)
      return {}

    return createBackgroundImageStyle(runtimeBackground.currentImageUrl.value, {
      fixed: heroBackground.value.fixed,
      position: heroBackground.value.position,
      size: heroBackground.value.size,
    })
  })

  const incomingImageStyle = computed<CSSProperties>(() => {
    if (!hasIncomingImageLayer.value)
      return {}

    return createBackgroundImageStyle(runtimeBackground.incomingImageUrl.value, {
      fixed: heroBackground.value.fixed,
      position: heroBackground.value.position,
      size: heroBackground.value.size,
    })
  })

  const overlayStyle = computed<CSSProperties>(() => ({
    opacity: String(heroBackground.value.overlayOpacity),
    background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
  }))

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

  return {
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
    showScrollDown: computed(() => Boolean(themeConfig.value.hero.showScrollDown)),
  }
}
