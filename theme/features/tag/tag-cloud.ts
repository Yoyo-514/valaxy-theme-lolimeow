import type { TagCloudSourceItem, TagCloudViewItem } from './types'
import { clamp } from '../../shared/utils'

/** 根据文章数生成字号和字重；空间排布统一由 d3-cloud 负责。 */
export function buildTagCloudItems(source: readonly TagCloudSourceItem[]): TagCloudViewItem[] {
  if (!source.length)
    return []

  const counts = source.map(item => item.count)
  const min = Math.min(...counts)
  const range = Math.max(...counts) - min

  return source.map((item) => {
    const ratio = range > 0 ? clamp((item.count - min) / range, 0, 1) : 0.55
    const level = Math.round(ratio * 3)
    return {
      ...item,
      fontSize: ['1.25rem', '1.5rem', '1.875rem', '2.5rem'][level],
      fontWeight: [600, 700, 800, 900][level],
    }
  })
}
