import type { Post } from 'valaxy'
import type { ArchiveEntry, ArchiveGroup } from './types'
import { createPostEntry, getVisibleSortedPosts } from '../post'

/**
 * 将文章分类归一化为归档条目的扁平分类列表。
 *
 * @param categories - Valaxy 文章的分类字段。
 * @returns 去除空值和首尾空白后的分类列表。
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
 *
 * @param post - 待解析的 Valaxy 文章。
 * @returns 四位年份字符串，缺少有效时间时返回 `Unknown`。
 */
export function resolveArchiveYear(post: Post, timezone = 'UTC') {
  return resolveArchiveDate(post.date ?? post.updated, timezone)?.slice(0, 4) ?? 'Unknown'
}

/** 使用明确时区解析日历日期，避免服务端与浏览器的本地时区影响分组。 */
export function resolveArchiveDate(value: ArchiveEntry['date'], timezone = 'UTC') {
  if (value === undefined || value === null || value === '')
    return undefined

  const date = new Date(value)
  if (!Number.isFinite(date.getTime()))
    return undefined

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

/** 年内按月份倒序分组；没有有效日期的条目单独保留在末尾。 */
export function buildArchiveMonths(entries: readonly ArchiveEntry[], timezone = 'UTC') {
  const months = new Map<string, ArchiveEntry[]>()
  for (const entry of entries) {
    const calendarDate = entry.calendarDate ?? resolveArchiveDate(entry.date, timezone)
    const month = calendarDate?.slice(0, 7) ?? 'Unknown'
    const group = months.get(month) ?? []
    group.push({ ...entry, calendarDate })
    months.set(month, group)
  }
  return [...months].sort(([left], [right]) => {
    if (left === 'Unknown')
      return 1
    if (right === 'Unknown')
      return -1
    return right.localeCompare(left)
  }).map(([month, monthEntries]) => ({ month, entries: monthEntries }))
}

/**
 * 将 Valaxy 文章转换为归档页条目。
 *
 * @param post - 待转换的 Valaxy 文章。
 * @returns 包含归一化分类的归档条目。
 */
function createArchiveEntry(post: Post, timezone: string): ArchiveEntry {
  return {
    ...createPostEntry(post),
    calendarDate: resolveArchiveDate(post.date ?? post.updated, timezone),
    categories: normalizeArchiveCategories(post.categories),
  }
}

/**
 * 将文章追加到本次构建拥有的年份分组映射。
 *
 * @param mapped - 已构建的年份分组映射。
 * @param post - 待追加的 Valaxy 文章。
 * @returns 包含当前文章的年份分组映射。
 */
function appendArchiveGroup(mapped: Map<string, ArchiveGroup>, post: Post, timezone: string) {
  const entry = createArchiveEntry(post, timezone)
  const year = entry.calendarDate?.slice(0, 4) ?? 'Unknown'
  const existingGroup = mapped.get(year)
  if (existingGroup) {
    existingGroup.entries.push(entry)
    existingGroup.count += 1
  }
  else {
    mapped.set(year, {
      year,
      sortKey: year === 'Unknown' ? Number.NEGATIVE_INFINITY : Number(year),
      count: 1,
      entries: [entry],
    })
  }
  return mapped
}

/**
 * 从文章列表构建按年份分组的归档数据。
 *
 * @param sourcePosts - 待聚合的只读文章列表。
 * @returns 按年份倒序排列且将 Unknown 固定置后的归档分组。
 */
export function buildArchiveGroups(sourcePosts: readonly Post[], timezone = 'UTC') {
  return Array.from(
    getVisibleSortedPosts(sourcePosts)
      .reduce((groups, post) => appendArchiveGroup(groups, post, timezone), new Map<string, ArchiveGroup>())
      .values(),
  ).sort((left, right) => right.sortKey - left.sortKey)
}
