<script setup lang="ts">
import { useFrontmatter, useRuntimeConfig, useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent } from 'vue'

type CommentProvider = 'waline'

const WalineComment = defineAsyncComponent(() => import('@theme/components/plugins/LmWaline.vue'))

// 已废弃：Twikoo 集成已停止维护，保留组件文件仅用于迁移说明，不再参与运行时分发。
// const TwikooComment = defineAsyncComponent(() => import('@theme/components/plugins/LmTwikoo.vue'))

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const runtimeConfig = useRuntimeConfig()

const provider = computed<CommentProvider | ''>(() => {
  if (runtimeConfig.value.addons?.['valaxy-addon-waline'])
    return 'waline'

  // 已废弃：Twikoo 分支保留为历史注释，当前主题仅支持 Waline。
  // if (runtimeConfig.value.addons?.['valaxy-addon-twikoo'])
  //   return 'twikoo'

  return ''
})

const enabled = computed(() => {
  return siteConfig.value.comment?.enable !== false
    && frontmatter.value.comment !== false
    && !!provider.value
})

const providerComponent = computed(() => {
  if (provider.value === 'waline')
    return WalineComment

  // 已废弃：Twikoo 组件不再参与评论渲染分发。
  // if (provider.value === 'twikoo')
  //   return TwikooComment

  return null
})
</script>

<template>
  <section
    v-if="enabled"
    class="lm-comment comment"
    aria-label="评论区"
  >
    <div class="lm-comment__content">
      <div class="lm-comment__body">
        <component :is="providerComponent" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.lm-comment {
  @apply w-full px-4 pt-6 sm:px-6 xl:px-0;
}

.lm-comment__content {
  @apply w-full border-t pt-4;
  border-color: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
}

.lm-comment__body {
  @apply w-full;
}
</style>
