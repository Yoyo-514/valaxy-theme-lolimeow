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

export interface LmFuseSearchResult {
  id: string
  title: string
  excerpt: string
  tags: string[]
  categories: string[]
  score?: number
}

function resolveText(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()

  if (value && typeof value === 'object') {
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

      return {
        id: item.link,
        title: resolveText(item.title) || item.link,
        excerpt: stripHtml(resolveText(item.excerpt || item.content)),
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
