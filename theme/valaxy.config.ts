import type { ThemeConfig } from './types'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig, generateSafelist, themePlugin } from './node'

const themeRoot = fileURLToPath(new URL('.', import.meta.url))
const workspaceRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [themePlugin(options)],
      resolve: {
        alias: [
          {
            find: '@theme',
            replacement: themeRoot,
          },
          {
            find: '@demo',
            replacement: resolve(workspaceRoot, 'demo'),
          },
        ],
      },
      optimizeDeps: {
        include: [
          '@braintree/sanitize-url',
          'dayjs/plugin/advancedFormat',
          'mermaid',
          '@mermaid-js/parser',
          'langium',
        ],
      },
      ssr: {
        noExternal: ['mermaid', '@mermaid-js/parser', 'langium'],
      },
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig as ThemeConfig),
    },
  }
})
