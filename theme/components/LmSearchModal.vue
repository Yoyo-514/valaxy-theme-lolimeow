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
    inputRef.value?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <div class="px-4 pt-[8vh] flex pointer-events-none items-start inset-0 justify-center fixed z-[var(--lm-z-modal)]">
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
          class="lm-search-modal rounded max-w-[720px] w-full pointer-events-auto relative"
        >
          <div class="px-4 py-3 border-b border-[var(--lm-c-divider)] flex gap-3 items-center">
            <div i-ri-search-line class="text-[var(--lm-c-text-muted)]" />
            <input
              ref="inputRef"
              v-model="keyword"
              class="text-[var(--lm-c-text-primary)] outline-none bg-transparent w-full"
              type="text"
              placeholder="搜索文章、标签、分类"
            >
            <button
              type="button"
              class="text-[var(--lm-c-text-secondary)] rounded-full inline-flex h-8 w-8 transition-colors duration-200 ease-out items-center justify-center hover:text-[var(--lm-c-text-primary)]"
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

.lm-search-modal {
  @include lm-surface-modal;
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
