import type { UI } from '../../theme/types'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_COLORS, resolveThemeColorsScss } from '../../theme/node/colors'
import { themePlugin } from '../../theme/node/plugins'

// 使用 Valaxy 实际依赖的 Sass，验证真正的配置 → 编译 → CSS 链路。
const require = createRequire(new URL('../../theme/package.json', import.meta.url))
const sass = createRequire(require.resolve('valaxy'))('sass')
const root = fileURLToPath(new URL('../../', import.meta.url))

function compile(ui: UI = {}, warnings?: string[]) {
  const source = `${resolveThemeColorsScss(ui)}
    @use 'theme/styles/vars' as v with ($lm-colors: $lm-theme-colors, $lm-tokens: $lm-theme-tokens);
    .light { @each $key, $value in v.$light { --lm-#{$key}: #{$value}; } }
    .dark { @each $key, $value in v.$dark { --lm-#{$key}: #{$value}; } }`
  const { css } = sass.compileString(source, {
    loadPaths: [root],
    logger: warnings ? { warn: (message: string) => warnings.push(message) } : undefined,
  })
  return Object.fromEntries([...css.matchAll(/\.(light|dark)\s*\{([^}]+)\}/g)].map(match => [
    match[1],
    Object.fromEntries([...match[2].matchAll(/--lm-([^:]+):([^;]+);/g)].map(m => [m[1], m[2]!.trim()])),
  ])) as Record<'light' | 'dark', Record<string, string>>
}

function luminance(value: string) {
  const named: Record<string, string> = { black: '#000', white: '#fff', red: '#f00', blue: '#00f', yellow: '#ff0', lime: '#0f0', cyan: '#0ff', magenta: '#f0f', gray: '#808080', olive: '#808000' }
  value = named[value] ?? value
  const hex = value.startsWith('#') ? value.slice(1) : ''
  const channels = hex
    ? (hex.length === 3 ? [...hex].map(v => v.repeat(2)) : hex.match(/../g)!).map(v => Number.parseInt(v, 16) / 255)
    : value.match(/[\d.]+%?/g)!.slice(0, 3).map(v => Number.parseFloat(v) / (v.endsWith('%') ? 100 : 255))
  const linear = channels.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)]
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05)
}

describe('theme colors', () => {
  it('keeps Tianyi blue and readable default pairs in both modes', () => {
    const modes = compile()
    for (const tokens of Object.values(modes)) {
      expect(tokens['c-primary-base']?.toLowerCase()).toBe('#66ccff')
      for (const hue of Object.keys(DEFAULT_COLORS)) {
        for (const role of ['text', 'text-hover', 'focus-ring'])
          expect(contrast(tokens[`c-${hue}-${role}`]!, tokens['c-bg-base']!)).toBeGreaterThanOrEqual(4.5)
        for (const role of ['solid', 'solid-hover'])
          expect(contrast(tokens[`c-${hue}-on-solid`]!, tokens[`c-${hue}-${role}`]!)).toBeGreaterThanOrEqual(4.5)
      }
    }
    expect(modes.light['c-primary-text']).not.toBe(modes.light['c-primary-text-hover'])
    expect(modes.dark['c-primary-text']).not.toBe(modes.dark['c-primary-text-hover'])
  })

  it.each(['#000', '#fff', '#777777', '#ffff00', '#0000ff', '#ff0000', '#00ff00', '#808000'])('derives readable custom colors from %s', (primary) => {
    for (const tokens of Object.values(compile({ colors: { primary } }))) {
      expect(contrast(tokens['c-primary-text']!, tokens['c-bg-base']!)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(tokens['c-primary-text-hover']!, tokens['c-bg-base']!)).toBeGreaterThanOrEqual(4.5)
      for (const role of ['solid', 'solid-hover'])
        expect(contrast(tokens['c-primary-on-solid']!, tokens[`c-primary-${role}`]!)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('isolates semantic overrides and derives foreground from the final solid', () => {
    const defaults = compile()
    const modes = compile({ tokens: { light: { primary: { text: '#005577', solid: '#112233', soft: 'rgb(20 80 120 / 10%)' } } } })
    expect(modes.light['c-primary-text']).toBe('#005577')
    expect(modes.light['c-primary-solid']).toBe('#112233')
    expect(modes.light['c-primary-on-solid']).toBe('#fff')
    expect(modes.light['c-primary-base']).toBe(defaults.light['c-primary-base'])
    expect(modes.light['c-primary-600']).toBe(defaults.light['c-primary-600'])
    expect(modes.dark).toEqual(defaults.dark)
    expect(modes.light['c-accent-text']).toBe(defaults.light['c-accent-text'])
  })

  it('keeps status colors independent of primary', () => {
    const defaults = compile()
    const custom = compile({ colors: { primary: '#ff0000' } })
    for (const hue of ['info', 'success', 'warning', 'danger'])
      expect(custom.light[`c-${hue}-base`]).toBe(defaults.light[`c-${hue}-base`])
  })

  it('warns on low-contrast overrides without rewriting user colors', () => {
    const warnings: string[] = []
    const modes = compile({ tokens: { light: { primary: { text: '#ffffff', textHover: '#ffffff' } } } }, warnings)
    expect(modes.light['c-primary-text']).toBe('#ffffff')
    expect(warnings.some(message => message.includes('themeConfig.ui.tokens.light.primary.textHover'))).toBe(true)
    expect(warnings.some(message => message.includes('themeConfig.ui.tokens.light.primary.focusRing'))).toBe(true)
  })

  it.each(['#6cf', '#66ccffff', 'rgb(102, 204, 255)', 'rgb(40% 80% 100%)', 'hsl(200deg 100% 70%)', 'hsla(200, 100%, 70%, 1)'])('compiles supported literal %s', (primary) => {
    expect(compile({ colors: { primary } }).light['c-primary-base']).toBeTruthy()
  })

  it.each(['', '#12345', '#1234567', '#1234', 'rgb()', 'rgb(1 2)', 'rgb(256 0 0)', 'rgb(1, 2, 3 / .5)', 'hsl(200 80 50)', 'rgb(0 0 0 / .5)', 'var(--custom)', 'red', '#66ccff; @error "injected"'])('rejects invalid or transparent base %s with its path', (primary) => {
    expect(() => resolveThemeColorsScss({ colors: { primary } })).toThrow('themeConfig.ui.colors.primary')
  })

  it.each([
    [{ primary: '#66ccff' }, 'ui.primary'],
    [{ colros: {} }, 'ui.colros'],
    [{ colors: { primary: { base: '#66ccff' } } }, 'ui.colors.primary'],
    [{ colors: null }, 'ui.colors'],
    [{ colors: { primray: '#66ccff' } }, 'ui.colors.primray'],
    [{ tokens: { ligth: {} } }, 'ui.tokens.ligth'],
    [{ tokens: { light: { primary: { txt: '#000' } } } }, 'ui.tokens.light.primary.txt'],
    [{ tokens: { light: { primary: { onSolid: '#0008' } } } }, 'ui.tokens.light.primary.onSolid'],
  ])('reports invalid configuration %#', (ui, path) => {
    expect(() => resolveThemeColorsScss(ui as UI)).toThrow(`themeConfig.${path}`)
  })

  it('accepts empty overrides and explicitly omitted values', () => {
    expect(compile({ colors: { primary: undefined }, tokens: { light: { primary: {} }, dark: undefined } })).toEqual(compile())
  })
})

describe('sCSS injection', () => {
  // 调用真实插件 hook 与真实用户回调，不替换或 mock 插件依赖。
  async function additionalData(user: unknown) {
    const plugin = themePlugin({ config: { themeConfig: { ui: {} } } } as Parameters<typeof themePlugin>[0])
    const hook = plugin.config as (...args: unknown[]) => any
    const config = await hook({ css: { preprocessorOptions: { scss: { additionalData: user } } } })
    return config.css.preprocessorOptions.scss.additionalData
  }

  it('preserves string additionalData after theme defaults', async () => {
    const inject = await additionalData('$user: 42;')
    const source = inject('.example {}', 'example.scss')
    expect(source).toContain('$user: 42;\n.example {}')
    expect(source.indexOf('$lm-theme-colors')).toBeLessThan(source.indexOf('$user'))
  })

  it('preserves async callbacks, filename and returned source maps', async () => {
    const inject = await additionalData(async (source: string, filename: string) => ({ content: `${source}\n/* ${filename} */`, map: null }))
    const result = await inject('.example {}', 'example.scss')
    expect(result.content).toContain('$lm-theme-colors')
    expect(result.content).toContain('.example {}\n/* example.scss */')
    expect(result.map).toBeNull()
  })
})
