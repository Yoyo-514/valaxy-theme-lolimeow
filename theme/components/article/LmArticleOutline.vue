<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useArticleTocSource } from '../../features/article/toc-context'
import { useArticleTocState } from '../../features/article/use-article-toc-state'

const source = useArticleTocSource()
source.value = useArticleTocState()
onBeforeUnmount(() => {
  source.value = undefined
})
</script>

<template>
  <!-- 独立持有 Valaxy 大纲的更新钩子，不包裹 Markdown 内容。 -->
  <slot />
</template>
