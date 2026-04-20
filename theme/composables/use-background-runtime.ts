import type { CSSProperties, Ref } from 'vue'
import type { ResolvedBackground } from './use-resolved-background'
import { getBackgroundCacheKey, getRotationCandidate, pickRandomUrl, shouldUseTransparentFallback } from '@theme/utils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type BackgroundRuntimeScope = 'app' | 'hero'

interface BackgroundRuntimeOptions {
  /**
   * 当首屏依赖随机 API 图时，先保持透明并直接穿透到底层全局背景，
   * 避免 Hero 的静态回退图与全局背景叠出“双层同图”。
   */
  transparentUntilLoaded?: boolean
}

// 已经成功显示过的图片缓存。作用是切页时优先复用稳定结果，
// 避免同一张图在短时间内重复经历“占位 -> 进场”的过程。
const loadedImageCache = new Map<string, string>()
/**
 * 随机模式下的静态回退图缓存。作用是让“等待 API 图”的保底图
 * 在当前会话内保持稳定，但不同访客仍然有机会看到不同的首图
 */
const sessionFallbackCache = new Map<string, string>()
const IMAGE_FADE_DURATION = 520
const MIN_ROTATION_INTERVAL = 4000

function preloadImage(url: string) {
  return new Promise<string>((resolve, reject) => {
    if (typeof Image === 'undefined') {
      resolve(url)
      return
    }

    const image = new Image()

    // onload 只能说明资源已经到达浏览器，decode 则尽量把解码阶段前置，
    // 降低切图瞬间出现白闪的概率。
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function')
          await image.decode()
      }
      catch {
        // decode 失败不视为真正的加载失败，否则兼容性问题会被放大成显示问题。
      }

      resolve(url)
    }
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    image.src = url
  })
}

function getFallbackCacheKey(scope: BackgroundRuntimeScope, background: ResolvedBackground) {
  return [
    scope,
    background.source,
    background.random ? 'random' : 'stable',
    background.fallbackImageUrl,
    background.staticImageUrls.join('|'),
  ].join(':')
}

function getStableFallbackImage(scope: BackgroundRuntimeScope, background: ResolvedBackground) {
  if (!background.fallbackImageUrl && !background.staticImageUrls.length)
    return ''

  const cacheKey = getFallbackCacheKey(scope, background)
  const cachedFallback = sessionFallbackCache.get(cacheKey)

  if (cachedFallback)
    return cachedFallback

  // 随机模式下如果也提供了静态图，保底图不应永远退回第一张。
  // 这里在当前会话内固定挑一张，既保留随机感，又避免同一访客反复看到保底图变化。
  const fallbackImage = background.random && background.staticImageUrls.length > 1
    ? (pickRandomUrl(background.staticImageUrls) || background.fallbackImageUrl)
    : background.fallbackImageUrl

  if (fallbackImage)
    sessionFallbackCache.set(cacheKey, fallbackImage)

  return fallbackImage
}

function afterNextPaint(callback: () => void) {
  if (typeof requestAnimationFrame === 'undefined') {
    callback()
    return
  }

  // 切图过渡结束后再额外等两帧，让浏览器有时间把新图真正合成到屏幕上，
  // 避免“时间到了但视觉上还没画稳”的闪烁感。
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

export function useBackgroundRuntime(
  scope: BackgroundRuntimeScope,
  resolvedBackground: Readonly<Ref<ResolvedBackground>>,
  options: BackgroundRuntimeOptions = {},
) {
  const currentImageUrl = ref('')
  const incomingImageUrl = ref('')
  const incomingImageVisible = ref(false)
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const usingFallback = ref(false)
  // requestId 用于隔离并发异步任务。切页或配置变更后，旧请求即使更晚返回，
  // 也不能覆盖当前最新的一轮背景状态。
  let requestId = 0
  let revealTimer: ReturnType<typeof setTimeout> | undefined
  let finalizeTimer: ReturnType<typeof setTimeout> | undefined
  let rotationTimer: ReturnType<typeof setTimeout> | undefined

  const placeholderStyle = computed<CSSProperties>(() => {
    const resolved = resolvedBackground.value

    // 图片背景的占位层只承担“纯色/渐变兜底”的职责，
    // 真正的图片切换统一交给 current/incoming 两层处理。
    if (resolved.type === 'gradient' && resolved.gradientValue) {
      return {
        backgroundImage: resolved.gradientValue,
      }
    }

    return {
      backgroundColor: resolved.colorValue || 'var(--lm-c-bg-base)',
    }
  })

  function clearIncomingImageLayer() {
    incomingImageUrl.value = ''
    incomingImageVisible.value = false
  }

  function clearTransitionTimers() {
    if (revealTimer)
      clearTimeout(revealTimer)
    if (finalizeTimer)
      clearTimeout(finalizeTimer)

    revealTimer = undefined
    finalizeTimer = undefined
  }

  function clearAllTimers() {
    clearTransitionTimers()

    if (rotationTimer)
      clearTimeout(rotationTimer)

    rotationTimer = undefined
  }

  function resetImages() {
    currentImageUrl.value = ''
    clearIncomingImageLayer()
  }

  function applyStableImage(url: string, fallback: boolean) {
    currentImageUrl.value = url
    clearIncomingImageLayer()
    hasLoaded.value = true
    usingFallback.value = fallback
  }

  function commitIncomingImage(url: string) {
    if (!url || currentImageUrl.value === url) {
      clearIncomingImageLayer()
      return
    }

    // 新图始终走“旧图留在底层 + 新图淡入覆盖”的路径，
    // 这样切换期间不会暴露 placeholder 层。
    clearTransitionTimers()
    incomingImageUrl.value = url
    incomingImageVisible.value = false

    revealTimer = setTimeout(() => {
      incomingImageVisible.value = true
    }, 16)

    finalizeTimer = setTimeout(() => {
      afterNextPaint(() => {
        currentImageUrl.value = url
        clearIncomingImageLayer()
      })
    }, IMAGE_FADE_DURATION)
  }

  function applyImage(url: string) {
    if (!url) {
      resetImages()
      return
    }

    if (!currentImageUrl.value) {
      commitIncomingImage(url)
      return
    }

    if (currentImageUrl.value === url) {
      clearIncomingImageLayer()
      return
    }

    commitIncomingImage(url)
  }

  function scheduleRotation(background: ResolvedBackground, currentRequestId: number) {
    if (!background.rotationEnabled)
      return

    rotationTimer = setTimeout(async () => {
      if (currentRequestId !== requestId)
        return

      const nextUrl = getRotationCandidate(background)

      if (!nextUrl) {
        scheduleRotation(background, currentRequestId)
        return
      }

      try {
        const loadedUrl = await preloadImage(nextUrl)

        if (currentRequestId !== requestId)
          return

        // 轮换只在新图已完成加载后才提交，旧图会一直保留到新图淡入完成。
        applyImage(loadedUrl)
        loadedImageCache.set(getBackgroundCacheKey(scope, background), loadedUrl)
        hasLoaded.value = true
        usingFallback.value = false
      }
      catch {
        if (currentRequestId !== requestId)
          return

        // 轮换失败时不动当前已显示的图，只清理半进场图层。
        clearIncomingImageLayer()
        usingFallback.value = true
      }
      finally {
        if (currentRequestId === requestId)
          scheduleRotation(background, currentRequestId)
      }
    }, Math.max(background.rotationInterval, MIN_ROTATION_INTERVAL))
  }

  watch(
    () => resolvedBackground.value,
    async (next) => {
      requestId += 1
      const currentRequestId = requestId
      clearAllTimers()

      if (next.type !== 'image' || !next.imageUrl) {
        resetImages()
        isLoading.value = false
        hasLoaded.value = false
        usingFallback.value = false
        return
      }

      const cacheKey = getBackgroundCacheKey(scope, next)
      const cachedUrl = loadedImageCache.get(cacheKey)
      const fallbackImageUrl = getStableFallbackImage(scope, next)
      const transparentUntilLoaded = shouldUseTransparentFallback(next, options)

      // 首轮解析优先级：
      // 1. 已成功过的缓存图
      // 2. 静态保底图（若当前 scope 允许）
      // 3. 透明/纯色/渐变占位
      if (cachedUrl) {
        applyStableImage(cachedUrl, true)
      }
      else if (!transparentUntilLoaded && fallbackImageUrl) {
        applyStableImage(fallbackImageUrl, true)
      }
      else {
        resetImages()
        hasLoaded.value = false
        usingFallback.value = true
      }

      isLoading.value = true

      try {
        const loadedUrl = await preloadImage(next.imageUrl)

        if (currentRequestId !== requestId)
          return

        applyImage(loadedUrl)
        loadedImageCache.set(cacheKey, loadedUrl)
        hasLoaded.value = true
        usingFallback.value = false
      }
      catch {
        if (currentRequestId !== requestId)
          return

        // 首次图或切页图加载失败时，同样保留当前可见图层，只回退状态，不清空底图。
        clearIncomingImageLayer()
        usingFallback.value = true
      }
      finally {
        if (currentRequestId === requestId) {
          isLoading.value = false
          scheduleRotation(next, currentRequestId)
        }
      }
    },
    { immediate: true, deep: true },
  )

  onBeforeUnmount(() => {
    clearAllTimers()
  })

  return {
    currentImageUrl,
    incomingImageUrl,
    incomingImageVisible,
    placeholderStyle,
    isLoading,
    hasLoaded,
    usingFallback,
  }
}
