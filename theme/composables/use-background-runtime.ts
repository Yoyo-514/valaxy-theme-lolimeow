import type { CSSProperties, Ref } from 'vue'
import type { ResolvedBackground } from './use-resolved-background'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type BackgroundRuntimeScope = 'app' | 'hero'

interface BackgroundRuntimeOptions {
  /**
   * 当首屏依赖随机 API 图时，先保持透明，直接穿透到底层全局背景，
   * 避免因为静态回退图与全局背景重复而出现“叠叠乐”。
   */
  transparentUntilLoaded?: boolean
}

const loadedImageCache = new Map<string, string>()
const IMAGE_FADE_DURATION = 520
const MIN_ROTATION_INTERVAL = 4000

function getCacheKey(scope: BackgroundRuntimeScope, background: ResolvedBackground) {
  if (background.type !== 'image' || !background.imageUrl)
    return `${scope}:non-image`

  return `${scope}:${background.source}:${background.imageUrl}`
}

function withCacheBust(url: string) {
  if (!url)
    return ''

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_ts=${Date.now()}`
}

function preloadImage(url: string) {
  return new Promise<string>((resolve, reject) => {
    if (typeof Image === 'undefined') {
      resolve(url)
      return
    }

    const image = new Image()

    // onload 只能说明资源到达，decode 能进一步减少切图时的白闪。
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function')
          await image.decode()
      }
      catch {
        // decode 失败时仍然允许继续显示，避免把兼容性问题变成加载失败。
      }

      resolve(url)
    }
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    image.src = url
  })
}

function pickRandom(list: string[]) {
  if (!list.length)
    return ''

  return list[Math.floor(Math.random() * list.length)] || ''
}

function getRotationCandidate(background: ResolvedBackground) {
  if (!background.random)
    return ''

  if (background.apiImageUrls.length)
    return withCacheBust(pickRandom(background.apiImageUrls))

  return pickRandom(background.staticImageUrls)
}

function afterNextPaint(callback: () => void) {
  if (typeof requestAnimationFrame === 'undefined') {
    callback()
    return
  }

  // 等两帧再提交，尽量确保新图已经完成合成并真正进入可见结果。
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

function shouldUseTransparentFallback(background: ResolvedBackground, options: BackgroundRuntimeOptions) {
  return Boolean(
    options.transparentUntilLoaded
    && background.random
    && background.apiImageUrls.length,
  )
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
  let requestId = 0
  let revealTimer: ReturnType<typeof setTimeout> | undefined
  let finalizeTimer: ReturnType<typeof setTimeout> | undefined
  let rotationTimer: ReturnType<typeof setTimeout> | undefined

  const placeholderStyle = computed<CSSProperties>(() => {
    const resolved = resolvedBackground.value

    if (resolved.type === 'gradient' && resolved.gradientValue) {
      return {
        backgroundImage: resolved.gradientValue,
      }
    }

    return {
      backgroundColor: resolved.colorValue || 'var(--lm-c-bg-base)',
    }
  })

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
    incomingImageUrl.value = ''
    incomingImageVisible.value = false
  }

  function commitIncomingImage(url: string) {
    if (!url || currentImageUrl.value === url) {
      incomingImageUrl.value = ''
      incomingImageVisible.value = false
      return
    }

    clearTransitionTimers()
    incomingImageUrl.value = url
    incomingImageVisible.value = false

    revealTimer = setTimeout(() => {
      incomingImageVisible.value = true
    }, 16)

    finalizeTimer = setTimeout(() => {
      afterNextPaint(() => {
        currentImageUrl.value = url
        incomingImageUrl.value = ''
        incomingImageVisible.value = false
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
      incomingImageUrl.value = ''
      incomingImageVisible.value = false
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

        applyImage(loadedUrl)
        loadedImageCache.set(getCacheKey(scope, background), loadedUrl)
        hasLoaded.value = true
        usingFallback.value = false
      }
      catch {
        if (currentRequestId !== requestId)
          return

        // 失败时继续保留旧图或静态保底图，不让半进场的新图层卡住界面。
        incomingImageUrl.value = ''
        incomingImageVisible.value = false
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

      const cacheKey = getCacheKey(scope, next)
      const cachedUrl = loadedImageCache.get(cacheKey)
      const fallbackImageUrl = next.fallbackImageUrl
      const transparentUntilLoaded = shouldUseTransparentFallback(next, options)

      if (cachedUrl) {
        currentImageUrl.value = cachedUrl
        incomingImageUrl.value = ''
        incomingImageVisible.value = false
        hasLoaded.value = true
        usingFallback.value = true
      }
      else if (!transparentUntilLoaded && fallbackImageUrl) {
        currentImageUrl.value = fallbackImageUrl
        incomingImageUrl.value = ''
        incomingImageVisible.value = false
        hasLoaded.value = true
        usingFallback.value = true
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
        incomingImageUrl.value = ''
        incomingImageVisible.value = false
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
