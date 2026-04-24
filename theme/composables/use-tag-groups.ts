import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

export interface TagEntry {
  path: string
  title: string
  date?: string | number | Date
}

export interface TagGroup {
  id: string
  name: string
  count: number
  entries: TagEntry[]
}

interface MutableTagGroup {
  id: string
  name: string
  entries: TagEntry[]
}

function normalizeTitle(title: Post['title']) {
  if (typeof title === 'string')
    return title.trim() || 'Untitled'

  if (title && typeof title === 'object') {
    const resolved = Object.values(title).find(value => String(value).trim())
    if (resolved)
      return String(resolved).trim()
  }

  return 'Untitled'
}

function resolveTimestamp(post: Pick<Post, 'date' | 'updated'>) {
  const timestamp = new Date(post.date ?? post.updated ?? 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags))
    return Array.from(new Set(tags.map(tag => String(tag).trim()).filter(Boolean)))

  if (typeof tags === 'string' && tags.trim())
    return [tags.trim()]

  return []
}

function createTagId(name: string) {
  return `tag-${encodeURIComponent(name).replace(/%/g, '').replace(/[^\w-]/g, '-').toLowerCase()}`
}

function isVisibleInTags(post: Post) {
  return Boolean(post.path) && post.hide !== true
}

function compareEntries(left: TagEntry, right: TagEntry) {
  const leftTimestamp = resolveTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolveTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

function compareGroups(left: TagGroup, right: TagGroup) {
  return right.count - left.count || left.name.localeCompare(right.name)
}

export function useTagGroups() {
  const site = useSiteStore()

  const posts = computed(() => {
    return (site.postList ?? [])
      .filter(isVisibleInTags)
      .slice()
      .sort((left, right) => resolveTimestamp(right) - resolveTimestamp(left))
  })

  const groups = computed<TagGroup[]>(() => {
    const mapped = new Map<string, MutableTagGroup>()

    posts.value.forEach((post) => {
      const tags = normalizeTags(post.tags)
      if (!tags.length)
        return

      const entry: TagEntry = {
        path: String(post.path),
        title: normalizeTitle(post.title),
        date: post.date ?? post.updated,
      }

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
  })

  const totalTags = computed(() => groups.value.length)
  const totalPosts = computed(() => {
    const paths = new Set<string>()

    groups.value.forEach((group) => {
      group.entries.forEach(entry => paths.add(entry.path))
    })

    return paths.size
  })

  return {
    groups,
    totalPosts,
    totalTags,
  }
}
