import type { Post } from 'valaxy'
import type { CategoryEntry, CategoryNode } from './types'
import { resolvePostTimestamp } from '../../utils'
import { createPostEntry, getVisibleSortedPosts } from '../post'

interface MutableCategoryNode {
  name: string
  segments: string[]
  total: number
  entries: CategoryEntry[]
  children: Map<string, MutableCategoryNode>
}

/**
 * 将 frontmatter 中的分类字段解析为分类树路径段。
 */
export function normalizeCategorySegments(categories: Post['categories']) {
  if (Array.isArray(categories)) {
    // 数组分类按层级段处理，保持和 "A/B/C" 字符串分类一致的树语义。
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

/**
 * 创建分类树构建阶段使用的可变节点。
 */
function createCategoryNode(name: string, segments: string[]): MutableCategoryNode {
  return {
    name,
    segments,
    total: 0,
    entries: [],
    children: new Map(),
  }
}

/**
 * 按文章数、子分类数、路径名稳定排序分类节点。
 */
function compareNodes(left: CategoryNode, right: CategoryNode) {
  return right.total - left.total
    || right.childCount - left.childCount
    || left.fullPath.localeCompare(right.fullPath)
}

/**
 * 按文章日期倒序排列分类下的文章条目。
 */
function compareEntries(left: CategoryEntry, right: CategoryEntry) {
  const leftTimestamp = resolvePostTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolvePostTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

/**
 * 将构建阶段的可变节点转换为 UI 消费的只读树节点结构。
 */
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

/**
 * 递归统计分类树节点总数。
 */
export function countCategoryNodes(nodes: CategoryNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countCategoryNodes(node.children), 0)
}

/**
 * 从文章列表构建分类树。
 */
export function buildCategoryTree(sourcePosts: readonly Post[]) {
  const root = createCategoryNode('All', [])

  getVisibleSortedPosts(sourcePosts).forEach((post) => {
    const segments = normalizeCategorySegments(post.categories)
    const entry = createPostEntry(post)
    let current = root

    segments.forEach((segment, index) => {
      const nextSegments = segments.slice(0, index + 1)
      let next = current.children.get(segment)

      if (!next) {
        next = createCategoryNode(segment, nextSegments)
        current.children.set(segment, next)
      }

      // 每一层都累计文章数，父级 total 表示该分类树下的文章总量。
      next.total += 1
      current = next
    })

    current.entries.push(entry)
  })

  return Array.from(root.children.values())
    .map(finalizeCategoryNode)
    .sort(compareNodes)
}
