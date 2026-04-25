import type { Post } from 'valaxy'
import { isVisiblePost, normalizePostTitle, resolvePostTimestamp } from '@theme/utils'
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

function normalizeCategories(categories: Post['categories']) {
  if (Array.isArray(categories))
    return categories.filter(Boolean).map(category => String(category).trim()).filter(Boolean)

  if (typeof categories === 'string' && categories.trim())
    return [categories.trim()]

  return []
}

function resolveYear(post: Post) {
  const timestamp = resolvePostTimestamp(post)
  if (!timestamp)
    return 'Unknown'

  return String(new Date(timestamp).getFullYear())
}

export function useArchiveGroups() {
  const site = useSiteStore()

  const posts = computed(() => {
    return (site.postList ?? [])
      .filter(isVisiblePost)
      .slice()
      .sort((left, right) => resolvePostTimestamp(right) - resolvePostTimestamp(left))
  })

  const groups = computed<ArchiveGroup[]>(() => {
    const mapped = new Map<string, ArchiveGroup>()

    posts.value.forEach((post) => {
      const year = resolveYear(post)
      const existingGroup = mapped.get(year)
      const entry: ArchiveEntry = {
        path: String(post.path),
        title: normalizePostTitle(post.title),
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
