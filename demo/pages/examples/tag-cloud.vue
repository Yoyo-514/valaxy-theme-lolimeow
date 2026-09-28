<script setup lang="ts">
import { computed, ref } from 'vue'

const selected = ref('7 个标签')
const activeId = ref('')
const labels = ['Valaxy', 'Vue', 'TypeScript', 'Markdown', '设计', '生活', '随笔']
const scenarios = ['1 个标签', '3 个标签', '7 个标签', '50 个标签', '长标签', '空词云']
const items = computed(() => {
  const count = Number.parseInt(selected.value) || 0
  const names = selected.value === '长标签'
    ? ['一个用于验证超长标签换行和完整显示的词云示例', 'a-very-long-tag-without-spaces-for-responsive-layout', 'Vue']
    : Array.from({ length: count }, (_, index) => index < labels.length ? labels[index] : `示例 ${index + 1}`)
  return names.map((name, index) => ({ id: `example-${index}`, name, count: Math.max(1, 8 - index) }))
})
</script>

<template>
  <LmAggregatePage title="词云排布示例">
    <p>切换标签数量，检查词云聚拢、长词换行与键盘操作。</p>
    <div class="tag-cloud-examples__controls">
      <button
        v-for="scenario in scenarios"
        :key="scenario"
        type="button"
        :aria-pressed="selected === scenario"
        @click="selected = scenario"
      >
        {{ scenario }}
      </button>
    </div>
    <LmTagCloud :items="items" :active-id="activeId" @select="activeId = $event" />
    <p role="status">
      当前选择：{{ items.find(item => item.id === activeId)?.name ?? '未选择' }}
    </p>
  </LmAggregatePage>
</template>

<style scoped>
.tag-cloud-examples__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-cloud-examples__controls button {
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--lm-c-primary-border);
  border-radius: var(--lm-radius-sm);
  color: var(--lm-c-text-primary);
  background: var(--lm-c-primary-soft);
}

.tag-cloud-examples__controls button[aria-pressed='true'] {
  background: var(--lm-c-primary-soft-hover);
}
</style>
