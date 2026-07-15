import type { Ref } from 'vue'
import type { BrowserTimeout } from '../../utils'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clearBrowserTimeout, setBrowserTimeout } from '../../utils'

export const POST_CARD_COVER_LOAD_TIMEOUT_MS = 60_000

export function usePostCardMediaState(
  hasMedia: Readonly<Ref<boolean>>,
  cover: Readonly<Ref<string>>,
  imageElement?: Readonly<Ref<HTMLImageElement | null>>,
  onCoverFailure?: () => void,
) {
  const imageLoaded = ref(false)
  let loadTimeout: BrowserTimeout | undefined
  let mounted = false

  function clearLoadTimeout() {
    clearBrowserTimeout(loadTimeout)
    loadTimeout = undefined
  }

  function failCurrentCover(expectedCover: string) {
    if (!expectedCover || expectedCover !== cover.value || !hasMedia.value)
      return

    clearLoadTimeout()
    imageLoaded.value = false
    onCoverFailure?.()
  }

  function startLoadTimeout(expectedCover: string) {
    clearLoadTimeout()
    loadTimeout = setBrowserTimeout(() => {
      loadTimeout = undefined
      failCurrentCover(expectedCover)
    }, POST_CARD_COVER_LOAD_TIMEOUT_MS)
  }

  async function syncLoadedStateFromElement() {
    await nextTick()

    const expectedCover = cover.value
    const image = imageElement?.value
    if (!expectedCover || !hasMedia.value || !image)
      return

    // SSR 首屏或浏览器缓存可能让图片在 Vue 绑定监听前就结束请求，
    // 因此 complete 状态既要补同步成功，也要补处理缓存失败。
    if (image.complete) {
      if (image.naturalWidth > 0)
        handleImageLoad()
      else
        failCurrentCover(expectedCover)
      return
    }

    startLoadTimeout(expectedCover)
  }

  watch(
    [() => cover.value, () => hasMedia.value],
    () => {
      clearLoadTimeout()
      imageLoaded.value = false

      if (mounted)
        void syncLoadedStateFromElement()
    },
    { immediate: true },
  )

  onMounted(() => {
    mounted = true
    void syncLoadedStateFromElement()
  })

  onBeforeUnmount(() => {
    mounted = false
    clearLoadTimeout()
  })

  const showLoadingPlaceholder = computed(() => hasMedia.value && !imageLoaded.value)

  function isCurrentCoverEvent(event?: Event) {
    const image = event?.currentTarget as HTMLImageElement | null
    const eventCover = image?.getAttribute('src')
    return !eventCover || eventCover === cover.value
  }

  function handleImageLoad(event?: Event) {
    if (!isCurrentCoverEvent(event))
      return

    clearLoadTimeout()
    imageLoaded.value = true
  }

  function handleImageError(event?: Event) {
    if (!isCurrentCoverEvent(event))
      return

    failCurrentCover(cover.value)
  }

  return {
    imageLoaded,
    showLoadingPlaceholder,
    handleImageError,
    handleImageLoad,
  }
}
