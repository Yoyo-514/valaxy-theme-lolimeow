import type { Ref } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

export function usePostCardMediaState(
  hasMedia: Readonly<Ref<boolean>>,
  cover: Readonly<Ref<string>>,
  imageElement?: Readonly<Ref<HTMLImageElement | null>>,
) {
  const imageLoaded = ref(false)

  async function syncLoadedStateFromElement() {
    await nextTick()

    const image = imageElement?.value
    if (!image)
      return

    // SSR 首屏或浏览器缓存可能让图片在 Vue 绑定 load 监听前就完成加载，
    // 此时 load 事件不会再触发，需要主动同步 complete 状态。
    if (image.complete && image.naturalWidth > 0)
      imageLoaded.value = true
  }

  watch(
    () => cover.value,
    () => {
      imageLoaded.value = false
      void syncLoadedStateFromElement()
    },
    { immediate: true },
  )

  onMounted(() => {
    void syncLoadedStateFromElement()
  })

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
