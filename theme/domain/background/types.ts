export type BackgroundScope = 'app' | 'hero'

export type BackgroundKind = 'image' | 'gradient' | 'color'

export type BackgroundSource = 'hero' | 'background' | 'fallback'

/**
 * 主题背景经过配置、色彩模式、设备宽度等条件解析后的统一结果。
 *
 * composables 只消费这个稳定结构，不再互相引用具体实现文件，避免
 * utils/domain/composables 之间出现反向依赖。
 */
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
