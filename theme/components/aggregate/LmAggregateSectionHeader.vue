<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  meta?: string
}>()
</script>

<template>
  <header class="lm-aggregate-section-header">
    <h2 class="lm-aggregate-section-header__title">
      {{ title }}
    </h2>
    <p v-if="description" class="lm-aggregate-section-header__description">
      {{ description }}
    </p>
    <p v-if="meta" class="lm-aggregate-section-header__meta">
      {{ meta }}
    </p>
  </header>
</template>

<style scoped lang="scss">
.lm-aggregate-section-header {
  @apply grid min-w-0 content-start gap-2;
  overflow-wrap: anywhere;
}

.lm-aggregate-section-header__title {
  @apply m-0 text-xl leading-7 font-800 sm:text-2xl sm:leading-8;
  color: var(--lm-c-text-primary);
  text-wrap: balance;
}

.lm-aggregate-section-header__description,
.lm-aggregate-section-header__meta {
  @apply m-0 text-sm leading-6;
  color: var(--lm-c-text-secondary);
}

.lm-aggregate-section-header__description {
  max-width: 65ch;
}

.lm-aggregate-section-header__meta {
  font-variant-numeric: tabular-nums;
}
</style>
