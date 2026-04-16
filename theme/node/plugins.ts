import type { ThemeConfig } from '@theme/types'
import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'

// write a vite plugin
// https://vitejs.dev/guide/api-plugin.html
export function themePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const themeConfig = options.config.themeConfig || {}

  return {
    name: 'valaxy-theme-lolimeow',

    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `$c-primary: ${themeConfig.ui?.primary || '#66CCFF'} !default;`,
            },
          },
        },

        valaxy: {},
      }
    },
  }
}
