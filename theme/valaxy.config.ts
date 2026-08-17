import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { createLmSsgOptions, defaultThemeConfig, generateSafelist, themePlugin } from './node'

export default defineTheme<ThemeConfig>((options) => {
  // 主题函数收到 options 时，options.config 已包含用户站点 valaxy.config.ts 的配置；
  // 用户可直接在 vite.ssgOptions 配置页面级后处理（valaxy 通过 declare module 'vite'
  // 扩展了 UserConfig 类型），主题读取后与自身回调组合执行，避免覆盖。
  const userSsgOptions = options.config.vite?.ssgOptions

  return {
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [themePlugin(options)],
      // valaxy 在构建前直接消费 vite.ssgOptions 做 SSG 页面级 HTML 后处理；
      // 必须注入在这里（插件的 config() hook 执行太晚，valaxy 已取值完毕）。
      ssgOptions: createLmSsgOptions(userSsgOptions),
      ssr: {
        noExternal: ['mermaid', '@mermaid-js/parser', 'langium'],
      },
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig as ThemeConfig),
    },
  }
})
