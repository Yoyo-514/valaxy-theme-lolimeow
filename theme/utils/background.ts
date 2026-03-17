import type { CSSProperties } from 'vue'

interface BackgroundImageStyleOptions {
  fixed?: boolean
  position?: string
  size?: string
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
