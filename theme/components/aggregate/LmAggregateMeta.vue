<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  stats?: Array<{
    label: string
    value: number | string
  }>
  cover?: boolean
}>(), {
  stats: () => [],
  cover: false,
})
</script>

<template>
  <div class="lm-aggregate-meta" :class="{ 'lm-aggregate-meta--cover': cover }">
    <h1 class="lm-aggregate-meta__title">
      {{ title }}
    </h1>

    <ul v-if="stats.length" class="lm-aggregate-meta__stats">
      <li
        v-for="stat in stats"
        :key="stat.label"
        class="lm-aggregate-meta__item"
      >
        <span class="lm-aggregate-meta__value">{{ stat.value }}</span>
        <span class="lm-aggregate-meta__label">{{ stat.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.lm-aggregate-meta {
  @apply flex min-w-0 flex-col items-center gap-3 text-center;
}

.lm-aggregate-meta__title {
  @apply m-0 text-3xl leading-[1.12] tracking-tight font-extrabold md:text-5xl md:leading-14;
  color: var(--lm-c-text-primary);
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.lm-aggregate-meta__stats {
  @apply m-0 flex flex-wrap justify-center gap-x-4 gap-y-1.5 p-0 list-none;
}

.lm-aggregate-meta__item {
  @apply inline-flex items-baseline gap-1.5 whitespace-nowrap;
}

.lm-aggregate-meta__value {
  @apply text-base leading-6 font-700;
  color: var(--lm-c-text-primary);
  font-variant-numeric: tabular-nums;
}

.lm-aggregate-meta__label {
  @apply text-sm font-600;
  color: var(--lm-c-text-secondary);
}

.lm-aggregate-meta--cover .lm-aggregate-meta__title {
  color: white;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
}

.lm-aggregate-meta--cover .lm-aggregate-meta__value {
  color: white;
}

.lm-aggregate-meta--cover .lm-aggregate-meta__label {
  color: rgba(255, 255, 255, 0.84);
}

@media (max-width: 767px) {
  .lm-aggregate-meta__title {
    @apply text-[2.2rem];
  }
}
</style>
