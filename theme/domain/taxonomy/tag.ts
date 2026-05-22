import type { Post } from 'valaxy'
import type { TagEntry, TagGroup } from './types'
import { hashString, resolvePostTimestamp } from '../../utils'
import { createPostEntry, getVisibleSortedPosts } from '../post'

interface MutableTagGroup {
  id: string
  name: string
  entries: TagEntry[]
}

/**
 * 将 frontmatter 中的标签字段归一化为去重后的标签数组。
 */
export function normalizeTags(tags: unknown) {
  if (Array.isArray(tags))
    return Array.from(new Set(tags.map(tag => String(tag).trim()).filter(Boolean)))

  if (typeof tags === 'string' && tags.trim())
    return [tags.trim()]

  return []
}

/**
 * 为标签生成稳定且可读的 DOM id。
 */
export function createTagId(name: string) {
  // 可读片段便于调试，哈希片段用于兜住中文或特殊字符归一化后的碰撞。
  const readable = encodeURIComponent(name)
    .replace(/%/g, '')
    .replace(/[^\w-]/g, '-')
  const hash = hashString(name).toString(36)

  return `tag-${readable}-${hash}`
}

/**
 * 按文章日期倒序排列标签下的文章条目。
 */
function compareEntries(left: TagEntry, right: TagEntry) {
  const leftTimestamp = resolvePostTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolvePostTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

/**
 * 按文章数和标签名稳定排序标签组。
 */
function compareGroups(left: TagGroup, right: TagGroup) {
  return right.count - left.count || left.name.localeCompare(right.name)
}

/**
 * 从文章列表构建标签聚合数据。
 */
export function buildTagGroups(sourcePosts: readonly Post[]) {
  const mapped = new Map<string, MutableTagGroup>()

  getVisibleSortedPosts(sourcePosts).forEach((post) => {
    const tags = normalizeTags(post.tags)
    if (!tags.length)
      return

    const entry = createPostEntry(post)

    tags.forEach((tag) => {
      const existing = mapped.get(tag)

      if (existing) {
        existing.entries.push(entry)
        return
      }

      mapped.set(tag, {
        id: createTagId(tag),
        name: tag,
        entries: [entry],
      })
    })
  })

  return Array.from(mapped.values())
    .map(group => ({
      id: group.id,
      name: group.name,
      count: group.entries.length,
      entries: group.entries.slice().sort(compareEntries),
    }))
    .sort(compareGroups)
}

/**
 * 统计拥有至少一个标签的文章数量。
 */
export function countTaggedPosts(groups: readonly TagGroup[]) {
  // 一篇文章可拥有多个标签，统计文章总数时必须按路径去重。
  const paths = new Set<string>()

  groups.forEach((group) => {
    group.entries.forEach(entry => paths.add(entry.path))
  })

  return paths.size
}
