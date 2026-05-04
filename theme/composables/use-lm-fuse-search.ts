import type { Ref } from 'vue'
import { useFuseSearch } from 'valaxy'
import { computed, ref, shallowRef } from 'vue'

export interface LmFuseSearchItem {
  title: string | Record<string, string>
  excerpt?: string
  author: string
  tags: string[]
  categories: string[]
  link: string
  content?: string
}

export interface LmSearchHighlightPart {
  text: string
  highlighted: boolean
}

export interface LmFuseSearchResult {
  id: string
  title: string
  titleParts: LmSearchHighlightPart[]
  excerpt: string
  excerptParts: LmSearchHighlightPart[]
  tags: string[]
  categories: string[]
  score?: number
}

function resolveText(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()

  if (value && typeof value === 'object') {
    // Valaxy 标题可能是多语言对象，搜索列表只需要拿到第一个可读文案。
    const resolved: string | undefined = Object.values(value as Record<string, unknown>)
      .map(resolveText)
      .find(Boolean)

    return resolved ?? ''
  }

  return ''
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectQueryRanges(text: string, search: string) {
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

function mergeRanges(ranges: readonly (readonly [number, number])[], maxLength: number) {
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

function createHighlightParts(text: string, ranges: readonly (readonly [number, number])[]): LmSearchHighlightPart[] {
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

export function useLmFuseSearch(query: Ref<string>) {
  const loading = ref(false)
  const loaded = ref(false)
  const error = shallowRef<unknown>(null)
  const { fetchFuseListData, results } = useFuseSearch<LmFuseSearchItem>(() => query.value, {
    resultLimit: 12,
  })

  async function load() {
    if (loaded.value || loading.value)
      return

    // 搜索索引按需加载，避免每个页面首屏都拉取 Fuse 数据。
    loading.value = true
    error.value = null

    try {
      await fetchFuseListData()
      loaded.value = true
    }
    catch (err) {
      error.value = err
    }
    finally {
      loading.value = false
    }
  }

  const normalizedResults = computed<LmFuseSearchResult[]>(() => {
    return results.value.map((result) => {
      const item = result.item

      const title = resolveText(item.title) || item.link
      const excerpt = stripHtml(resolveText(item.excerpt || item.content))

      return {
        id: item.link,
        title,
        titleParts: createHighlightParts(title, collectQueryRanges(title, query.value)),
        excerpt,
        excerptParts: createHighlightParts(excerpt, collectQueryRanges(excerpt, query.value)),
        tags: item.tags ?? [],
        categories: item.categories ?? [],
        score: result.score,
      }
    })
  })

  return {
    error,
    hasError: computed(() => Boolean(error.value)),
    load,
    loaded,
    loading,
    results: normalizedResults,
  }
}
