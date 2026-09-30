<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { useAddonConfig, useFrontmatter, useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

type CommentProvider = 'waline'

const WalineComment = defineAsyncComponent(() => import('../components/plugins/LmWaline.vue'))

const { t } = useI18n()
const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const waline = useAddonConfig('valaxy-addon-waline')
const route = useRoute()
const section = useTemplateRef<HTMLElement>('section')
const activated = ref(false)

watch(() => route.path, () => {
  activated.value = false
})
useIntersectionObserver(section, ([entry]) => {
  if (entry?.isIntersecting)
    activated.value = true
}, { rootMargin: '400px 0px' })

const provider = computed<CommentProvider | ''>(() => {
  if (waline.value)
    return 'waline'

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

  return null
})
</script>

<template>
  <section
    v-if="enabled"
    :key="route.path"
    ref="section"
    class="lm-comment comment"
    :aria-label="t('comment.label')"
  >
    <div class="lm-comment__content">
      <div class="lm-comment__body">
        <component :is="providerComponent" :active="activated" />
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
  border-color: var(--lm-c-primary-border);
}

.lm-comment__body {
  @apply min-h-80 w-full;
}
</style>
