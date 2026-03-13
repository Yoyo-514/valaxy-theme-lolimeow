---
title: Markdown
---

## Custom Containers

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## Tables

| Name     | Type      | Notes           |
| -------- | --------- | --------------- |
| Lolimeow | Theme     | Glassy style    |
| Valaxy   | Framework | Markdown render |

## Lists

- Primary item
  - Nested item
- Another item

1. First step
2. Second step

这是**强调**文本

## Divider

---

## Colored Diffs in Code Blocks

<!-- eslint-skip -->

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```
