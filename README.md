# Valaxy Theme Lolimeow

`valaxy-theme-lolimeow` is a custom [Valaxy](https://valaxy.site/) theme built around anime-style background imagery and a reading-first layout.

The theme focuses on three things:

- customizable and randomizable background imagery
- a lightweight anime-inspired visual atmosphere
- readable article pages on desktop and mobile
- a maintainable structure for continued theme iteration

## Features

### Home page

- Configurable global background with light/dark images, image pools, and random API sources
- Separate hero cover runtime, so the landing section can use a different image strategy from the rest of the site
- Anime-inspired visual tone kept behind a restrained reading surface instead of turning the page into a wallpaper showcase
- Home feed, pinned entries, and infinite pagination arranged around that background-first presentation

### Article pages

- Cover and non-cover article headers that adapt to illustration-heavy posts without breaking reading width
- Reading layer tuned to keep long-form content usable on top of dynamic, semi-transparent anime-style backgrounds
- Desktop TOC and mobile TOC implemented as lightweight reading aids, not documentation-style control panels
- Markdown styling focused on practical blog content such as code blocks, tables, media embeds, footnotes, and custom blocks

### Comments

- Waline integration through `valaxy-addon-waline`
- Twikoo integration through `valaxy-addon-twikoo`
- Comment rendering resolved from enabled addons instead of a separate theme-only provider convention

### Theme infrastructure

- Background runtime with static image, random rotation, API fallback, preload, and decode handling
- Auto-hide navbar, mobile drawer, and helper interactions tuned for background-rich reading pages
- Search modal shell ready for search provider integration
- Shared design tokens, SCSS mixins, and composable-driven UI state

## Repository structure

```txt
.
├─ demo/                  Demo site used for development and regression checks
├─ temp/                  Working design and architecture notes
├─ theme/
│  ├─ components/         Theme components
│  ├─ composables/        Theme state and interaction logic
│  ├─ styles/             Theme tokens and global styles
│  ├─ utils/              Shared helper utilities
│  ├─ client/             Client entry
│  ├─ node/               Node entry
│  └─ valaxy.config.ts    Theme-side Valaxy configuration
├─ package.json           Workspace scripts
└─ pnpm-workspace.yaml    Workspace definition
```

## Development

This repository uses `pnpm` workspace.

Install dependencies:

```bash
pnpm install
```

Start the demo site:

```bash
pnpm demo
```

Run the default development command:

```bash
pnpm dev
```

Build the demo site:

```bash
pnpm build
```

Lint the repository:

```bash
pnpm lint
```

Type-check the repository:

```bash
pnpm typecheck
```

## Using the theme

When the theme package is available in your Valaxy project, enable it in your config:

```ts
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'lolimeow',
})
```

Theme-specific options are provided through `themeConfig`. The demo site contains the most complete reference for current usage:

- [demo/valaxy.config.ts](./demo/valaxy.config.ts)

## Comment integration

The theme does not define its own `comment.provider` field.

Current behavior:

- the article page comment area is rendered only when `siteConfig.comment.enable !== false`
- page-level comments can be disabled with `frontmatter.comment === false`
- if `valaxy-addon-waline` is enabled, Waline is used
- otherwise, if `valaxy-addon-twikoo` is enabled, Twikoo is used

Example addon setup:

```ts
import { defineConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineConfig({
  siteConfig: {
    comment: {
      enable: true,
    },
  },
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-server',
    }),
  ],
})
```

## Demo pages

The demo site includes several pages intended for manual regression checks:

- [demo/pages/posts/demo.md](./demo/pages/posts/demo.md): comprehensive Markdown showcase
- [demo/pages/posts/markdown.md](./demo/pages/posts/markdown.md): general Markdown examples
- [demo/pages/posts/mermaid.md](./demo/pages/posts/mermaid.md): Mermaid examples
- [demo/pages/posts/i18n.md](./demo/pages/posts/i18n.md): i18n-related checks

## Status

- [x] Home page
- [x] Article reading layer
- [x] Comment integration
- [x] First-pass Markdown theming
- [ ] Archive page
- [ ] Category page
- [ ] Tag page
- [ ] Links page
- [ ] Search provider and result experience

## Acknowledgements

- [Valaxy](https://github.com/YunYouJun/valaxy)
- [vuejs/blog](https://github.com/vuejs/blog)
- [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)
