# 评论与插件

Lolimeow 保持 Valaxy 的插件机制。评论服务建议通过 Valaxy addon 接入。

## 启用站点评论

先在 `site.config.ts` 中启用评论：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  comment: {
    enable: true,
  },
})
```

## 使用 Waline

安装插件：

```bash
pnpm add valaxy-addon-waline
```

在 `valaxy.config.ts` 中配置：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  theme: 'lolimeow',
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-server',
      pageview: true,
      comment: true,
      login: 'force',
      requiredMeta: ['nick', 'mail'],
    }),
  ],
})
```

## 使用 Mermaid

Valaxy 从 `1.0.0-rc.16` 起将 Mermaid 拆为可选插件。需要图表的站点安装并启用插件；不使用图表的站点无需安装。

```bash
pnpm add valaxy-addon-mermaid
```

在站点 `valaxy.config.ts` 的 `addons` 中加入 `addonMermaid()`，保留已有插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonMermaid } from 'valaxy-addon-mermaid'

export default defineValaxyConfig({
  theme: 'lolimeow',
  addons: [addonMermaid()],
})
```

原有的 `mermaid` 代码块无需修改。只升级 Valaxy、未启用插件时，图表会显示为源码。

插件在图表组件挂载后动态加载 Mermaid，普通页面无需加载渲染器，SSG 也不会初始化它。图表文章中的图表会在页面挂载时开始渲染，并非滚动进入视口后才加载。主题不再强制预构建或内联 Mermaid 及其解析依赖。

默认提供放大查看、缩放和平移，详见 [官方 Mermaid 插件说明](https://valaxy.site/addons/official/mermaid)。

## SSR 兼容注意事项

插件通常依赖浏览器环境。建议优先使用 Valaxy addon 的官方接入方式，不要在主题配置文件顶层直接访问浏览器 API。

如果后续添加自定义组件，请避免在模块顶层访问：

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- 浏览器专属 DOM API

需要访问时，放到客户端生命周期内，或使用对应框架提供的客户端限定能力。

## 插件建议

- 评论服务应先在独立服务端完成部署和验证
- 本地开发时可以先关闭评论，只验证页面构建
- 生产环境建议配置评论服务的安全域名和反垃圾策略
