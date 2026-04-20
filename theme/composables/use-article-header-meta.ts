import { formatDate, useFrontmatter } from 'valaxy'
import { computed } from 'vue'

interface ArticleInfoItem {
  icon: string
  text: string
}

export function useArticleHeaderMeta() {
  const frontmatter = useFrontmatter()

  const cover = computed(() => {
    const postCover = frontmatter.value.cover

    if (typeof postCover === 'string' && postCover)
      return postCover

    const image = frontmatter.value.image

    if (typeof image === 'string' && image)
      return image

    if (Array.isArray(image)) {
      const firstString = image.find(item => typeof item === 'string')
      if (typeof firstString === 'string')
        return firstString
    }

    if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string')
      return image.url

    return ''
  })

  const categories = computed(() => {
    const value = frontmatter.value.categories
    return Array.isArray(value) ? value : value ? [value] : []
  })

  const tags = computed(() => {
    const value = frontmatter.value.tags
    return Array.isArray(value) ? value : value ? [value] : []
  })

  const publishedDate = computed(() => {
    return frontmatter.value.date || ''
  })

  const updatedDate = computed(() => {
    const updated = frontmatter.value.updated
    if (!updated)
      return ''

    const nextUpdatedText = formatDate(updated)
    const publishedText = formatDate(publishedDate.value)
    return publishedText !== nextUpdatedText ? nextUpdatedText : ''
  })

  const wordCount = computed(() => {
    return frontmatter.value.wordCount
  })

  const readingTime = computed(() => {
    const value = frontmatter.value.readingTime
    return typeof value === 'number' && value > 0 ? value : 0
  })

  const infoItems = computed<ArticleInfoItem[]>(() => {
    const items: ArticleInfoItem[] = []

    if (updatedDate.value) {
      items.push({
        icon: 'i-ri-history-line',
        text: `更新于 ${updatedDate.value}`,
      })
    }

    if (wordCount.value) {
      items.push({
        icon: 'i-ri-file-text-line',
        text: `本文字数: ${wordCount.value}`,
      })
    }

    if (readingTime.value > 0) {
      items.push({
        icon: 'i-ri-book-open-line',
        text: `阅读时长: ${readingTime.value}m`,
      })
    }

    return items
  })

  return {
    frontmatter,
    cover,
    categories,
    tags,
    publishedDate,
    updatedDate,
    wordCount,
    readingTime,
    infoItems,
  }
}
