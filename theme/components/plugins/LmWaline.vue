<script setup lang="ts">
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
}

:deep(.wl-editor),
:deep(.wl-panel),
:deep(.wl-card),
:deep(.wl-meta-head),
:deep(.wl-empty) {
  border-radius: 0.5rem;
}

:deep(.wl-panel),
:deep(.wl-editor),
:deep(.wl-card) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 72%, transparent);
}

:deep(.wl-input),
:deep(.wl-editor) {
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}

:deep(.wl-header label),
:deep(.wl-meta),
:deep(.wl-empty),
:deep(.wl-info) {
  color: var(--lm-c-text-secondary);
}

:deep(.wl-content),
:deep(.wl-addr),
:deep(.wl-nick),
:deep(.wl-pageview-count),
:deep(.wl-count) {
  color: var(--lm-c-text-primary);
}

:deep(.wl-btn) {
  border-radius: 9999px;
}

:deep(.wl-btn.primary) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 62%, white);
  background: color-mix(in srgb, var(--lm-c-brand) 92%, white);
}
</style>
