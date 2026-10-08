---
title: 组件封面与脚注预览
date: 2026-01-02
categories: 示例
tags:
  - Valaxy
coverComponent: ReadingCover
coverProps:
  heading: 留一点时间，慢慢读。
comment: false
---

组件封面可以展示自己的 Vue 内容。首页卡片只显示预览，进入文章后，可以用封面上的按钮切换配色。[^cover]

<!-- more -->

## 使用组件封面

将 Vue 文件放入站点的 `components/covers/` 目录，然后在文章 Frontmatter 中填写组件名：

```yaml
coverComponent: ReadingCover
coverProps:
  heading: 留一点时间，慢慢读。
```

组件会收到 `context` 属性：列表中为 `card`，文章中为 `page`。列表预览不接收点击和键盘焦点，请把交互控件放在 `page` 模式中。也可以同时设置 `cover`，作为组件不可用时的静态图片。

## 阅读脚注

鼠标悬停脚注编号可以预览注释；键盘和触屏用户可以使用编号旁的预览按钮。打开预览后，按 Escape 或点击关闭按钮回到正文。[^reading]

[^cover]: 组件封面由 Valaxy 1.1 提供。标题、日期与分类仍由主题展示，不需要在组件中重复实现。

[^reading]: 脚注里也可以包含 **强调**、`行内代码` 和 [Valaxy 文档](https://valaxy.site/)。这段较长的说明用于展示窄屏中的换行，预览应保持在屏幕内，不影响正文阅读。
