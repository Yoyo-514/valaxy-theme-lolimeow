# 快速开始

本页提供从创建 Valaxy 项目到启用 Lolimeow 的最短路径。更完整的安装说明见 [安装](/guide/installation)。

## 创建项目时选择主题

推荐在创建 Valaxy 项目时直接选择 Lolimeow。

```bash
pnpm create valaxy
```

在选择 Blog 类型后，主题选择处选择 `Custom`，然后输入：

```text
valaxy-theme-lolimeow
```

`create valaxy` 会自动配置 `valaxy.config.ts` 中的 `theme` 字段，并在 `package.json` 中添加主题依赖。

## 已有项目安装主题

如果你已经有 Valaxy 项目，可以手动安装主题：

::: code-group

```bash [pnpm]
pnpm add valaxy-theme-lolimeow
```

```bash [npm]
npm install valaxy-theme-lolimeow
```

```bash [yarn]
yarn add valaxy-theme-lolimeow
```

:::

## 启用主题

在 `valaxy.config.ts` 中启用主题：

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      primary: '#66CCFF',
    },
  },
})
```

主题名称来自包名 `valaxy-theme-lolimeow`，因此 `theme` 填写 `lolimeow`。

## 配置时区

建议在 `site.config.ts` 中显式指定 `timezone`。若服务端构建环境与客户端浏览器时区不同，文章日期等时间内容可能出现 SSR 水合不一致。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  timezone: 'Asia/Shanghai',
})
```

## 启动开发服务器

::: code-group

```bash [pnpm]
pnpm dev
```

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

:::

访问终端输出的本地地址即可预览主题。

## 下一步

- 阅读 [基础配置](/guide/configuration)
- 配置 [站点信息](/config/site)
- 查看 [主题配置总览](/config/theme)
- 参考 [背景](/config/background)
- 参考 [Hero](/config/hero)
- 配置 [导航栏](/config/navbar)
- 配置 [布局配置](/config/layout)
- 查看 [页面 Frontmatter](/config/page-frontmatter)
