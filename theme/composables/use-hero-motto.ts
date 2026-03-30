import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useThemeConfig } from './config'

const MIN_TYPING_SPEED = 24
const MIN_ROTATION_DELAY = 1200

export function useHeroMotto() {
  const themeConfig = useThemeConfig()
  const activeIndex = ref(0)
  const renderedMotto = ref('')
  let typingTimer: ReturnType<typeof setTimeout> | undefined
  let rotationTimer: ReturnType<typeof setTimeout> | undefined

  const mottoList = computed(() => {
    const { motto } = themeConfig.value.hero

    if (Array.isArray(motto))
      return motto.filter(Boolean)

    return motto ? [motto] : []
  })

  const hasMotto = computed(() => mottoList.value.length > 0)
  const shouldRotate = computed(() => mottoList.value.length > 1)
  const shouldType = computed(() => Boolean(themeConfig.value.hero.typewriter))
  const typingSpeed = computed(() => Math.max(themeConfig.value.hero.typingSpeed || 100, MIN_TYPING_SPEED))
  const rotationDelay = computed(() => Math.max(themeConfig.value.hero.mottoInterval || 4000, MIN_ROTATION_DELAY))

  function clearTimers() {
    if (typingTimer)
      clearTimeout(typingTimer)
    if (rotationTimer)
      clearTimeout(rotationTimer)

    typingTimer = undefined
    rotationTimer = undefined
  }

  function scheduleNextMotto() {
    if (!shouldRotate.value)
      return

    // 轮播定时器和打字定时器必须严格分离：
    // 前者控制“下一条何时开始”，后者控制“当前条如何显现”。
    rotationTimer = setTimeout(() => {
      activeIndex.value = (activeIndex.value + 1) % mottoList.value.length
      renderActiveMotto()
    }, rotationDelay.value)
  }

  function renderImmediately(text: string) {
    renderedMotto.value = text
    scheduleNextMotto()
  }

  function renderWithTypewriter(text: string) {
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
        typingTimer = setTimeout(step, typingSpeed.value)
        return
      }

      scheduleNextMotto()
    }

    typingTimer = setTimeout(step, typingSpeed.value)
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
