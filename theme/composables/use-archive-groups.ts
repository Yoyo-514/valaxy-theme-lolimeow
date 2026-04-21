import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

export interface ArchiveEntry {
  path: string
  title: string
  date?: string | number | Date
  categories: string[]
}

export interface ArchiveGroup {
  year: string
  sortKey: number
  count: number
  entries: ArchiveEntry[]
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

function normalizeCategories(categories: Post['categories']) {
  if (Array.isArray(categories))
    return categories.filter(Boolean).map(category => String(category).trim()).filter(Boolean)

  if (typeof categories === 'string' && categories.trim())
    return [categories.trim()]

  return []
}

function resolveTimestamp(post: Post) {
  const timestamp = new Date(post.date ?? post.updated ?? 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function resolveYear(post: Post) {
  const timestamp = resolveTimestamp(post)
  if (!timestamp)
    return 'Unknown'

  return String(new Date(timestamp).getFullYear())
}

function isVisibleInArchive(post: Post) {
  return Boolean(post.path) && post.hide !== true
}

export function useArchiveGroups() {
  const site = useSiteStore()

  const posts = computed(() => {
    return (site.postList ?? [])
      .filter(isVisibleInArchive)
      .slice()
      .sort((left, right) => resolveTimestamp(right) - resolveTimestamp(left))
  })

  const groups = computed<ArchiveGroup[]>(() => {
    const mapped = new Map<string, ArchiveGroup>()

    posts.value.forEach((post) => {
      const year = resolveYear(post)
      const existingGroup = mapped.get(year)
      const entry: ArchiveEntry = {
        path: String(post.path),
        title: normalizeTitle(post.title),
        date: post.date ?? post.updated,
        categories: normalizeCategories(post.categories),
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
  })

  const totalPosts = computed(() => posts.value.length)

  return {
    groups,
    totalPosts,
  }
}
