import type { BrowserTimeout } from '@theme/utils'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '@theme/utils'
import { useAddonHitokoto } from 'valaxy-addon-hitokoto'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useThemeConfig } from './config'

const MIN_TYPING_SPEED = 24
const MIN_ROTATION_DELAY = 1200
const DEFAULT_HITOKOTO_SEPARATOR = '——'

export function useHeroMotto() {
  const themeConfig = useThemeConfig()
  const activeIndex = ref(0)
  const renderedMotto = ref('')
  let typingTimer: BrowserTimeout | undefined
  let rotationTimer: BrowserTimeout | undefined

  const hitokotoApi = themeConfig.value.hero.mottoSource === 'hitokoto'
    ? useAddonHitokoto()
    : undefined

  const useHitokoto = computed(() => themeConfig.value.hero.mottoSource === 'hitokoto' && Boolean(hitokotoApi))

  const configMottoList = computed(() => {
    const { motto } = themeConfig.value.hero

    if (Array.isArray(motto))
      return motto.filter(Boolean)

    return motto ? [motto] : []
  })

  const hitokotoMotto = computed(() => {
    const currentHitokoto = hitokotoApi?.hitokoto.value
    if (!currentHitokoto)
      return ''

    const text = currentHitokoto.hitokoto.trim()
    if (!text)
      return ''

    const hitokotoOptions = themeConfig.value.hero.hitokoto
    if (!hitokotoOptions?.showFrom)
      return text

    const from = (currentHitokoto.from || currentHitokoto.fromWho || '').trim()
    if (!from)
      return text

    return `${text} ${hitokotoOptions.fromSeparator || DEFAULT_HITOKOTO_SEPARATOR} ${from}`
  })

  const mottoList = computed(() => {
    if (!useHitokoto.value)
      return configMottoList.value

    return hitokotoMotto.value ? [hitokotoMotto.value] : configMottoList.value
  })

  const hasMotto = computed(() => mottoList.value.length > 0)
  const shouldRotate = computed(() => mottoList.value.length > 1)
  const shouldType = computed(() => Boolean(themeConfig.value.hero.typewriter))
  const typingSpeed = computed(() => Math.max(themeConfig.value.hero.typingSpeed || 100, MIN_TYPING_SPEED))
  const rotationDelay = computed(() => Math.max(themeConfig.value.hero.mottoInterval || 4000, MIN_ROTATION_DELAY))

  function clearTimers() {
    clearBrowserTimeout(typingTimer)
    clearBrowserTimeout(rotationTimer)

    typingTimer = undefined
    rotationTimer = undefined
  }

  function scheduleNextMotto() {
    if (useHitokoto.value && hitokotoApi) {
      const currentWindow = getWindow()
      if (!currentWindow)
        return

      rotationTimer = setBrowserTimeout(async () => {
        rotationTimer = undefined
        const currentMottoKey = mottoList.value.join('\u0000')

        await hitokotoApi.fetchHitokoto()

        if (mottoList.value.join('\u0000') === currentMottoKey)
          scheduleNextMotto()
      }, rotationDelay.value)
      return
    }

    if (!shouldRotate.value)
      return

    const currentWindow = getWindow()
    if (!currentWindow)
      return

    // 轮播定时器和打字定时器必须严格分离：
    // 前者控制“下一条何时开始”，后者控制“当前条如何显现”。
    rotationTimer = setBrowserTimeout(() => {
      activeIndex.value = (activeIndex.value + 1) % mottoList.value.length
      renderActiveMotto()
    }, rotationDelay.value)
  }

  function renderImmediately(text: string) {
    renderedMotto.value = text
    scheduleNextMotto()
  }

  function renderWithTypewriter(text: string) {
    const currentWindow = getWindow()
    if (!currentWindow) {
      renderImmediately(text)
      return
    }

    if (!text) {
      renderedMotto.value = ''
      scheduleNextMotto()
      return
    }

    let visibleLength = 0
    renderedMotto.value = ''

    const step = () => {
      visibleLength += 1
      renderedMotto.value = text.slice(0, visibleLength)

      if (visibleLength < text.length) {
        typingTimer = setBrowserTimeout(step, typingSpeed.value)
        return
      }

      scheduleNextMotto()
    }

    typingTimer = setBrowserTimeout(step, typingSpeed.value)
  }

  function renderActiveMotto() {
    clearTimers()

    const currentMotto = mottoList.value[activeIndex.value] ?? ''
    if (!currentMotto) {
      renderedMotto.value = ''
      return
    }

    if (!shouldType.value) {
      renderImmediately(currentMotto)
      return
    }

    renderWithTypewriter(currentMotto)
  }

  watch(
    () => [
      mottoList.value.join('\u0000'),
      shouldType.value,
      typingSpeed.value,
      rotationDelay.value,
    ],
    () => {
      // Hero 配置变化后必须从第一条重新启动状态机，否则会出现：
      // 旧定时器继续驱动新配置、activeIndex 越界、旧文案残留等时序污染。
      clearTimers()
      activeIndex.value = 0

      if (!hasMotto.value) {
        renderedMotto.value = ''
        return
      }

      renderActiveMotto()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    clearTimers()
  })

  return {
    hasMotto,
    renderedMotto,
  }
}
