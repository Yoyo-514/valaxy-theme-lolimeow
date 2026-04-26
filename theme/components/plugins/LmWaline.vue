<script setup lang="ts">
// cspell:ignore waline
// @ts-expect-error - `valaxy-addon-waline` 仅提供源码与导出映射，CI 下 `vue-tsc` 可能无法正确解析包根类型
import { useAddonWaline } from 'valaxy-addon-waline'

const addon = useAddonWaline()
</script>

<template>
  <div class="lm-waline">
    <WalineClient w="full" :options="addon.options" />
  </div>
</template>

<style lang="scss" scoped>
.lm-waline {
  @apply w-full;
  --lm-waline-surface-border: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
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
  border-radius: 9999px;
}

:deep(.wl-card) {
  border-bottom-color: color-mix(in srgb, var(--lm-c-brand) 92%, white);
}

:deep(.wl-card .wl-quote) {
  border-inline-start-color: color-mix(in srgb, var(--lm-c-brand-strong) 32%, white);
}

:deep(.wl-btn.primary) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 62%, white);
  background: color-mix(in srgb, var(--lm-c-brand) 92%, white);
}
</style>
