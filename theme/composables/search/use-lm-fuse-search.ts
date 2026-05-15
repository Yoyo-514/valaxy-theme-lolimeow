import type { Ref } from 'vue'
import type { LmFuseSearchItem, LmFuseSearchResult } from '../../types'
import { useFuseSearch } from 'valaxy'
import { computed, ref, shallowRef } from 'vue'
import { collectQueryRanges, createHighlightParts, resolveSearchText, stripSearchHtml } from '../../domain'

/**
 * 封装 Valaxy Fuse 搜索，并将结果转换为搜索弹窗可直接消费的视图模型。
 */
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
      const title = resolveSearchText(item.title) || item.link
      const excerpt = stripSearchHtml(resolveSearchText(item.excerpt || item.content))

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
