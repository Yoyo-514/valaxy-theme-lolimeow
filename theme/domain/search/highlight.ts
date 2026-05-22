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

function collectTermRanges(lowerText: string, lowerTerm: string, termLength: number, fromIndex = 0): Array<[number, number]> {
  const start = lowerText.indexOf(lowerTerm, fromIndex)

  if (start === -1)
    return []

  return [
    [start, start + termLength - 1],
    ...collectTermRanges(lowerText, lowerTerm, termLength, start + termLength),
  ]
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

  const lowerText = text.toLowerCase()

  return terms.flatMap((term) => {
    return collectTermRanges(lowerText, term.toLowerCase(), term.length)
  })
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

  return normalizedRanges.reduce<Array<[number, number]>>((mergedRanges, [start, end]) => {
    const lastRange = mergedRanges.at(-1)

    if (!lastRange || start > lastRange[1] + 1)
      return [...mergedRanges, [start, end]]

    return [
      ...mergedRanges.slice(0, -1),
      [lastRange[0], Math.max(lastRange[1], end)],
    ]
  }, [])
}

interface HighlightPartState {
  cursor: number
  parts: LmSearchHighlightPart[]
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

  const { cursor, parts } = mergedRanges.reduce<HighlightPartState>((state, [start, end]) => {
    const plainPart = state.cursor < start
      ? [{ text: text.slice(state.cursor, start), highlighted: false }]
      : []

    return {
      cursor: end + 1,
      parts: [
        ...state.parts,
        ...plainPart,
        { text: text.slice(start, end + 1), highlighted: true },
      ],
    }
  }, { cursor: 0, parts: [] })

  if (cursor >= text.length)
    return parts

  return [
    ...parts,
    { text: text.slice(cursor), highlighted: false },
  ]
}
