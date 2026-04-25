import type { Post } from 'valaxy'
import { isVisiblePost, normalizePostTitle, resolvePostTimestamp } from '@theme/utils'
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
  const leftTimestamp = resolvePostTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolvePostTimestamp({ date: right.date, updated: undefined })

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
      .filter(isVisiblePost)
      .slice()
      .sort((left, right) => resolvePostTimestamp(right) - resolvePostTimestamp(left))
  })

  const categories = computed<CategoryNode[]>(() => {
    const root = createCategoryNode('All', [])

    posts.value.forEach((post) => {
      const segments = normalizeCategorySegments(post.categories)
      const entry: CategoryEntry = {
        path: String(post.path),
        title: normalizePostTitle(post.title),
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
