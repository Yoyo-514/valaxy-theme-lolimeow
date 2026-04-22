import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

export interface CategoryEntry {
  path: string
  title: string
  date?: string | number | Date
}

export interface CategoryNode {
  name: string
  fullPath: string
  parentPath: string
  depth: number
  total: number
  childCount: number
  entries: CategoryEntry[]
  children: CategoryNode[]
}

interface MutableCategoryNode {
  name: string
  segments: string[]
  total: number
  entries: CategoryEntry[]
  children: Map<string, MutableCategoryNode>
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

function normalizeCategorySegments(categories: Post['categories']) {
  if (Array.isArray(categories)) {
    const segments = categories
      .map(category => String(category).trim())
      .filter(Boolean)

    return segments.length ? segments : ['Uncategorized']
  }

  if (typeof categories === 'string' && categories.trim()) {
    return categories
      .split('/')
      .map(category => category.trim())
      .filter(Boolean)
  }

  return ['Uncategorized']
}

function isVisibleInCategory(post: Post) {
  return Boolean(post.path) && post.hide !== true
}

function createCategoryNode(name: string, segments: string[]): MutableCategoryNode {
  return {
    name,
    segments,
    total: 0,
    entries: [],
    children: new Map(),
  }
}

function compareNodes(left: CategoryNode, right: CategoryNode) {
  return right.total - left.total
    || right.childCount - left.childCount
    || left.fullPath.localeCompare(right.fullPath)
}

function compareEntries(left: CategoryEntry, right: CategoryEntry) {
  const leftTimestamp = resolveTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolveTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

function finalizeCategoryNode(node: MutableCategoryNode): CategoryNode {
  const children = Array.from(node.children.values())
    .map(finalizeCategoryNode)
    .sort(compareNodes)

  return {
    name: node.name,
    fullPath: node.segments.join('/'),
    parentPath: node.segments.slice(0, -1).join(' / '),
    depth: Math.max(node.segments.length - 1, 0),
    total: node.total,
    childCount: children.length,
    entries: node.entries.slice().sort(compareEntries),
    children,
  }
}

function countCategoryNodes(nodes: CategoryNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countCategoryNodes(node.children), 0)
}

export function useCategoryGroups() {
  const site = useSiteStore()

  const posts = computed(() => {
    return (site.postList ?? [])
      .filter(isVisibleInCategory)
      .slice()
      .sort((left, right) => resolveTimestamp(right) - resolveTimestamp(left))
  })

  const categories = computed<CategoryNode[]>(() => {
    const root = createCategoryNode('All', [])

    posts.value.forEach((post) => {
      const segments = normalizeCategorySegments(post.categories)
      const entry: CategoryEntry = {
        path: String(post.path),
        title: normalizeTitle(post.title),
        date: post.date ?? post.updated,
      }

      let current = root

      segments.forEach((segment, index) => {
        const nextSegments = segments.slice(0, index + 1)
        let next = current.children.get(segment)

        if (!next) {
          next = createCategoryNode(segment, nextSegments)
          current.children.set(segment, next)
        }

        next.total += 1
        current = next
      })

      current.entries.push(entry)
    })

    return Array.from(root.children.values())
      .map(finalizeCategoryNode)
      .sort(compareNodes)
  })

  const totalCategories = computed(() => countCategoryNodes(categories.value))
  const totalPosts = computed(() => posts.value.length)

  return {
    categories,
    totalCategories,
    totalPosts,
  }
}
