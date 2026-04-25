<script setup lang="ts">
import type { LmFuseSearchResult } from '@theme/composables'
import { useLmFuseSearch } from '@theme/composables'
import { createDebouncedFunction } from '@theme/utils'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const query = ref('')
const debouncedQuery = ref('')
const selectedIndex = ref(-1)
const router = useRouter()
const { hasError, load, loading, results } = useLmFuseSearch(debouncedQuery)
const updateDebouncedQuery = createDebouncedFunction((value: string) => {
  debouncedQuery.value = value
}, 180)

const hasQuery = computed(() => Boolean(query.value.trim()))
const searching = computed(() => hasQuery.value && query.value.trim() !== debouncedQuery.value)

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      query.value = ''
      debouncedQuery.value = ''
      selectedIndex.value = -1
      return
    }

    selectedIndex.value = -1
    await load()
  },
)

watch(results, (value) => {
  if (!value.length) {
    selectedIndex.value = -1
    return
  }

  if (selectedIndex.value >= value.length)
    selectedIndex.value = value.length - 1
})

watch(query, (value) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    updateDebouncedQuery.cancel()
    debouncedQuery.value = ''
    selectedIndex.value = -1
    return
  }

  updateDebouncedQuery(normalizedValue)
})

onUnmounted(() => {
  updateDebouncedQuery.cancel()
})

function navigate(result: LmFuseSearchResult) {
  router.push(result.id)
  emit('close')
}

function updateQuery(value: string) {
  query.value = value
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!results.value.length)
        return
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!results.value.length)
        return
      selectedIndex.value = selectedIndex.value <= 0 ? -1 : selectedIndex.value - 1
      break
    case 'Enter':
      event.preventDefault()
      if (results.value[selectedIndex.value])
        navigate(results.value[selectedIndex.value])
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}
</script>

<template>
  <slot
    :query="query"
    :results="results"
    :loading="loading"
    :has-query="hasQuery"
    :searching="searching"
    :has-error="hasError"
    :selected-index="selectedIndex"
    :update-query="updateQuery"
    :navigate="navigate"
    :on-keydown="onKeydown"
  />
</template>
