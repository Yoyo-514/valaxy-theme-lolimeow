import type { ResolveBackgroundOptions } from '../theme/features/background/resolve-background'
import { describe, expect, it } from 'vitest'
import { resolveBackground } from '../theme/features/background/resolve-background'

function resolve(options: Partial<ResolveBackgroundOptions> = {}) {
  return resolveBackground({ scope: 'app', background: {}, isDark: false, isMobile: false, ...options })
}

describe('background resolution', () => {
  it('falls back to the theme color for absent or empty sources', () => {
    for (const background of [{}, { type: 'image' as const, image: { urls: [' ', ''] } }, { type: 'gradient' as const }]) {
      expect(resolve({ background })).toMatchObject({
        type: 'color',
        source: 'fallback',
        colorValue: 'var(--lm-c-bg-base)',
        overlayOpacity: 0,
        rotationEnabled: false,
        fixed: true,
      })
    }
  })

  it('prefers ordered static images and preserves the input', () => {
    const background = { type: 'image' as const, image: { urls: [' ', ' /first.jpg ', '/second.jpg'], light: '/light.jpg', dark: '/dark.jpg' } }
    const original = structuredClone(background)
    expect(resolve({ background, isDark: true })).toMatchObject({
      imageUrl: '/first.jpg',
      fallbackImageUrl: '/first.jpg',
      staticImageUrls: ['/first.jpg', '/second.jpg'],
      fixed: true,
      overlayOpacity: 0.3,
      random: false,
      rotationEnabled: false,
      rotationInterval: 12000,
    })
    expect(background).toEqual(original)
  })

  it('uses the preferred color mode and then the alternate single image', () => {
    expect(resolve({ background: { type: 'image', image: { light: '/light', dark: '/dark' } }, isDark: true }).imageUrl).toBe('/dark')
    expect(resolve({ background: { type: 'image', image: { light: '/light' } }, isDark: true }).imageUrl).toBe('/light')
  })

  it('prefers random APIs while keeping a stable static fallback', () => {
    expect(resolve({ background: { type: 'image', image: { random: true, apiUrls: ['/api'], urls: ['/static'], rotationInterval: 5000 } } })).toMatchObject({
      imageUrl: '/api',
      fallbackImageUrl: '/static',
      rotationEnabled: true,
      rotationInterval: 5000,
    })
    expect(resolve({ background: { type: 'image', image: { random: true, apiUrls: ['/api'] } } })).toMatchObject({
      type: 'image',
      imageUrl: '/api',
      fallbackImageUrl: '',
      rotationEnabled: true,
    })
    expect(resolve({ background: { type: 'image', image: { random: true, urls: ['/only'] } } }).rotationEnabled).toBe(false)
    expect(resolve({ background: { type: 'image', image: { random: true, urls: ['/one', '/two'] } } }).rotationEnabled).toBe(true)
  })

  it('applies valid hero covers only in the hero scope', () => {
    const options = { background: { type: 'image' as const, image: { light: '/global' } }, heroCover: { desktop: '/desktop', mobile: '/mobile' } }
    expect(resolve({ ...options, scope: 'hero', isMobile: true })).toMatchObject({ source: 'hero', imageUrl: '/mobile', fixed: false })
    expect(resolve(options)).toMatchObject({ source: 'background', imageUrl: '/global' })
    expect(resolve({ ...options, scope: 'hero', heroCover: {} })).toMatchObject({ source: 'background', imageUrl: '/global' })
  })

  it('keeps gradient mode fallback and disables image effects', () => {
    expect(resolve({ background: { type: 'gradient', gradient: { light: 'light-gradient', dark: 'dark-gradient' } }, isDark: true })).toMatchObject({
      type: 'gradient',
      source: 'background',
      gradientValue: 'dark-gradient',
      colorValue: '',
      overlayOpacity: 0,
      rotationEnabled: false,
    })
    expect(resolve({ background: { type: 'gradient', gradient: { light: 'light-gradient' } }, isDark: true }).gradientValue).toBe('light-gradient')
  })

  it.each([[undefined, 0.3], [Number.NaN, 0.3], [-1, 0], [2, 1], [0, 0], [0.15, 0.15]])('clamps opacity %s to %s', (overlayOpacity, expected) => {
    expect(resolve({ background: { type: 'image', image: { light: '/image', overlayOpacity } } }).overlayOpacity).toBe(expected)
  })
})
