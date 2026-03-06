<script lang="ts" setup>
import { formatDate } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  date?: Date | number | string
}>()

const datetime = computed(() => formatDate(props.date || ''))
</script>

<template>
  <dl class="m-0">
    <dt class="sr-only">
      Published on
    </dt>
    <dd class="text-sm text-[var(--lm-c-text-secondary)] leading-6 tracking-[0.01em] font-500 m-0">
      <time :datetime="datetime">{{ datetime }}</time>
    </dd>
  </dl>
</template>
