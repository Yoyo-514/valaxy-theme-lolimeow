import type { Post } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { appendRetryQuery, appendSeedQuery, normalizeExcerpt, orderBySeed } from '../../utils'
import { useThemeConfig } from '../config'

const API_COVER_RETRY_LIMIT = 3

type CoverCandidateSource = 'post' | 'api' | 'fallback'

interface CoverCandidate {
  source: CoverCandidateSource
  url: string
}

function compactCoverCandidates(candidates: CoverCandidate[]) {
  const seen = new Set<string>()

  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url))
      return false

    seen.add(candidate.url)
    return true
  })
}

export function usePostCardViewModel(post: Post, index = 0) {
  const themeConfig = useThemeConfig()
  const postListConfig = computed(() => themeConfig.value.postList)

  const seed = computed(() => post.path || `${post.title || 'post'}-${index}`)

  const coverCandidates = computed(() => {
    // 每组候选都从稳定种子命中的位置开始轮转：同一篇文章顺序稳定，失败时仍能尝试池内其余地址。
    const postCover = (post as Post & { cover?: string }).cover
    const { coverRandom, coverApiUrls = [], coverFallback = [] } = postListConfig.value
    const apiCandidates = coverRandom
      ? orderBySeed(coverApiUrls, seed.value).map(url => ({
          source: 'api' as const,
          url: appendSeedQuery(url, seed.value),
        }))
      : []
    const fallbackCandidates = orderBySeed(coverFallback, seed.value).map(url => ({
      source: 'fallback' as const,
      url,
    }))

    return compactCoverCandidates([
      ...(postCover ? [{ source: 'post', url: postCover } as const] : []),
      ...apiCandidates,
      ...fallbackCandidates,
    ])
  })

  const coverIndex = ref(0)
  const apiRetryCount = ref(0)

  watch(coverCandidates, () => {
    coverIndex.value = 0
    apiRetryCount.value = 0
  }, { immediate: true })

  const currentCoverCandidate = computed(() => coverCandidates.value[coverIndex.value])
  const currentCover = computed(() => {
    const candidate = currentCoverCandidate.value
    if (!candidate)
      return ''

    if (candidate.source === 'api' && apiRetryCount.value > 0)
      return appendRetryQuery(candidate.url, apiRetryCount.value)

    return candidate.url
  })

  function advanceCoverCandidate() {
    apiRetryCount.value = 0

    if (coverIndex.value < coverCandidates.value.length - 1)
      coverIndex.value += 1
    else
      coverIndex.value = -1
  }

  function handleCoverError() {
    const candidate = currentCoverCandidate.value
    if (!candidate)
      return

    if (candidate.source === 'api' && apiRetryCount.value < API_COVER_RETRY_LIMIT) {
      apiRetryCount.value += 1
      return
    }

    // 非 API 候选失败后立即前进；所有候选耗尽后退回纯文本卡片。
    advanceCoverCandidate()
  }

  const hasMedia = computed(() => !!currentCover.value)
  const isTextOnly = computed(() => !hasMedia.value)

  const title = computed(() => String(post.title ?? '').trim() || 'Untitled')

  const displayDate = computed(() => post.updated ?? post.date)

  const dateLabel = computed(() => post.updated ? 'Updated on' : 'Published on')

  const tags = computed(() => post.tags ?? [])

  const excerpt = computed(() => {
    if (postListConfig.value.showExcerpt === false)
      return ''

    const max = postListConfig.value.excerptLength ?? 140
    return normalizeExcerpt(String(post.excerpt ?? ''), max)
  })

  const isReversed = computed(() => {
    if (!postListConfig.value.imageReversed)
      return false

    if (!hasMedia.value)
      return false

    return index % 2 === 1
  })

  return {
    currentCover,
    dateLabel,
    displayDate,
    excerpt,
    tags,
    title,
    hasMedia,
    isTextOnly,
    isReversed,
    handleCoverError,
  }
}
