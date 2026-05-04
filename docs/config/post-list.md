# 文章列表

文章列表配置由 `themeConfig.postList` 控制，只负责首页文章卡片展示。分页方式请阅读 [分页](/config/pagination)。

## 标题

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      title: 'Discovery',
    },
  },
})
```

## 封面策略

主题会按以下顺序解析文章卡片封面：

1. 文章 Frontmatter 中的 `cover`
2. `postList.coverApiUrls`，仅当 `coverRandom` 为 `true` 时启用
3. `postList.coverFallback`

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      coverFallback: [
        '/images/cover-1.webp',
        '/images/cover-2.webp',
      ],
      coverApiUrls: ['https://img.xjh.me/random_img.php?return=302'],
      coverRandom: true,
    },
  },
})
```

## 摘要

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      showExcerpt: true,
      excerptLength: 140,
    },
  },
})
```

## 列数与卡片宽度

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      maxColumns: 2,
      minCardWidth: '18rem',
    },
  },
})
```

## 字段说明

| 字段            | 说明                           | 默认值        |
| --------------- | ------------------------------ | ------------- |
| `title`         | 文章列表标题                   | `'Discovery'` |
| `imageReversed` | 有封面文章是否使用交错翻转布局 | `true`        |
| `coverFallback` | 本地或静态封面兜底列表         | `[]`          |
| `coverApiUrls`  | 远程随机封面源列表             | `[]`          |
| `coverRandom`   | 是否启用远程随机封面策略       | `false`       |
| `showExcerpt`   | 是否显示摘要                   | `true`        |
| `excerptLength` | 摘要长度                       | `140`         |
| `maxColumns`    | 最大列数                       | `1`           |
| `minCardWidth`  | 单张卡片最小宽度               | `'18rem'`     |
