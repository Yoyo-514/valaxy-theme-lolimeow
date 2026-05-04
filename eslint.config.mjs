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
      '**/scripts/**',
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
)
