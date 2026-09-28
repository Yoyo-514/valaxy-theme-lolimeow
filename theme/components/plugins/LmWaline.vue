<script setup lang="ts">
// cspell:ignore waline
import { useAddonConfig } from 'valaxy'
import { computed } from 'vue'

type WalineAddonOptions = {
  serverURL: string
} & Record<string, unknown>

const waline = useAddonConfig<WalineAddonOptions>('valaxy-addon-waline')

const options = computed(() => waline.value?.options)
</script>

<template>
  <div v-if="options" class="lm-waline">
    <WalineClient w="full" :options="options" />
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
