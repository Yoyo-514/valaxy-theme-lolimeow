import { describe, expect, it } from 'vitest'
import { buildTagCloudItems } from '../theme/features/tag/tag-cloud'

describe('tag cloud weights', () => {
  it('ranks tags by usage and gives equal counts equal emphasis', () => {
    const items = [
      { id: 'a', name: 'Alpha', count: 2 },
      { id: 'b', name: 'Beta', count: 8 },
      { id: 'c', name: '中文标签', count: 2 },
    ]
    const original = structuredClone(items)
    const result = buildTagCloudItems(items)
    expect(result.map(item => item.id)).toEqual(items.map(item => item.id))
    expect(result.find(item => item.id === 'a')?.fontSize).toBe(result.find(item => item.id === 'c')?.fontSize)
    expect(result.find(item => item.id === 'b')!.fontWeight).toBeGreaterThan(result.find(item => item.id === 'a')!.fontWeight)
    expect(buildTagCloudItems(items)).toEqual(result)
    expect(items).toEqual(original)
  })

  it('handles empty, singleton and equal-weight collections', () => {
    expect(buildTagCloudItems([])).toEqual([])
    const items = [{ id: 'a', name: 'Only tag', count: 0 }]
    const single = buildTagCloudItems(items)[0]
    const equal = buildTagCloudItems([...items, { id: 'b', name: 'Another', count: 0 }])
    expect(equal.every(item => item.fontSize === single.fontSize && item.fontWeight === single.fontWeight)).toBe(true)
  })
})
