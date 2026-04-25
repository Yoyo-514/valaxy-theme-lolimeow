<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="lm-search-shell">
      <Transition name="lm-search-backdrop">
        <button
          v-if="props.open"
          type="button"
          class="lm-search-shell__backdrop"
          aria-label="Close Search"
          @click="emit('close')"
        />
      </Transition>

      <Transition name="lm-search-panel">
        <section
          v-if="props.open"
          class="lm-search-shell__panel"
        >
          <slot />
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@theme/styles/mixins/surface' as *;

.lm-search-shell {
  @apply px-4 pt-[8vh] flex pointer-events-none items-start inset-0 justify-center fixed z-[var(--lm-z-modal)];
}

.lm-search-shell__backdrop {
  @apply bg-black/36 pointer-events-auto inset-0 absolute backdrop-blur-[6px];
}

.lm-search-shell__panel {
  @include lm-surface-modal;

  @apply rounded max-w-[720px] w-full pointer-events-auto relative overflow-hidden;
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
