<h1 align="center">valaxy-theme-lolimeow</h1>

<pre align="center">一个轻二次元风格的 Valaxy 博客主题，适合安静地写日常、笔记与长文。</pre>

<p align="center">
  <img src="./docs/assets/example.png" alt="valaxy-theme-lolimeow preview">
</p>

<div align="center">
<table>
<tbody>
<tr>
<td align="center">
  <img width="2000" height="0" alt="" aria-hidden="true"><br>
  <span><b>简体中文 | <a href="./README.md">English</a></b></span><br>
  <sub>轻二次元氛围、柔和阅读平面、内置一言 Hero、本地搜索与有辨识度的聚合页。</sub><br>
  <sub><a href="https://lolimeow.yoyo514.top/">Live Demo</a></sub><br>
  <img width="2000" height="0" alt="" aria-hidden="true">
</td>
</tr>
</tbody>
</table>
</div>

## 快速开始

如果你是第一次使用 Valaxy，建议先阅读 [Valaxy 快速开始](https://valaxy.site/guide/getting-started)。

```bash
pnpm add valaxy-theme-lolimeow
```

```ts
import type { ThemeConfig } from 'valaxy-theme-lolimeow'
import { defineConfig } from 'valaxy'

export default defineConfig<ThemeConfig>({
  theme: 'lolimeow',

  themeConfig: {
    ui: {
      primary: '#66CCFF',
    },
  },
})
```

## 主题特色

### 分层二次元氛围

- 全局背景与 Hero 背景分开解析，支持静态图、图片池与随机图片 API。
- 背景切换带有 preload / decode 处理，减少切图时的突兀感。
- 柔和阅读平面贯穿文章、卡片、footer 与聚合页，让插图氛围保留在内容背后。

### Hero 一言场景

- 支持固定文案、本地轮播文案，也支持使用内置的一言 API 模式。
- 一言来源可显示为 `句子 —— 来源`，并支持配置句子类型与长度过滤。
- Hero 头图、作者信息、社交链接、滚动提示组合成一个完整首屏场景。

### 轻柔阅读交互

- 导航栏会随阅读滚动自动隐藏，并对锚点跳转、分页滚动做联动保护。
- 移动抽屉支持 uneven / classic 两种风格。
- 回顶 helper 与移动端目录位置偏向拇指可触达区域，适合插图背景下阅读。

### 本地搜索弹层

- 使用 Valaxy 生成的 Fuse 本地搜索数据。
- 搜索输入带防抖，支持键盘导航、加载态、空状态与错误态。
- 弹层视觉延续主题的柔和 surface，与抽屉、卡片和阅读面板保持一致。

### 聚合页

- 归档页使用时间线轨道，并在窄屏下切换为折叠形态。
- 分类页使用点击展开的树结构，适合分类逐渐变多后的浏览。
- 标签页使用胶囊式标签云，并按点击标签显示文章结果。
- 友链页支持前置 Markdown 说明、评论区，以及头像右下角的前端状态提示。

### 文章与评论

- 有图 / 无图文章头部保持一致的阅读节奏。
- Markdown 样式覆盖代码块、表格、媒体、脚注、容器和 Mermaid 示例。
- Waline 评论区已经按主题 surface 重新调整样式。

## 配置指引

下面的片段只用于快速上手，不是完整配置表。完整配置建议按这个顺序查看：

- [theme/types/config.d.ts](./theme/types/config.d.ts)：查看导出的 `ThemeConfig` 结构。
- [theme/node/config.ts](./theme/node/config.ts)：查看默认值和兜底行为。
- [demo/valaxy.config.ts](./demo/valaxy.config.ts)

提示：在 `valaxy.config.ts` 中导入 `ThemeConfig` 后，编辑器可以提供自动补全和悬浮提示。

### 背景与 Hero 头图

```ts
export default defineConfig<ThemeConfig>({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'image',
      image: {
        light: '/images/background-light.webp',
        dark: '/images/background-dark.webp',
        urls: ['/images/background-1.webp', '/images/background-2.webp'],
        apiUrls: ['https://www.dmoe.cc/random.php'],
        random: true,
        overlayOpacity: 0.3,
      },
    },
    hero: {
      cover: {
        urls: ['/images/hero-1.webp', '/images/hero-2.webp'],
        random: true,
      },
    },
  },
})
```

### 一言 Hero

通过 `themeConfig.hero.hitokoto` 同时控制展示与请求参数。

参考文档：https://developer.hitokoto.cn/sentence/#%E5%8F%A5%E5%AD%90%E7%B1%BB%E5%9E%8B-%E5%8F%82%E6%95%B0

```ts
import type { ThemeConfig } from 'valaxy-theme-lolimeow'
import { defineConfig } from 'valaxy'

export default defineConfig<ThemeConfig>({
  theme: 'lolimeow',
  themeConfig: {
    hero: {
      mottoSource: 'hitokoto',
      hitokoto: {
        showFrom: true,
        sentenceTypes: ['a', 'b', 'c'],
        minLength: 1,
        maxLength: 30,
      },
    },
  },
})
```

### Waline 评论

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

## 插件

| 插件                                                      | 用途   |
| --------------------------------------------------------- | ------ |
| [valaxy-addon-waline](https://github.com/walinejs/waline) | 评论区 |

## 开发

```bash
pnpm install
pnpm dev
```

```bash
pnpm demo
pnpm build
pnpm lint
pnpm typecheck
```

## 致谢

- [Valaxy](https://github.com/YunYouJun/valaxy)
- [Hitokoto](https://hitokoto.cn/)
- [Waline](https://github.com/walinejs/waline)

## License

[MIT License](./LICENSE) © Yoyo514
