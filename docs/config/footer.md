# 页脚

页脚配置由 `themeConfig.footer` 控制，用于设置年份、图标、备案和 Powered by 信息。

## 基础配置

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      since: 2023,
      powered: true,
    },
  },
})
```

## 图标

页脚图标支持 Iconify 图标名。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icon: {
        enable: true,
        name: 'i-ri-heart-fill',
        animated: true,
        color: 'var(--lm-c-brand)',
      },
    },
  },
})
```

也可以使用图片。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icon: {
        enable: true,
        img: '/images/footer-icon.png',
        url: '/about/',
        title: 'About me',
      },
    },
  },
})
```

## 备案

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icp: {
        text: '萌ICP备XXXXXXXX号',
        link: 'https://icp.gov.moe/',
      },
    },
  },
})
```

字符串写法默认用于普通备案文本。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icp: '粤ICP备XXXXXXXX号',
    },
  },
})
```

## 字段说明

| 字段      | 说明                     | 默认值 |
| --------- | ------------------------ | ------ |
| `since`   | 建站年份                 | `2023` |
| `icon`    | 页脚图标配置             | -      |
| `powered` | 是否显示 Powered by 信息 | `true` |
| `icp`     | 备案信息                 | -      |
