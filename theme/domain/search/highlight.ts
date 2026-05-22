import type { LmSearchHighlightPart } from './types'

/**
 * 将搜索索引中的多形态文案解析为可展示字符串。
 */
export function resolveSearchText(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()

  if (value && typeof value === 'object') {
    // Valaxy 标题可能是多语言对象，搜索列表只需要拿到第一个可读文案。
    const resolved: string | undefined = Object.values(value as Record<string, unknown>)
      .map(resolveSearchText)
      .find(Boolean)

    return resolved ?? ''
  }

  return ''
}

/**
 * 移除搜索摘要中的 HTML 标签并压缩空白。
 */
export function stripSearchHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 收集查询词在目标文本中的命中区间。
 */
export function collectQueryRanges(text: string, search: string) {
  // 高亮按用户输入的每个词独立匹配，和 Fuse 的模糊得分保持解耦。
  const terms = search
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const ranges: Array<[number, number]> = []
  const lowerText = text.toLowerCase()

  for (const term of terms) {
    const lowerTerm = term.toLowerCase()
    let start = lowerText.indexOf(lowerTerm)

    while (start !== -1) {
      ranges.push([start, start + term.length - 1])
      start = lowerText.indexOf(lowerTerm, start + term.length)
    }
  }

  return ranges
}

/**
 * 合并重叠或相邻的高亮区间。
 */
export function mergeRanges(ranges: readonly (readonly [number, number])[], maxLength: number) {
  // 重叠或相邻的命中区间合并后再渲染，避免连续 mark 被拆成碎片。
  const normalizedRanges = ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(maxLength - 1, end)] as const)
    .filter(([start, end]) => start <= end)
    .sort((a, b) => a[0] - b[0])

  const mergedRanges: Array<[number, number]> = []

  for (const [start, end] of normalizedRanges) {
    const lastRange = mergedRanges.at(-1)

    if (lastRange && start <= lastRange[1] + 1) {
      lastRange[1] = Math.max(lastRange[1], end)
      continue
    }

    mergedRanges.push([start, end])
  }

  return mergedRanges
}

/**
 * 将文本和高亮区间转换为 UI 可直接渲染的分片。
 */
export function createHighlightParts(
  text: string,
  ranges: readonly (readonly [number, number])[],
): LmSearchHighlightPart[] {
  if (!text)
    return []

  const mergedRanges = mergeRanges(ranges, text.length)
  if (!mergedRanges.length)
    return [{ text, highlighted: false }]

  const parts: LmSearchHighlightPart[] = []
  let cursor = 0

  for (const [start, end] of mergedRanges) {
    if (cursor < start)
      parts.push({ text: text.slice(cursor, start), highlighted: false })

    parts.push({ text: text.slice(start, end + 1), highlighted: true })
    cursor = end + 1
  }

  if (cursor < text.length)
    parts.push({ text: text.slice(cursor), highlighted: false })

  return parts
}
