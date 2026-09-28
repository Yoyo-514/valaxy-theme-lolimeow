<script setup lang="ts">
defineProps<{
  title: string
  cover?: string
  stats?: Array<{
    label: string
    value: number | string
  }>
}>()
</script>

<template>
  <section class="lm-aggregate-page">
    <LmAggregateHeader :title="title" :cover="cover" :stats="stats" />

    <div class="lm-aggregate-page__content lm-aggregate-container">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-aggregate-page {
  @apply flex min-w-0 flex-col pb-12 sm:pb-16;
}

.lm-aggregate-page__content {
  @apply flex min-w-0 flex-col gap-8;
}
</style>
