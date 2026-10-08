# 页面 Frontmatter

页面 Frontmatter 用于控制单个 Markdown 页面的元信息，例如页面模板、标题、封面、评论开关等。

本文列出 Lolimeow 实际使用的字段，以及由 Valaxy 处理的元信息。框架能解析某个字段，并不代表主题一定提供对应的界面。

## 基础写法

```md
---
title: 文章标题
date: 2026-01-01
categories:
  - Notes
tags:
  - Valaxy
cover: /images/cover.webp
---
```

## 通用页面字段

| 字段              | 类型                                    | 说明                                               |
| ----------------- | --------------------------------------- | -------------------------------------------------- |
| `title`           | `string` / `Record<string, string>`     | 页面标题                                           |
| `date`            | `string` / `number` / `Date`            | 创建日期                                           |
| `updated`         | `string` / `number` / `Date`            | 更新日期                                           |
| `path`            | `string`                                | 自定义路径                                         |
| `lang`            | `string`                                | 页面语言                                           |
| `author`          | `string`                                | 页面作者                                           |
| `cover`           | `string`                                | 封面图片                                           |
| `ogImage`         | `string`                                | Open Graph 图片                                    |
| `comment`         | `boolean`                               | 是否显示评论                                       |
| `outline`         | `false` / `number` / `[number, number]` | Valaxy 大纲范围；主题最多展示前两级                |
| `markdownClass`   | `string`                                | 自定义 Markdown 内容类名，建议保留 `markdown-body` |
| `katex`           | `boolean`                               | 是否启用 KaTeX                                     |
| `codepen`         | `boolean`                               | 是否启用 CodePen 支持                              |
| `medium_zoom`     | `boolean`                               | 是否启用图片缩放                                   |
| `codeHeightLimit` | `number`                                | 限制代码块高度，单位 px                            |
| `from`            | `string` / `string[]`                   | 客户端重定向源路径                                 |

## 文章字段

| 字段           | 类型                                  | 说明                         |
| -------------- | ------------------------------------- | ---------------------------- |
| `categories`   | `string` / `string[]`                 | 分类，数组可表示多级分类     |
| `tags`         | `string[]`                            | 标签                         |
| `excerpt`      | `string`                              | 手动指定摘要                 |
| `excerpt_type` | `'md'` / `'text'` / `'html'` / `'ai'` | 摘要渲染类型                 |
| `nav`          | `boolean`                             | 是否显示上一篇 / 下一篇导航  |
| `top`          | `number`                              | 置顶权重，数字越大越靠前     |
| `draft`        | `boolean`                             | 是否为草稿，通常仅开发时展示 |
| `hide`         | `'index'` / `boolean`                 | 是否隐藏文章                 |

## 组件封面

从 Valaxy `1.1.0` 起，文章可以用 Vue 组件作为封面。将组件放到站点的 `components/covers/` 目录，例如 `ReadingCover.vue`：

```yaml
coverComponent: ReadingCover
coverProps:
  heading: 留一点时间，慢慢读。
cover: /images/cover.webp
```

- `coverComponent` 是组件文件名，不含 `.vue`；`coverProps` 会作为属性传入组件。
- 组件会收到 `context: 'card' | 'page'` 和 `src`（`cover` 图片地址）。
- 列表卡片中的组件只作视觉预览，不接受鼠标和键盘交互。请只在 `context === 'page'` 时显示按钮等控件。
- 文章页将组件封面与标题、元信息分开展示，不会用标题遮罩挡住组件的交互区域。
- `cover` 可选。图片渲染在组件**下层**：正常时由组件盖住，组件加载或渲染失败时露出图片作为回退；两者会同时存在，所以组件背景建议用不透明或与图片协调的底色。
- 列表卡片只把文章自己设置的 `cover` 当作底层图片，不会把主题按配置补充的随机封面叠在组件下面；未设置 `cover` 时卡片只有组件本身。
- 未设置 `coverComponent` 时，继续使用原有图片封面与列表图片重试逻辑。

组件需要支持服务端渲染，浏览器 API 请放在挂载后使用。示例见演示站的「组件封面与脚注预览」。

## 页面 layout

`layout` 用于指定当前 Markdown 页面使用哪个页面模板。

| layout       | 用途               | 常见路径                    |
| ------------ | ------------------ | --------------------------- |
| `post`       | 文章页             | `pages/posts/*.md`          |
| `about`      | 关于页             | `pages/about/index.md`      |
| `archives`   | 归档页             | `pages/archives/index.md`   |
| `categories` | 分类页             | `pages/categories/index.md` |
| `tags`       | 标签页             | `pages/tags/index.md`       |
| `links`      | 友链页             | `pages/links/index.md`      |
| `projects`   | 项目页             | `pages/projects/index.md`   |
| `404`        | 404 页面           | `pages/404/index.md`        |
| `default`    | 普通 Markdown 页面 | 任意普通页面                |

## 关于页

```md
---
layout: about
title: 关于
description: 这里是关于页描述
cover: /images/about-cover.webp
---

这里可以写个人介绍、项目说明或普通 Markdown 内容。
```

## 友链页

```md
---
layout: links
title: 友链
cover: /images/links-cover.webp
comment: true
---

这里可以写友链申请说明。
```

## 归档页

归档按站点 `timezone` 统一解析年份、月份和展示日期，日期缺失或无效的文章保留在「未标注年份」。点击年份展开，再次点击收起；桌面保留年份轴与侧边面板，年份轴随长列表吸顶，窄屏在年份下方展开月份和文章。

```md
---
layout: archives
title: 归档
cover: /images/archives-cover.webp
---
```

## 分类页

```md
---
layout: categories
title: 分类
cover: /images/categories-cover.webp
---
```

## 标签页

```md
---
layout: tags
title: 标签
cover: /images/tags-cover.webp
---
```

## 404 页面

Lolimeow 内置了 `404` 布局。若你希望 GitHub Pages、Cloudflare Pages 等静态托管平台使用主题 404 页面，需要在站点侧添加实际页面：

```md
---
layout: 404
---
```

重新构建后，确认产物根目录存在 `404.html`。静态托管平台通常会读取这个文件作为自定义 404 页面。

## 加密相关字段

Valaxy 支持加密相关 Frontmatter 字段，是否可用取决于你的站点配置和插件能力。

| 字段               | 类型      | 说明         |
| ------------------ | --------- | ------------ |
| `encrypt`          | `boolean` | 是否启用加密 |
| `password`         | `string`  | 加密密码     |
| `password_hint`    | `string`  | 密码提示     |
| `gallery_password` | `string`  | 相册密码     |

## 主题支持边界

Lolimeow 没有实现 `aside`、`sidebar`、`pageTitleClass`、`postTitleClass`、`time_warning`，也没有按文章 `type` 或 `url` 切换卡片的行为。需要扩展时请覆盖对应组件，而不要依赖这些 Frontmatter 字段。

## 相册与集合字段

这些字段通常用于相册、图库或集合类页面，是否展示取决于主题或插件支持。

| 字段          | 类型                 | 说明     |
| ------------- | -------------------- | -------- |
| `albums`      | `Album[]`            | 相册列表 |
| `photos`      | `Photo[]`            | 图片列表 |
| `collections` | `CollectionConfig[]` | 集合配置 |

## 更多字段

Frontmatter 是 Valaxy 的通用能力。更多字段、自动生成字段与插件扩展字段，请参考 [Valaxy 文档](https://valaxy.site/guide/config)。
