import type { KnipConfig } from 'knip'
import { parse } from 'vue/compiler-sfc'

export default {
  tags: ['-@internal'],
  // 上游仅提供 types 条件的入口，TypeScript 可解析，Knip 的运行时解析器会误报。
  ignoreUnresolved: ['vite-plugin-vue-layouts-next/client'],
  compilers: {
    '.vue': (source: string) => {
      const { descriptor } = parse(source)
      return [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n')
    },
  },
  workspaces: {
    '.': {
      entry: ['scripts/*.mjs', 'tests/**/*.ts', '*.config.{ts,mjs}'],
      project: ['scripts/**/*.mjs', 'tests/**/*.{ts,vue}', '*.config.{ts,mjs}'],
    },
    'theme': {
      // Valaxy 自动发现组件、布局、页面和 setup；公开入口供站点消费。
      entry: ['valaxy.config.ts', 'components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'styles/index.ts'],
      project: ['**/*.{ts,vue}'],
      ignoreDependencies: ['valaxy-addon-waline'],
    },
    'demo': { entry: ['*.config.ts', 'pages/**/*.vue'], project: ['*.ts', '**/*.vue'], ignoreDependencies: ['@iconify-json/ri'] },
    'docs': { project: ['.vitepress/**/*.{ts,vue}'] },
  },
} satisfies KnipConfig
