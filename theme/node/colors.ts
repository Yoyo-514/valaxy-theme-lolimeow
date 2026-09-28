import type { ThemeColors, ThemeColorTokens, UI } from '../types'

/** 品牌与状态默认值的唯一来源。SCSS 通过主题插件接收这些值。 */
export const DEFAULT_COLORS = {
  primary: '#66CCFF',
  accent: '#F6A5C0',
  success: '#34C759',
  warning: '#F5A524',
  danger: '#FF3B30',
  info: '#38BDF8',
} satisfies Required<ThemeColors>

const COLOR_ROLES = {
  solid: 'solid',
  solidHover: 'solid-hover',
  onSolid: 'on-solid',
  text: 'text',
  textHover: 'text-hover',
  muted: 'muted',
  soft: 'soft',
  softHover: 'soft-hover',
  borderSubtle: 'border-subtle',
  border: 'border',
  borderStrong: 'border-strong',
  focusRing: 'focus-ring',
} satisfies Record<keyof ThemeColorTokens, string>

const OPAQUE_ROLES = new Set(['solid', 'solidHover', 'onSolid', 'text', 'textHover', 'focusRing'])

function invalid(path: string, reason: string): never {
  throw new TypeError(`[lolimeow] themeConfig.${path}: ${reason}`)
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid(path, 'expected a configuration object')
  return value as Record<string, unknown>
}

function assertKeys(value: Record<string, unknown>, keys: string[], path: string) {
  for (const key of Object.keys(value)) {
    if (!keys.includes(key))
      invalid(`${path}.${key}`, `unknown option; supported keys: ${keys.join(', ')}`)
  }
}

/** 严格解析受支持的字面量，避免无效 Sass 与插值/代码注入；不接受 CSS 表达式。 */
function colorLiteral(value: unknown, path: string, opaque: boolean): string {
  if (typeof value !== 'string')
    return invalid(path, 'expected a hex, rgb() or hsl() color string')

  const raw = value.trim()
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(raw)) {
    const alpha = raw.length === 5 ? raw.slice(-1).repeat(2) : raw.length === 9 ? raw.slice(-2) : 'ff'
    if (opaque && alpha.toLowerCase() !== 'ff')
      invalid(path, 'this color must be opaque')
    return raw
  }

  const match = /^(rgba?|hsla?)\(([^()]*)\)$/i.exec(raw)
  if (!match)
    return invalid(path, 'use a hex, rgb() or hsl() literal; CSS variables and color names are not supported')

  const name = match[1]!.toLowerCase()
  const body = match[2]!.trim()
  const comma = body.includes(',')
  if (comma && body.includes('/'))
    return invalid(path, 'do not mix comma and slash color syntax')
  const parts = comma ? body.split(',').map(v => v.trim()) : body.split('/').map(v => v.trim())
  const channels = comma ? parts.slice(0, 3) : parts[0]!.split(/\s+/)
  const alpha = comma ? parts[3] : parts[1]
  if (channels.length !== 3 || (comma ? parts.length < 3 || parts.length > 4 : parts.length > 2))
    return invalid(path, 'expected three color channels and an optional alpha')

  const number = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:%|deg)?$/
  const values = [...channels, ...(alpha === undefined ? [] : [alpha])]
  if (values.some(v => !number.test(v)))
    return invalid(path, 'color channels must be numeric literals')

  const isHsl = name.startsWith('hsl')
  channels.forEach((channel, index) => {
    const numeric = Number.parseFloat(channel)
    const hue = isHsl && index === 0
    const percent = channel.endsWith('%')
    if (!Number.isFinite(numeric) || (hue ? percent : channel.endsWith('deg'))
      || (!hue && (numeric < 0 || numeric > (percent || isHsl ? 100 : 255)))
      || (isHsl && index > 0 && !percent)) {
      invalid(path, 'invalid channel unit or range')
    }
  })
  if (comma && !isHsl && channels.some(v => v.endsWith('%')) && !channels.every(v => v.endsWith('%')))
    invalid(path, 'comma-separated RGB channels must use the same unit')

  if (alpha !== undefined) {
    const opacity = Number.parseFloat(alpha) / (alpha.endsWith('%') ? 100 : 1)
    if (alpha.endsWith('deg') || !Number.isFinite(opacity) || opacity < 0 || opacity > 1 || (opaque && opacity !== 1))
      invalid(path, opaque ? 'this color must be opaque' : 'alpha must be between 0 and 1 (or 0% and 100%)')
  }

  // 统一序列化为 Sass 支持的现代语法；不把用户字符串直接当成 Sass 程序。
  return `${isHsl ? 'hsl' : 'rgb'}(${channels.join(' ')}${alpha === undefined ? '' : ` / ${alpha}`})`
}

function scssMap(entries: string[]): string {
  return `(${entries.join(', ')}${entries.length === 1 ? ',' : ''})`
}

/** 常用色配置与高级覆盖分开注入，明暗映射由 SCSS 在同一次编译中生成。 */
export function resolveThemeColorsScss(ui: UI = {}): string {
  const config = record(ui, 'ui')
  if ('primary' in config)
    invalid('ui.primary', 'removed; use ui.colors.primary instead')
  assertKeys(config, ['colors', 'tokens', 'toggleDarkBtn'], 'ui')

  const colors = config.colors === undefined ? {} : record(config.colors, 'ui.colors')
  assertKeys(colors, Object.keys(DEFAULT_COLORS), 'ui.colors')
  const colorEntries = Object.entries(DEFAULT_COLORS).map(([name, fallback]) =>
    `'${name}': ${colorLiteral(colors[name] === undefined ? fallback : colors[name], `ui.colors.${name}`, true)}`,
  )

  const tokens = config.tokens === undefined ? {} : record(config.tokens, 'ui.tokens')
  assertKeys(tokens, ['light', 'dark'], 'ui.tokens')
  const modeEntries = Object.entries(tokens).filter(([, mode]) => mode !== undefined).map(([mode, value]) => {
    const modePath = `ui.tokens.${mode}`
    const hues = record(value, modePath)
    assertKeys(hues, Object.keys(DEFAULT_COLORS), modePath)
    const hueEntries = Object.entries(hues).filter(([, hue]) => hue !== undefined).map(([name, value]) => {
      const path = `${modePath}.${name}`
      const roles = record(value, path)
      assertKeys(roles, Object.keys(COLOR_ROLES), path)
      return `'${name}': ${scssMap(Object.entries(roles).filter(([, color]) => color !== undefined).map(([role, color]) =>
        `'${COLOR_ROLES[role as keyof ThemeColorTokens]}': ${colorLiteral(color, `${path}.${role}`, OPAQUE_ROLES.has(role))}`,
      ))}`
    })
    return `'${mode}': ${scssMap(hueEntries)}`
  })

  return `$lm-theme-colors: ${scssMap(colorEntries)};\n$lm-theme-tokens: ${scssMap(modeEntries)};\n`
}
