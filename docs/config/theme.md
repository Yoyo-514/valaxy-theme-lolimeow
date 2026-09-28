# 主题配置总览

Lolimeow 的主题配置写在 `valaxy.config.ts` 的 `themeConfig` 中。

## 配置入口

```ts
import type { ThemeConfig } from 'valaxy-theme-lolimeow'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      colors: {
        primary: '#66CCFF',
      },
    },
  },
})
```

## 配置模块

| 配置项          | 说明                                            | 文档                          |
| --------------- | ----------------------------------------------- | ----------------------------- |
| `ui`            | 基础 UI 配色与按钮图标                          | 本页                          |
| `background`    | 全局背景，支持图片、图片池、随机图片 API 与渐变 | [背景](/config/background)    |
| `hero`          | 首页首屏文案、封面、一言与打字机效果            | [Hero](/config/hero)          |
| `navbar`        | 导航菜单项                                      | [导航栏](/config/navbar)      |
| `navbarOptions` | 导航栏标题、工具按钮、移动端菜单和自动隐藏      | [导航栏](/config/navbar)      |
| `notice`        | 站点公告                                        | [公告](/config/notice)        |
| `pinned`        | 首页置顶卡片                                    | [置顶卡片](/config/pinned)    |
| `projects`      | 项目展示页                                      | [项目展示](/config/projects)  |
| `postList`      | 首页文章列表与封面策略                          | [文章列表](/config/post-list) |
| `pagination`    | 标准分页或无限滚动                              | [分页](/config/pagination)    |
| `links`         | 友链分组与可访问性状态提示                      | [友链](/config/links)         |
| `footer`        | 页脚年份、图标、备案与 Powered by 信息          | [页脚](/config/footer)        |

## UI 色板

所有 UI 配色项均可省略，默认使用天依蓝。`ui.colors` 选择品牌与状态颜色，`ui.tokens.light/dark` 按用途覆盖明暗模式。普通用户只需要配置 `colors`。

主题分为基础值、语义角色、组件用途三层：基础色阶在 OKLCH 空间生成；组件使用文字、实心填充、轻量背景、边框等语义变量。默认天依蓝的文字色单独调校，自定义色依据默认背景计算可读的文字色，不固定绑定某个数字色阶。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      colors: {
        primary: '#66CCFF', // 品牌原色（天依蓝）
        accent: '#F6A5C0', // 次强调色，少量点缀
        success: '#34C759',
        warning: '#F5A524',
        danger: '#FF3B30',
        info: '#38BDF8', // 状态色独立于 primary
      },
    },
  },
})
```

| 字段      | 默认值    | 说明                               |
| --------- | --------- | ---------------------------------- |
| `primary` | `#66CCFF` | 品牌原色                           |
| `accent`  | `#F6A5C0` | 次强调色，用于关于页头像边框与底色 |
| `success` | `#34C759` | 成功状态                           |
| `warning` | `#F5A524` | 警告状态                           |
| `danger`  | `#FF3B30` | 危险状态                           |
| `info`    | `#38BDF8` | 信息状态                           |

### 按用途覆盖明暗模式

覆盖优先级为：内置默认 → 用户颜色派生结果 → 用户明暗语义覆盖。只覆盖填写的字段，其他色系和另一种模式保持各自的结果。下面的示例只改变浅色模式的主色文字与悬停：

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      colors: {
        primary: '#66CCFF',
      },
      tokens: {
        light: {
          primary: {
            text: '#0076A8',
            textHover: '#00658F',
          },
        },
      },
    },
  },
})
```

`primary`、`accent`、`success`、`warning`、`danger`、`info` 均支持相同的语义字段。配置采用 camelCase，CSS 变量采用 kebab-case：

| 配置字段                                   | CSS 变量后缀                                    | 用途                 |
| ------------------------------------------ | ----------------------------------------------- | -------------------- |
| `solid` / `solidHover`                     | `-solid` / `-solid-hover`                       | 实心填充及悬停       |
| `onSolid`                                  | `-on-solid`                                     | 实心填充上的文字     |
| `text` / `textHover`                       | `-text` / `-text-hover`                         | 强调文字、链接及悬停 |
| `muted` / `soft` / `softHover`             | `-muted` / `-soft` / `-soft-hover`              | 由弱到强的半透明背景 |
| `borderSubtle` / `border` / `borderStrong` | `-border-subtle` / `-border` / `-border-strong` | 边框层次             |
| `focusRing`                                | `-focus-ring`                                   | 键盘焦点轮廓         |

完整变量名例如 `--lm-c-primary-text-hover`。品牌原色始终为 `--lm-c-primary-base`，由 `colors.primary` 配置；`tokens` 不改变它。`--lm-c-<name>-50` 至 `-950` 是内部基础色阶，常规定制建议覆盖语义用途。

覆盖 `solid` 时，未指定的 `solidHover` 与 `onSolid` 会依据最终填充重新计算。覆盖 `text` 时，未指定的 `textHover` 与 `focusRing` 会随之派生。显式配置的值不会被自动改写。

::: tip 对比度与玻璃背景
默认文字色依据 `#F2F2F7` / `#0B0B10` 背景调校；自动派生会检查文字及实心填充配对的对比度。高级覆盖若低于 4.5:1 会在构建时提示，仍保留用户指定的值。背景图片、玻璃透明度与自定义 CSS 会改变实际合成颜色，需在实际页面上检查。
:::

### 颜色格式与错误提示

支持 `#RGB`、`#RGBA`、`#RRGGBB`、`#RRGGBBAA` 以及数字形式的 `rgb()` / `rgba()` / `hsl()` / `hsla()`。支持逗号和现代空格语法、百分比及 HSL 的 `deg` 色相。基色、文字、实心填充与焦点色必须不透明；轻量背景与边框可带透明度。

不接受颜色名、`var()`、`calc()`、`oklch()` 等表达式。非法值与未知字段会停止构建，并给出完整路径，例如 `themeConfig.ui.tokens.light.primary.text`，不会悄悄回退。省略字段才使用默认值。

### 从旧版迁移（breaking change）

- `ui.primary` → `ui.colors.primary`，默认原色仍为 `#66CCFF`。
- `$lm-theme-primary` 已移除；编译期改为 `$lm-theme-colors` 与 `$lm-theme-tokens`，建议通过公开的 `ui` 配置调整。

## Vite 配置注入

主题会在构建时向 vite 配置注入以下内容，均与用户站点配置组合而非覆盖：

- **SCSS 变量**：注入 `$lm-theme-colors` 与 `$lm-theme-tokens`。字符串形式的 `css.preprocessorOptions.scss.additionalData` 接在主题声明之后；函数形式接收带主题声明的源代码及原文件名，保留异步返回和 source map。
- **SSG 页面后处理**：注入 `vite.ssgOptions.onPageRendered`，在构建产物中移除 KaTeX 字体 preload（数学字体改由浏览器按需加载，避免无公式页面也预加载全部公式字体）。若用户配置了 `vite.ssgOptions.onPageRendered`，主题会先调用用户回调再执行过滤。

## 工具按钮图标

可以为明暗切换按钮指定图标。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      toggleDarkBtn: {
        lightIcon: 'i-ri-sun-line',
        darkIcon: 'i-ri-moon-line',
      },
    },
  },
})
```

## 默认值来源

品牌与状态默认色集中在 `theme/node/colors.ts`；其余主题默认配置定义在 `theme/node/config.ts`。语义色派生位于 `theme/styles/palette.scss`，中性色、间距、圆角及阴影位于 `theme/styles/vars.scss`。
