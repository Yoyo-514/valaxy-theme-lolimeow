# 分页

分页配置由 `themeConfig.pagination` 控制，只负责文章列表加载方式。文章卡片展示请阅读 [文章列表](/config/post-list)。

## 标准分页

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    pagination: {
      type: 'standard',
      animation: true,
      itemsPerPage: 10,
    },
  },
})
```

## 无限滚动

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    pagination: {
      type: 'infinite-scroll',
      animation: true,
      itemsPerPage: 10,
      infiniteScrollOptions: {
        preload: true,
        threshold: 200,
      },
    },
  },
})
```

## 字段说明

| 字段                              | 说明                                          | 默认值       |
| --------------------------------- | --------------------------------------------- | ------------ |
| `type`                            | 分页类型，可选 `standard` / `infinite-scroll` | `'standard'` |
| `animation`                       | 是否启用加载动画                              | `true`       |
| `itemsPerPage`                    | 每页文章数量                                  | `10`         |
| `infiniteScrollOptions.preload`   | 是否预加载下一页                              | `true`       |
| `infiniteScrollOptions.threshold` | 距离底部多少 px 时触发加载                    | `200`        |

## 使用建议

- 文章数量较少时，标准分页更稳定
- 内容流较强的站点可以使用无限滚动
- 无限滚动更依赖客户端交互，部署前建议完整测试首页翻页行为

## 行为说明

### 滚动行为接管

主题会在 Router 上安装首页分页专用的滚动定位与历史恢复逻辑，并接管 `router.options.scrollBehavior`：

- 安装前的旧滚动行为会保留为非首页导航的委托目标；
- 主题安装之后，若用户站点配置或插件再次覆盖 `scrollBehavior`，会完全替换主题的接管逻辑，首页分页的滚动恢复将随之失效。

### 历史恢复状态

无限滚动已展开的页数会写入浏览器历史条目（`history.state` 中的主题私有字段，不重写整个 state）。若其他第三方库重写 `history.state`，该字段会丢失并自动回退到 Router 键降级策略，仅影响返回上一页时的滚动位置恢复。
