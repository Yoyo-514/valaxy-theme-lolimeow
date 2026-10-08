# Lolimeow：Valaxy theme skill 本地补充

本文件补充 `.agents/skills/valaxy-theme/` 的通用约定，不替代上游 skill。以下版本差异以 Valaxy `1.1.0`、`valaxy-addon-waline` `0.2.1` 和主题直接依赖的 `@waline/client` `3.16.0` 为依据。后续升级必须重新核对安装包的实现与导出，不能把临时限制当成永久框架契约。

## 源码分发与入口

- `theme/` 是源码发布包，`demo/` 是 workspace 消费者。新模块必须落在 `theme/package.json` 的 `files` 包含范围内；`features/`、`shared/` 也属于运行时源码。
- 本仓库的 Markdown 入口是 `theme/components/core/ValaxyMain.vue`，不是通用 skill 示例中的顶层路径。
- 保留 `ValaxyMd` 的渲染链路。大纲继续在独立子组件中使用 `useOutline()`，不要在 Markdown 父组件里重复订阅内容更新。
- `styles/index.ts` 是样式入口，避免从多个 setup 文件重复引入同一份样式。

## Valaxy 1.1 的组件封面

- 框架扫描 `components/covers/*.vue` 及其子目录，通过 `coverComponent` 和 `coverProps` 选择组件并传递参数。组件名称来自文件名，同一组件目录下不能重名。
- 主题通过 `ValaxyCover` 传递 `component`、`componentProps`、`src` 和 `context`，不自行维护另一份组件注册表。
- `LmPostCard` 的组件封面为 `context="card"`，使用 `inert` 和 `aria-hidden` 作为视觉预览。导航链接与封面是独立区域，不能把可能包含按钮的组件嵌入 `RouterLink`。
- 文章页使用 `context="page"`，标题和元信息置于组件封面之后，避免遮罩挡住交互。
- 普通图片仍由 `LmImage` 与 `usePostCardMediaState` 管理懒加载、超时和候选重试。组件封面走框架的静态图片回退，不要让图片超时逻辑误判组件状态。
- 浏览器 API 必须在挂载后使用；同时检查组件在 SSG 和水合时是否输出一致内容。
- `components/covers` 及其父目录必须在 dev 启动前就存在。实测：若 dev 启动后才创建该目录，封面虚拟模块仍保持启动时的空映射（组件名报 unknown），需要重启 dev。新增封面组件后请优先重启一次再排查代码。
- `ValaxyCover` 的分层语义：`src` 图片在底层，`component` 叠在上面，两者同时渲染；图片只在组件失败时露出。因此组件背景透明时图片会透出，这是作者自己的选择。
- 主题传入的 `src` 必须是**文章自己设置的** `cover`。列表卡片曾误用 `currentCover`（含主题自动补的随机/回退封面），结果组件内容被压在随机图片上；文章页与列表卡片现在都只使用作者封面。

## 脚注预览

- Valaxy 1.1 默认使用 Reka 弹层；`floating-vue` 是仍可显式选择的旧模式。
- 弹层传送到 `#valaxy-teleports`，不在文章的 DOM 子树内。样式入口是 `theme/styles/markdown/_footnotes.scss`，浮层覆盖使用独立的 `.va-footnote-popover.markdown-body` 等选择器。
- 复用主题的阅读背景、文字、阴影与焦点令牌；保留框架的可用宽高限制、碰撞检测、悬停预览、键盘和触屏交互，不重新实现弹层状态。

## 文章统计

- `wordCount` 与 `readingTime` 由 Valaxy 的统计钩子写入 frontmatter，钩子只在 `siteConfig.statistics.enable` 为真时执行，默认是 `false`（`1.0.0-rc.16` 与 `1.1.0` 一致）。
- 主题的「本文字数」「阅读时长」直接读取这两个字段，因此站点未开启 `statistics` 时头部不会展示它们。这是站点级选项，主题无法代为开启。
- 排查这类“以前有、现在没有”的问题时，先核对站点配置与构建产物中的 frontmatter，不要先改主题渲染逻辑。

## Waline 客户端与配置兼容

- `valaxy-addon-waline@0.2.1` 精确依赖旧客户端 `3.4.1`，并且发布包缺少根导出。不要只依据上游仓库源码就移除 demo 中针对根导出的类型说明；应以实际发布包为准。
- `LmWaline.vue` 从插件配置读取选项，进入文章时调用主题直接依赖的计数模块；靠近评论区才异步加载 `LmWalineClient.vue`。
- `LmWalineClient.vue` 直接使用主题的 `@waline/client/component` 和配套样式，不再调用插件内的旧 `WalineClient`。计数由外层负责，不在客户端包装层重复执行。
- `theme/features/comment/waline-options.ts` 保留插件的 `cdn`、`types`、`emoji` 语义：内置表情组与自定义目录合并，显式空 `types` 可关闭内置组。
- 评论外层按路由重新挂载，切页后重新计算计数路径与激活状态。**页面浏览计数只有 `LmWaline.vue` 一个所有者**，`LmWalineClient.vue` 不得再计数，否则会出现重复上报。
- 验证计数时，dev 一旦加载启用评论的文章就会向真实服务 POST 一次 `/api/article`；这是对外部服务的写入，需先获得授权，并只做最小次数的观察。
- demo 当前配置了线上评论服务。既有 `tests/browser/comment.spec.ts` 会触发浏览量 POST；未经授权不要运行它或浏览启用评论的文章。评论回归使用明确授权的测试服务，不伪造接口、不通过替换函数掩盖失败。
- Waline 组件的 props 类型比 `WalineInitOptions` 窄：`highlighter`、`imageUploader`、`texRenderer` 不收 `boolean` 形式（运行时支持），只能在绑定处按组件类型收口；`cdn`、`types` 要在绑定前剥掉，否则会变成 DOM 属性。

## Mermaid 插件适配

- `valaxy-addon-mermaid@0.1.1` 的根元素是 `figure.diagram-card`，旧内核的 `.mermaid` 已不存在。图表配色交给 `appearance` / `config`，主题只把 `--lm-*` 接到外壳变量 `--va-mermaid-*`；变量写在 `.markdown-body figure.diagram-card` 下才压得过插件的 scoped 样式。
- 外壳 accent 用 `--lm-c-primary-text`。插件按钮底色是 accent 混合 8%，直接拿 `-primary-base` 当强调色，浅色模式下对比只有 1.76:1（卡片底）/ 1.68:1（按钮底），过不了 WCAG。
- 图表调色做过又撤了：套主题色板反而更难认，固定 `theme` 还会让 `appearance` 失效。若重做：`color-mix()` 值在浏览器里是 `color(srgb … / a)`，Mermaid 解析不了，要先探针读 `color` 归一成 `rgb()`；setup 里访问 `document` 前加 SSR 守卫；不要从插件导入 helper 或类型，插件可选，会让未启用的站点构建失败。

## 依赖升级后的工程注意事项

- UnoCSS `66.10.5` 与 `magic-string@1.4.3` 曾造成 `@apply` 输出重复并阻断 CSS 构建。当前 workspace 对该精确版本覆盖为 `1.4.2`。重新升级时核对 UnoCSS issue `5373` / PR `5375` 及实际依赖解析结果，确认问题已修复再考虑移除，不能永久锁死后续版本。
- `eslint.config.mjs` 通过 composer 的 `override('antfu/typescript/parser', ...)` 将 `scripts/**/*.mjs` 纳入解析范围，解决升级后的 unused 误报；没有关闭检查规则。不要添加该版本不支持的顶层 `typescript.files` 配置。
- 仓库类型检查使用 `scripts/typecheck.mjs`。先生成 Valaxy 声明，再检查仓库自身诊断；不要把依赖源码的独立类型检查扩成当前任务阻断。
- CI 的 pnpm 版本与本机可能不同；Valaxy 使用 Git 日期时也依赖 checkout 历史深度。涉及工具链时单独核查，不在无关 UI 修改中顺带重写工作流。

## 按改动范围选择验证

以下是可选检查清单，不代表每次都要运行；先遵循用户对验证范围的要求。

- 开发预览：`pnpm dev`。组件封面与新版脚注示例位于 `/posts/component-cover`，该文章关闭了评论。
- 行为测试：`pnpm test`；静态检查：`pnpm lint`。
- SSG：`pnpm run build:demo`；生成声明后运行 `pnpm run typecheck`。SPA 构建不能替代 SSG 验证。
- 界面：同时检查桌面与窄屏、深浅色、Tab / Enter / Escape、返回首页的位置和控制台水合错误。不要只凭构建成功判定界面正常。
- 依赖或导出变更：打包后检查源码目录与依赖声明，再在独立消费者中安装归档构建，不能用 workspace 软链接代替发布包验证。
- 不默认运行整套浏览器测试：先处理上文的线上评论请求风险。汇报中区分代码已修改、检查已执行与用户待验事项。
