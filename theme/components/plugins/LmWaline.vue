<script setup lang="ts">
// cspell:ignore waline
import type { LmWalineOptions } from '../../features/comment/waline-options'
import { commentCount } from '@waline/client/comment'
import { pageviewCount } from '@waline/client/pageview'
import { useAddonConfig } from 'valaxy'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ active: boolean }>()

const WalineClient = defineAsyncComponent(() => import('./LmWalineClient.vue'))
const waline = useAddonConfig<LmWalineOptions>('valaxy-addon-waline')
const route = useRoute()
const abortCounts: (() => void)[] = []

// 计数在进入页面时执行；评论挂载后关闭插件的重复计数。
const options = computed(() => waline.value?.options
  ? { ...waline.value.options, pageview: false, comment: false }
  : undefined)

onMounted(() => {
  const config = waline.value?.options
  if (!config)
    return

  const path = config.path || route.path.replace(/\/$/, '')
  if (config.pageview) {
    abortCounts.push(pageviewCount({
      serverURL: config.serverURL,
      path,
      selector: typeof config.pageview === 'string' ? config.pageview : undefined,
    }))
  }
  if (config.comment) {
    abortCounts.push(commentCount({
      serverURL: config.serverURL,
      path,
      selector: typeof config.comment === 'string' ? config.comment : undefined,
    }))
  }
})
onBeforeUnmount(() => abortCounts.forEach(abort => abort()))
</script>

<template>
  <div v-if="options" class="lm-waline">
    <WalineClient v-if="active" w="full" :options="options" />
  </div>
</template>

<style lang="scss" scoped>
.lm-waline {
  @apply w-full;
  --waline-theme-color: var(--lm-c-primary-text);
  --waline-active-color: var(--lm-c-primary-text-hover);
  --lm-waline-surface-border: var(--lm-c-primary-border-subtle);
  --lm-waline-surface-bg: color-mix(in srgb, var(--lm-surface-reading-bg) 72%, transparent);
}

:deep(.wl-header .wl-input:focus) {
  background: transparent;
}

:deep(.wl-editor),
:deep(.wl-panel),
:deep(.wl-empty) {
  border-radius: 0.5rem;
}

:deep(.wl-actions a) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.wl-panel),
:deep(.wl-editor) {
  border-color: var(--lm-waline-surface-border);
  background: var(--lm-waline-surface-bg);
}

:deep(.wl-meta span) {
  padding: 3px 6px;
  border-radius: 0.5rem;
  border-color: var(--lm-waline-surface-border);
  background: var(--lm-waline-surface-bg);
  color: var(--lm-c-text-secondary);
}

:deep(.wl-input),
:deep(.wl-editor) {
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}

:deep(.wl-header label),
:deep(.wl-sort li:not(.active)),
:deep(.wl-time),
:deep(.wl-comment-actions button),
:deep(.wl-empty),
:deep(.wl-info),
:deep(.wl-power) {
  color: var(--lm-c-text-secondary);
}

:deep(.wl-comment-actions button + button) {
  margin-left: 8px;
}

:deep(.wl-content p),
:deep(span.wl-nick),
:deep(.wl-count) {
  color: var(--lm-c-text-primary);
}

:deep(.wl-btn) {
  border-radius: var(--lm-radius-full);
}

:deep(.wl-card) {
  border-bottom-color: var(--lm-c-primary-base);
}

:deep(.wl-card .wl-quote) {
  border-inline-start-color: var(--lm-c-primary-border);
}

:deep(.wl-btn.primary) {
  border-color: var(--lm-c-primary-border-strong);
  background: var(--lm-c-primary-solid);
  color: var(--lm-c-primary-on-solid);
}

:deep(.wl-btn.primary:hover),
:deep(.wl-btn.primary:focus-visible) {
  background: var(--lm-c-primary-solid-hover);
  color: var(--lm-c-primary-on-solid);
}
</style>
