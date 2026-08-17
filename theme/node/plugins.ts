import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin, UserConfig } from 'vite'
import type { ThemeConfig } from '../types'

/**
 * valaxy 通过 `declare module 'vite'` 扩展了 `UserConfig.ssgOptions`，
 * 用户在 valaxy.config.ts 中可直接配置该字段；主题从这里派生类型以保持签名同步。
 */
export type LmSsgOptions = NonNullable<UserConfig['ssgOptions']>

/**
 * 移除 KaTeX 字体 preload 链接。
 *
 * valaxy 的 renderPreloadLinks 会把当前页面 SSR 模块图中的所有字体文件输出为
 * `<link rel="preload" as="font">`；由于 KaTeX 被框架无条件引入，每个页面
 * （包括没有任何公式的首页）都会预加载全部 KaTeX 字体（woff/woff2 约 40 个请求）。
 * 字体本应由 @font-face 按需加载，提前预加载只会抢占首屏带宽，因此按行过滤。
 *
 * 若未来 valaxy 移除 vite.ssgOptions 消费，本函数不再被调用，功能静默退化
 * （字体 preload 回归），不影响构建正确性。
 *
 * @param html - 当前页面渲染完成的 HTML。
 * @returns 过滤 KaTeX 字体 preload 后的 HTML。
 */
export function stripKaTeXFontPreloads(html: string): string {
  return html
    .split('\n')
    .filter((line) => {
      if (!line.includes('rel="preload"') || !line.includes('as="font"'))
        return true

      return !line.includes('KaTeX')
    })
    .join('\n')
}

/**
 * 创建主题的 SSG 页面后处理选项，并与用户站点的回调组合执行。
 *
 * valaxy 在构建前直接读取 vite 配置中的 `ssgOptions`，因此必须注入在
 * `defineTheme` 返回的 `vite.ssgOptions` 上，而不是 vite 插件的 `config()` hook
 * （后者在 valaxy 取值之后才执行，注入无效）。
 *
 * @param userSsgOptions - 用户站点 vite 配置中的 ssgOptions，仅用于组合 onPageRendered。
 * @returns 主题 ssgOptions；onPageRendered 会先调用用户回调，再执行主题过滤。
 */
export function createLmSsgOptions(userSsgOptions?: LmSsgOptions): LmSsgOptions {
  const userOnPageRendered = userSsgOptions?.onPageRendered

  return {
    onPageRendered: async (route: string, html: string) => {
      const userHtml = (await userOnPageRendered?.(route, html)) || html
      return stripKaTeXFontPreloads(userHtml)
    },
  }
}

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
              additionalData: `$lm-theme-primary: ${themeConfig.ui?.primary || '#66CCFF'} !default;\n`,
            },
          },
        },

        valaxy: {},
      }
    },

  }
}
