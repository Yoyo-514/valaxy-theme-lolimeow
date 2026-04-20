import type { ResolvedBackground } from '@theme/composables/use-resolved-background'
import type { CSSProperties } from 'vue'

interface BackgroundImageStyleOptions {
  fixed?: boolean
  position?: string
  size?: string
}

export function normalizeUrls(urls?: string[]) {
  return urls?.map(url => url.trim()).filter(Boolean) || []
}

export function pickFirstUrl(urls?: string[]) {
  return normalizeUrls(urls)[0] || ''
}

export function pickRandomUrl(urls?: string[]) {
  const candidates = normalizeUrls(urls)

  if (!candidates.length)
    return ''

  return candidates[Math.floor(Math.random() * candidates.length)] || ''
}

export function clampOpacity(opacity?: number, fallback = 0.3) {
  if (typeof opacity !== 'number' || Number.isNaN(opacity))
    return fallback

  return Math.min(1, Math.max(0, opacity))
}

export function getBackgroundCacheKey(scope: 'app' | 'hero', background: ResolvedBackground) {
  if (background.type !== 'image' || !background.imageUrl)
    return `${scope}:non-image`

  return `${scope}:${background.source}:${background.imageUrl}`
}

export function withCacheBust(url: string) {
  if (!url)
    return ''

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_ts=${Date.now()}`
}

export function getRotationCandidate(background: ResolvedBackground) {
  if (!background.random)
    return ''

  if (background.apiImageUrls.length)
    return withCacheBust(pickRandomUrl(background.apiImageUrls))

  return pickRandomUrl(background.staticImageUrls)
}

export function shouldUseTransparentFallback(
  background: ResolvedBackground,
  options: { transparentUntilLoaded?: boolean },
) {
  return Boolean(
    options.transparentUntilLoaded
    && background.random
    && background.apiImageUrls.length,
  )
}

export function createBackgroundImageStyle(
  imageUrl: string,
  options: BackgroundImageStyleOptions = {},
): CSSProperties {
  if (!imageUrl)
    return {}

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: options.position || 'center center',
    backgroundSize: options.size || 'cover',
    backgroundAttachment: options.fixed ? 'fixed' : 'scroll',
  }
}
