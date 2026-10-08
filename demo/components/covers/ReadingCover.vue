<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  context?: 'card' | 'page'
  heading?: string
}>(), {
  context: 'page',
  heading: '留一点时间，慢慢读。',
})

const alternate = ref(false)
</script>

<template>
  <div class="reading-cover" :class="{ 'reading-cover--alternate': alternate }">
    <p>{{ heading }}</p>
    <button v-if="context === 'page'" type="button" :aria-pressed="alternate" @click="alternate = !alternate">
      切换封面配色
    </button>
  </div>
</template>

<style scoped>
.reading-cover {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--lm-c-primary-soft);
  color: var(--lm-c-text-primary);
  text-align: center;
}

.reading-cover--alternate {
  background: var(--lm-surface-reading-bg);
}

.reading-cover p {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
}

.reading-cover button {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--lm-c-primary-border);
  border-radius: 0.5rem;
  color: var(--lm-c-primary-text);
  background: var(--lm-surface-reading-bg);
  cursor: pointer;
}

.reading-cover button:hover {
  background: var(--lm-c-primary-soft-hover);
}

.reading-cover button:focus-visible {
  outline: 2px solid var(--lm-c-primary-focus-ring);
  outline-offset: 3px;
}
</style>
