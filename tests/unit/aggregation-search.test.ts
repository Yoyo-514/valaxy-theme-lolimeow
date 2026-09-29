import type { Post } from 'valaxy'
import { describe, expect, it } from 'vitest'
import { buildCategoryTree } from '../../theme/features/category/category'
import { collectQueryRanges, createHighlightParts, mergeRanges } from '../../theme/features/search/highlight'
import { buildTagGroups, countTaggedPosts } from '../../theme/features/tag/tag'

describe('post aggregation', () => {
  const posts = Object.freeze([
    Object.freeze({ path: '/a', title: 'A', date: '2025-01-01', tags: ['Vue', 'Vue', 'CSS'], categories: ['Web', 'Vue'] }),
    Object.freeze({ path: '/b', title: 'B', date: '2025-02-01', tags: ['Vue'], categories: ['Web', 'Vue'] }),
    Object.freeze({ path: '/c', title: 'C', date: '2025-03-01' }),
  ]) as unknown as readonly Post[]

  it('deduplicates tags and keeps date order without mutating source posts', () => {
    const groups = buildTagGroups(posts)
    expect(groups.map(group => [group.name, group.count])).toEqual([['Vue', 2], ['CSS', 1]])
    expect(groups[0].entries.map(entry => entry.path)).toEqual(['/b', '/a'])
    expect(countTaggedPosts(groups)).toBe(2)
    expect(posts[0].path).toBe('/a')
    expect(buildTagGroups([])).toEqual([])
  })

  it('counts descendants once and stores entries at their leaf', () => {
    const tree = buildCategoryTree(posts)
    expect(tree.map(node => [node.name, node.total])).toEqual([['Web', 2], ['Uncategorized', 1]])
    expect(tree[0].entries).toEqual([])
    expect(tree[0].children[0].entries.map(entry => entry.path)).toEqual(['/b', '/a'])
    expect(buildCategoryTree([])).toEqual([])
  })
})

describe('search highlights', () => {
  it('merges adjacent and overlapping ranges, clipping outside text', () => {
    const ranges = [[4, 7], [-3, 1], [1, 3], [20, 30]] as const
    expect(mergeRanges(ranges, 6)).toEqual([[0, 5]])
    expect(ranges[0]).toEqual([4, 7])
    expect(mergeRanges(ranges, 0)).toEqual([])
  })

  it('preserves all text while highlighting case-insensitive query terms', () => {
    const text = 'Vue and vue, CSS!'
    const parts = createHighlightParts(text, collectQueryRanges(text, 'vue CSS'))
    expect(parts.map(part => part.text).join('')).toBe(text)
    expect(parts.filter(part => part.highlighted).map(part => part.text)).toEqual(['Vue', 'vue', 'CSS'])
    expect(createHighlightParts('', [])).toEqual([])
    expect(createHighlightParts('text', [])).toEqual([{ text: 'text', highlighted: false }])
  })
})
