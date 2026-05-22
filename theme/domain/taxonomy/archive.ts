import type { Post } from 'valaxy'
import type { ArchiveEntry, ArchiveGroup } from './types'
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

function createArchiveEntry(post: Post): ArchiveEntry {
  return {
    ...createPostEntry(post),
    categories: normalizeArchiveCategories(post.categories),
  }
}

function appendArchiveGroup(mapped: Map<string, ArchiveGroup>, post: Post) {
  const year = resolveArchiveYear(post)
  const existingGroup = mapped.get(year)
  const entry = createArchiveEntry(post)
  const nextGroup: ArchiveGroup = existingGroup
    ? {
        ...existingGroup,
        count: existingGroup.count + 1,
        entries: [...existingGroup.entries, entry],
      }
    : {
        year,
        sortKey: year === 'Unknown' ? Number.NEGATIVE_INFINITY : Number(year),
        count: 1,
        entries: [entry],
      }

  return new Map(mapped).set(year, nextGroup)
}

/**
 * 从文章列表构建按年份分组的归档数据。
 */
export function buildArchiveGroups(sourcePosts: readonly Post[]) {
  return Array.from(
    getVisibleSortedPosts(sourcePosts)
      .reduce(appendArchiveGroup, new Map<string, ArchiveGroup>())
      .values(),
  ).sort((left, right) => right.sortKey - left.sortKey)
}
