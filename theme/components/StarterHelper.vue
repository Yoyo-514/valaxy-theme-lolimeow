<script lang="ts" setup>
import { isClient, useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useWindowScroll()
const showBackToTop = computed(() => y.value > 50)

function backToTop() {
  if (!isClient)
    return
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <div class="flex-col gap-3 hidden bottom-8 right-8 fixed md:flex">
    <Transition>
      <button
        v-if="showBackToTop" class="text-gray-500 p-2 rounded-full bg-gray-200 transition-all dark:text-gray-400 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        @click="backToTop"
      >
        <div i-ri-arrow-up-line />
      </button>
    </Transition>
  </div>
</template>
