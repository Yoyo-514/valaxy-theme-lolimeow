// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    gitignore: true,
    unocss: true,
    formatters: true,
  },
  {
    ignores: [
      '**/*/.valaxy',
      '**/node_modules/**',
      'demo/.vite-ssg-dist/**',
      'demo/.vite-ssg-temp/**',
      'demo/temp/**',
      'demo/dist/**',
      'demo/dist-ssr/**',
      'demo/public/atom.xml',
      'demo/public/feed.json',
      'demo/public/feed.xml',
      'demo/public/valaxy-fuse-list.json',
    ],
  },
).override('antfu/typescript/parser', config => ({
  ...config,
  // TS-ESLint 8.71.1 的 unused 规则与 Espree 不兼容，脚本暂时复用 TS 解析器。
  // https://github.com/typescript-eslint/typescript-eslint/pull/12989
  files: [...(config.files ?? []), 'scripts/**/*.mjs'],
}))
