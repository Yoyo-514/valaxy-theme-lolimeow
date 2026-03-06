<script lang="ts" setup>
import { isClient, useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useWindowScroll()
const showBackToTop = computed(() => y.value > 50)

function backToTop() {
  if (!isClient)
    return

  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="hidden bottom-8 right-8 fixed z-10 md:block">
    <Transition>
      <button
        v-if="showBackToTop"
        class="text-[var(--lm-c-text-secondary)] border border-[var(--lm-c-border)] rounded-full bg-[var(--lm-c-bg-glass)] inline-flex h-11 w-11 transition-[color,border-color,transform,box-shadow] duration-250 ease-in-out items-center justify-center backdrop-blur-[12px] hover:text-[var(--lm-c-text-primary)] hover:border-[var(--lm-c-brand)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
        type="button"
        aria-label="Back to top"
        @click="backToTop"
      >
        <div i-ri-arrow-up-line />
      </button>
    </Transition>
  </div>
</template>
