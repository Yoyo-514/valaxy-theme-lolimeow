<script lang="ts" setup>
import { useTemplateRef } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  /**
   * 首屏视口内的关键图片应设为 true 以 eager 加载；
   * 默认懒加载并降低抓取优先级，避免与首屏资源抢占带宽。
   */
  eager?: boolean
}>(), {
  alt: '',
  eager: false,
})

// 暴露内部 img 元素引用，供需要读取加载状态的场景（如文章卡片封面超时保护）使用。
const imgElement = useTemplateRef<HTMLImageElement>('imgElement')

defineExpose({
  el: imgElement,
})
</script>

<template>
  <img
    ref="imgElement"
    :src="props.src"
    :alt="props.alt"
    :width="props.width"
    :height="props.height"
    :loading="props.eager ? 'eager' : 'lazy'"
    :fetchpriority="props.eager ? undefined : 'low'"
    decoding="async"
  >
</template>
