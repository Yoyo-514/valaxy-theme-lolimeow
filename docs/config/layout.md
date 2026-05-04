# 布局配置

本页只说明 `themeConfig.layout`。如果你想指定某个 Markdown 页面使用哪个页面模板，请阅读 [页面 Frontmatter](/config/page-frontmatter)。

## 配置入口

`themeConfig.layout` 用于配置主题默认页面结构。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    layout: {
      general: {
        layout: 'double-columns',
        sidebar: {
          left: [],
          right: [],
        },
      },
      home: {
        layout: 'single-column',
      },
      post: {
        layout: 'double-columns',
        sidebar: {
          right: ['LmToc'],
        },
      },
    },
  },
})
```

## 页面类型

| 配置项    | 说明             |
| --------- | ---------------- |
| `general` | 全站默认布局策略 |
| `home`    | 首页布局策略     |
| `post`    | 文章页布局策略   |

## 布局类型

| 类型             | 说明                                 |
| ---------------- | ------------------------------------ |
| `single-column`  | 单列布局，适合首页和内容聚焦页面     |
| `double-columns` | 双列布局，适合文章页和带目录的页面   |
| `triple-columns` | 三列布局，适合需要更多侧栏模块的页面 |

## 侧栏配置

`sidebar.left` 和 `sidebar.right` 用于配置左右侧栏模块顺序。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    layout: {
      post: {
        layout: 'double-columns',
        sidebar: {
          left: [],
          right: ['LmToc'],
        },
      },
    },
  },
})
```

## 文章目录

文章页默认右侧使用 `LmToc` 显示目录。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    layout: {
      post: {
        sidebar: {
          right: ['LmToc'],
        },
      },
    },
  },
})
```

## 使用建议

- 首页通常使用 `single-column`
- 文章页通常使用 `double-columns` 并在右侧放置 `LmToc`
- 如果没有明确侧栏内容，不建议使用 `triple-columns`
