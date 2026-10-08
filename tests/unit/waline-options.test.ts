import { describe, expect, it } from 'vitest'
import { resolveWalineClientOptions, resolveWalineEmoji } from '../../theme/features/comment/waline-options'

describe('waline emoji options', () => {
  it('keeps the addon default groups', () => {
    expect(resolveWalineEmoji({})).toEqual([
      '//unpkg.com/@waline/emojis/bilibili/',
      '//unpkg.com/@waline/emojis/qq/',
      '//unpkg.com/@waline/emojis/weibo/',
    ])
  })

  it('combines a custom CDN, groups and emoji directories in order', () => {
    const options = { cdn: 'https://cdn.example/', types: ['qq'], emoji: ['https://emoji.example/custom'] }
    expect(resolveWalineEmoji(options)).toEqual([
      'https://cdn.example/@waline/emojis/qq/',
      'https://emoji.example/custom/',
    ])
    expect(options.emoji).toEqual(['https://emoji.example/custom'])
  })

  it('allows disabling all emoji requests', () => {
    expect(resolveWalineEmoji({ types: [], emoji: [] })).toEqual([])
  })

  it('keeps custom-only groups and default groups with an empty custom list', () => {
    expect(resolveWalineEmoji({ types: [], emoji: ['https://emoji.example/custom'] })).toEqual(['https://emoji.example/custom/'])
    expect(resolveWalineEmoji({ emoji: [] })).toEqual(resolveWalineEmoji({}))
  })
})

describe('waline client options', () => {
  it('strips the addon-only fields before binding them to the component', () => {
    const options = { serverURL: 'https://waline.example', path: '/posts/demo', cdn: 'https://cdn.example/', types: ['qq'] }
    expect(resolveWalineClientOptions(options)).toEqual({ serverURL: 'https://waline.example', path: '/posts/demo' })
    expect(options.cdn).toBe('https://cdn.example/')
  })
})
