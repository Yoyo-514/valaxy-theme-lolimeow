import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

export function usePostCardMediaState(hasMedia: Readonly<Ref<boolean>>, cover: Readonly<Ref<string>>) {
  const imageLoaded = ref(false)

  watch(
    () => cover.value,
    () => {
      imageLoaded.value = false
    },
    { immediate: true },
  )

  const showLoadingPlaceholder = computed(() => hasMedia.value && !imageLoaded.value)

  function handleImageLoad() {
    imageLoaded.value = true
  }

  return {
    imageLoaded,
    showLoadingPlaceholder,
    handleImageLoad,
  }
}
