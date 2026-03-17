<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const keyword = ref('')
const inputRef = ref<HTMLInputElement>()

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      keyword.value = ''
      return
    }

    await nextTick()
    // 输入框聚焦依赖 Teleport 内容已挂载，因此需要等到下一轮 DOM 刷新后再执行。
    inputRef.value?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <div class="lm-search-shell">
      <Transition name="lm-search-backdrop">
        <button
          v-if="props.open"
          type="button"
          class="bg-black/36 pointer-events-auto inset-0 absolute backdrop-blur-[6px]"
          aria-label="Close Search"
          @click="emit('close')"
        />
      </Transition>

      <Transition name="lm-search-panel">
        <section
          v-if="props.open"
          class="lm-search-modal"
        >
          <div class="lm-search-head">
            <div i-ri-search-line class="text-[var(--lm-c-text-muted)]" />
            <input
              ref="inputRef"
              v-model="keyword"
              class="lm-search-input"
              type="text"
              placeholder="搜索文章、标签、分类"
            >
            <button
              type="button"
              class="lm-search-close-btn"
              aria-label="Close Search"
              @click="emit('close')"
            >
              <div i-ri-close-line />
            </button>
          </div>

          <div class="text-sm text-[var(--lm-c-text-muted)] px-4 py-6">
            输入关键词开始搜索
          </div>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../styles/mixins/surface' as *;

.lm-search-shell {
  @apply px-4 pt-[8vh] flex pointer-events-none items-start inset-0 justify-center fixed z-[var(--lm-z-modal)];
}

.lm-search-modal {
  @include lm-surface-modal;

  @apply rounded max-w-[720px] w-full pointer-events-auto relative;
}

.lm-search-head {
  @apply px-4 py-3 border-b border-[var(--lm-c-divider)] flex gap-3 items-center;
}

.lm-search-input {
  @apply text-[var(--lm-c-text-primary)] outline-none bg-transparent w-full;
}

.lm-search-close-btn {
  @apply text-[var(--lm-c-text-secondary)] rounded-full inline-flex h-8 w-8 items-center justify-center transition-colors duration-200 ease-out hover:text-[var(--lm-c-text-primary)];
}

.lm-search-backdrop-enter-active,
.lm-search-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.lm-search-backdrop-enter-from,
.lm-search-backdrop-leave-to {
  opacity: 0;
}

.lm-search-panel-enter-active,
.lm-search-panel-leave-active {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.lm-search-panel-enter-from,
.lm-search-panel-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.985);
}
</style>
