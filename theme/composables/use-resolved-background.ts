import { useColorMode, useWindowSize } from '@vueuse/core'
import { computed } from 'vue'
import { clampOpacity, normalizeUrls, pickFirstUrl } from '../utils'
import { useThemeConfig } from './config'

type BackgroundScope = 'app' | 'hero'

type BackgroundKind = 'image' | 'gradient' | 'color'
type BackgroundSource = 'hero' | 'background' | 'fallback'

export interface ResolvedBackground {
  type: BackgroundKind
  source: BackgroundSource
  imageUrl: string
  fallbackImageUrl: string
  staticImageUrls: string[]
  apiImageUrls: string[]
  rotationEnabled: boolean
  rotationInterval: number
  random: boolean
  gradientValue: string
  colorValue: string
  overlayOpacity: number
  position: string
  size: string
  fixed: boolean
}

function createColorBackground(): ResolvedBackground {
  return {
    type: 'color',
    source: 'fallback',
    imageUrl: '',
    fallbackImageUrl: '',
    staticImageUrls: [],
    apiImageUrls: [],
    rotationEnabled: false,
    rotationInterval: 12000,
    random: false,
    gradientValue: '',
    colorValue: 'var(--lm-c-bg-base)',
    overlayOpacity: 0,
    position: 'center center',
    size: 'cover',
    fixed: true,
  }
}

function createGradientBackground(gradientValue: string): ResolvedBackground {
  return {
    type: 'gradient',
    source: 'background',
    imageUrl: '',
    fallbackImageUrl: '',
    staticImageUrls: [],
    apiImageUrls: [],
    rotationEnabled: false,
    rotationInterval: 12000,
    random: false,
    gradientValue,
    colorValue: '',
    overlayOpacity: 0,
    position: 'center center',
    size: 'cover',
    fixed: true,
  }
}

export function useResolvedBackground(scope: BackgroundScope = 'app') {
  const themeConfig = useThemeConfig()
  const colorMode = useColorMode()
  const { width } = useWindowSize()

  const isDark = computed(() => colorMode.value === 'dark')
  const isMobile = computed(() => width.value < 768)

  return computed<ResolvedBackground>(() => {
    const background = themeConfig.value.background
    const heroCover = themeConfig.value.hero?.cover

    // Hero scope 只决定首屏局部背景。它应优先消费 hero.cover，
    // 但不应该反过来污染全局 app 背景的解析结果。
    if (scope === 'hero' && heroCover) {
      const heroStaticUrls = normalizeUrls(heroCover.urls)
      const heroApiUrls = normalizeUrls(heroCover.apiUrls)
      const heroPrimaryImage = heroCover.random
        ? (pickFirstUrl(heroApiUrls) || pickFirstUrl(heroStaticUrls))
        : (pickFirstUrl(heroStaticUrls)
          || (isMobile.value ? heroCover.mobile : heroCover.desktop)
          || heroCover.desktop
          || heroCover.mobile
          || '')

      // fallbackImageUrl 在解析层保持“稳定候选”的语义，
      // 更细的随机保底策略放到 runtime 中，避免响应式重算导致随机结果抖动。
      const heroFallbackImage = pickFirstUrl(heroStaticUrls)
        || (isMobile.value ? heroCover.mobile : heroCover.desktop)
        || heroCover.desktop
        || heroCover.mobile
        || ''
      const heroRotationEnabled = Boolean(heroCover.random && (heroApiUrls.length || heroStaticUrls.length > 1))

      if (heroPrimaryImage || heroFallbackImage) {
        return {
          type: 'image',
          source: 'hero',
          imageUrl: heroPrimaryImage,
          fallbackImageUrl: heroFallbackImage,
          staticImageUrls: heroStaticUrls,
          apiImageUrls: heroApiUrls,
          rotationEnabled: heroRotationEnabled,
          rotationInterval: heroCover.rotationInterval ?? 12000,
          random: Boolean(heroCover.random),
          gradientValue: '',
          colorValue: '',
          overlayOpacity: clampOpacity(heroCover.overlayOpacity),
          position: 'center center',
          size: 'cover',
          fixed: heroCover.fixed ?? false,
        }
      }
    }

    if (background.type === 'image' && background.image) {
      const backgroundImage = background.image
      const staticImageUrls = normalizeUrls(backgroundImage.urls)
      const apiImageUrls = normalizeUrls(backgroundImage.apiUrls)
      // imageUrl 表示“当前希望加载的目标图”，而不是保证立即可见的图。
      // 真正的显示顺序、过渡和失败回退由 runtime 统一接管。
      const primaryImageUrl = backgroundImage.random
        ? (pickFirstUrl(apiImageUrls) || pickFirstUrl(staticImageUrls))
        : (pickFirstUrl(staticImageUrls)
          || (isDark.value ? backgroundImage.dark : backgroundImage.light)
          || backgroundImage.light
          || backgroundImage.dark
          || '')

      const fallbackImageUrl = pickFirstUrl(staticImageUrls)
        || (isDark.value ? backgroundImage.dark : backgroundImage.light)
        || backgroundImage.light
        || backgroundImage.dark
        || ''
      const rotationEnabled = Boolean(backgroundImage.random && (apiImageUrls.length || staticImageUrls.length > 1))

      if (primaryImageUrl || fallbackImageUrl) {
        return {
          type: 'image',
          source: 'background',
          imageUrl: primaryImageUrl,
          fallbackImageUrl,
          staticImageUrls,
          apiImageUrls,
          rotationEnabled,
          rotationInterval: backgroundImage.rotationInterval ?? 12000,
          random: Boolean(backgroundImage.random),
          gradientValue: '',
          colorValue: '',
          overlayOpacity: clampOpacity(backgroundImage.overlayOpacity),
          position: backgroundImage.position || 'center center',
          size: backgroundImage.size || 'cover',
          fixed: backgroundImage.fixed ?? true,
        }
      }
    }

    if (background.type === 'gradient' && background.gradient) {
      const gradientValue = isDark.value
        ? (background.gradient.dark || background.gradient.light || '')
        : (background.gradient.light || background.gradient.dark || '')

      if (gradientValue)
        return createGradientBackground(gradientValue)
    }

    return createColorBackground()
  })
}
