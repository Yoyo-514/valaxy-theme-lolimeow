import type { Post } from 'valaxy'
import { describe, expect, it } from 'vitest'
import { buildArchiveGroups, buildArchiveMonths, resolveArchiveDate, resolveArchiveYear } from '../../theme/features/archive/archive'

describe('archive calendar', () => {
  it('groups visible posts by year and month without changing the source', () => {
    const posts: Post[] = [
      { path: '/april', title: 'April', date: '2026-04-02T00:00:00Z' },
      { path: '/hidden', date: '2026-05-01T00:00:00Z', hide: true },
      { path: '/march', date: '2026-03-01T00:00:00Z' },
      { path: '/newer', date: '2026-04-20T00:00:00Z' },
      { path: '/old', date: '2025-12-01T00:00:00Z' },
      { date: '2026-06-01T00:00:00Z' },
    ]
    const original = structuredClone(posts)
    const groups = buildArchiveGroups(posts, 'Asia/Shanghai')
    expect(groups.map(group => [group.year, group.count])).toEqual([['2026', 3], ['2025', 1]])
    expect(buildArchiveMonths(groups[0].entries).map(group => [group.month, group.entries.map(entry => entry.path)]))
      .toEqual([['2026-04', ['/newer', '/april']], ['2026-03', ['/march']]])
    expect(posts).toEqual(original)
  })

  it('uses the same site timezone for the year, month and displayed date', () => {
    const post: Post = { path: '/boundary', date: '2025-12-31T18:00:00Z' }
    const groups = buildArchiveGroups([post], 'Asia/Shanghai')
    expect(resolveArchiveYear(post, 'Asia/Shanghai')).toBe('2026')
    expect(groups[0].entries[0].calendarDate).toBe('2026-01-01')
    expect(buildArchiveMonths(groups[0].entries)[0].month).toBe('2026-01')
    expect(resolveArchiveYear(post, 'America/New_York')).toBe('2025')
  })

  it('retains undated posts, supports updated fallback and accepts the Unix epoch', () => {
    const groups = buildArchiveGroups([
      { path: '/missing' },
      { path: '/invalid', date: 'invalid' },
      { path: '/epoch', date: 0 },
      { path: '/updated', updated: '2024-02-29T12:00:00Z' },
    ])
    expect(groups.map(group => group.year)).toEqual(['2024', '1970', 'Unknown'])
    expect(groups[2].count).toBe(2)
    expect(buildArchiveMonths(groups[2].entries)[0].month).toBe('Unknown')
    expect(groups[2].entries.every(entry => entry.calendarDate === undefined)).toBe(true)
    expect(resolveArchiveDate(0)).toBe('1970-01-01')
  })

  it('handles empty input and invalid dates', () => {
    expect(buildArchiveGroups([])).toEqual([])
    expect(buildArchiveMonths([])).toEqual([])
    for (const value of [undefined, '', 'invalid', new Date(Number.NaN)])
      expect(resolveArchiveDate(value)).toBeUndefined()
  })

  it('uses UTC when the site leaves its timezone empty', () => {
    const groups = buildArchiveGroups([{ path: '/boundary', date: '2025-12-31T23:30:00Z' }], '')
    expect(groups[0].year).toBe('2025')
    expect(groups[0].entries[0].calendarDate).toBe('2025-12-31')
    expect(buildArchiveMonths(groups[0].entries, '')[0].month).toBe('2025-12')
  })
})
