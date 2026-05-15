import type { Post } from 'valaxy'
import type { ArchiveEntry, ArchiveGroup } from '../../types'
import { resolvePostTimestamp } from '../../utils'
import { createPostEntry, getVisibleSortedPosts } from '../post'

/**
 * 将文章分类归一化为归档条目的扁平分类列表。
 */
export function normalizeArchiveCategories(categories: Post['categories']) {
  if (Array.isArray(categories))
    return categories.filter(Boolean).map(category => String(category).trim()).filter(Boolean)

  if (typeof categories === 'string' && categories.trim())
    return [categories.trim()]

  return []
}

/**
 * 解析文章归档年份，无日期文章归入 Unknown。
 */
export function resolveArchiveYear(post: Post) {
  const timestamp = resolvePostTimestamp(post)
  // 无日期文章仍保留在归档中，但排序时固定落到最后。
  if (!timestamp)
    return 'Unknown'

  return String(new Date(timestamp).getFullYear())
}

/**
 * 从文章列表构建按年份分组的归档数据。
 */
export function buildArchiveGroups(sourcePosts: readonly Post[]) {
  const mapped = new Map<string, ArchiveGroup>()

  getVisibleSortedPosts(sourcePosts).forEach((post) => {
    const year = resolveArchiveYear(post)
    const existingGroup = mapped.get(year)
    const entry: ArchiveEntry = {
      ...createPostEntry(post),
      categories: normalizeArchiveCategories(post.categories),
    }

    if (existingGroup) {
      existingGroup.entries.push(entry)
      existingGroup.count += 1
      return
    }

    mapped.set(year, {
      year,
      sortKey: year === 'Unknown' ? Number.NEGATIVE_INFINITY : Number(year),
      count: 1,
      entries: [entry],
    })
  })

  return Array.from(mapped.values()).sort((left, right) => right.sortKey - left.sortKey)
}
