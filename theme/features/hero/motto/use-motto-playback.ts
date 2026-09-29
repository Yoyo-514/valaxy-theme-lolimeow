import type { Ref } from 'vue'
import type { BrowserTimeout } from '../../../shared/browser'
import type { Hero } from '../../../types'
import type { useMottoSource } from './use-motto-source'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { clearBrowserTimeout, setBrowserTimeout } from '../../../shared/browser'
import { useTypewriter } from '../typewriter'

/** 文本播放仅持有索引、逐字渲染和下一次播放定时器；网络请求由来源层处理。 */
export function useMottoPlayback(
  hero: Readonly<Ref<Hero>>,
  mounted: Readonly<Ref<boolean>>,
  source: ReturnType<typeof useMottoSource>,
) {
  const index = ref(0)
  const mottoRenderKey = ref(0)
  const { render, renderedText: renderedMotto, stop } = useTypewriter()
  const accessibleMotto = computed(() => source.mottos.value[index.value] ?? '')
  const typingSpeed = computed(() => Math.max(hero.value.typingSpeed || 100, 24))
  const rotationDelay = computed(() => Math.max(hero.value.mottoInterval || 4000, 1200))
  let timer: BrowserTimeout | undefined

  function clear() {
    clearBrowserTimeout(timer)
    timer = undefined
    stop()
  }

  function schedule() {
    if (!mounted.value || source.pending.value)
      return
    if (!source.remote.value && source.mottos.value.length < 2)
      return
    timer = setBrowserTimeout(() => {
      timer = undefined
      if (source.remote.value) {
        void source.refresh()
      }
      else {
        index.value = (index.value + 1) % source.mottos.value.length
        play()
      }
    }, rotationDelay.value)
  }

  function play() {
    clear()
    mottoRenderKey.value += 1
    render({
      text: accessibleMotto.value,
      speed: typingSpeed.value,
      immediate: !mounted.value || !hero.value.typewriter,
      onComplete: schedule,
    })
  }

  watch([source.mottos, source.pending, source.remote, mounted, () => hero.value.typewriter, typingSpeed, rotationDelay], () => {
    index.value = 0
    play()
  }, { immediate: true, deep: true })
  onBeforeUnmount(clear)

  return { accessibleMotto, mottoRenderKey, renderedMotto }
}
