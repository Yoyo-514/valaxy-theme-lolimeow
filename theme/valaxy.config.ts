import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig, generateSafelist, themePlugin } from './node'

export default defineTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    router: {
      extendRoute(route) {
        // Valaxy 会为分页路由自动注入 home 布局；分页页自身还需在 Home 与 404
        // 布局之间同步分派，因此关闭外层自动布局，避免公共 Layout 与 footer 重复。
        if (route.fullPath === '/page' || route.fullPath.startsWith('/page/')) {
          route.addToMeta({
            layout: false,
          })
        }
      },
    },
    vite: {
      plugins: [themePlugin(options)],
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
