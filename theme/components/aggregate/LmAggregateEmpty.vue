<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="lm-empty-state">
    <p class="lm-empty-state__label">
      {{ label }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.lm-empty-state {
  @apply rounded-4 border border-dashed px-5 py-12 text-center text-sm leading-7;
  border-color: var(--lm-c-primary-border-subtle);
  color: var(--lm-c-text-secondary);
  background: var(--lm-surface-empty-bg);
}

.lm-empty-state__label {
  @apply m-0;
  overflow-wrap: anywhere;
}
</style>
