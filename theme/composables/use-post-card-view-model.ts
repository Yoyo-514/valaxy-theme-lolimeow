import type { Post } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { appendSeedQuery, normalizeExcerpt, pickBySeed } from '../utils'
import { useThemeConfig } from './config'

export function usePostCardViewModel(post: Post, index = 0) {
  const themeConfig = useThemeConfig()
  const postListConfig = computed(() => themeConfig.value.postList)

  const seed = computed(() => post.path || `${post.title || 'post'}-${index}`)

  const coverCandidates = computed(() => {
    // 同一篇文章始终映射到同一组随机封面，避免列表重排时图片抖动。
    const postCover = (post as Post & { cover?: string }).cover
    if (postCover)
      return [postCover]

    const { coverRandom, coverApiUrls = [], coverFallback = [] } = postListConfig.value
    const candidates: string[] = []

    if (coverRandom && coverApiUrls.length) {
      const pickedApi = pickBySeed(coverApiUrls, seed.value)
      if (pickedApi)
        candidates.push(appendSeedQuery(pickedApi, seed.value))
    }

    if (coverFallback.length) {
      const pckedFallback = pickBySeed(coverFallback, seed.value)
      if (pckedFallback)
        candidates.push(pckedFallback)
    }

    return candidates
  })

  const coverIndex = ref(0)

  watch(coverCandidates, () => {
    coverIndex.value = 0
  }, { immediate: true })

  const currentCover = computed(() => coverCandidates.value[coverIndex.value] ?? '')

  function handleCoverError() {
    // 封面加载失败时逐个尝试候选图；全部失败后退回纯文本卡片。
    if (coverIndex.value < coverCandidates.value.length - 1)
      coverIndex.value += 1
    else
      coverIndex.value = -1
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
