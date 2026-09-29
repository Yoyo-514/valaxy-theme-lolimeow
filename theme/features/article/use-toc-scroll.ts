import type { BrowserAnimationFrame } from '../../shared/browser'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { isNavigationFailure, NavigationFailureType, useRouter } from 'vue-router'
import { cancelBrowserAnimationFrame, getDocument, getWindow, requestBrowserAnimationFrame, useReducedMotion } from '../../shared/browser'
import { lockNavbarScrollReaction } from '../navigation'

const SCROLL_DURATION = 320
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/** 目录使用固定时长滚动；新选择、手动滚动和离开文章都会取消旧动画。 */
export function useTocScroll() {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  let frame: BrowserAnimationFrame | undefined
  let generation = 0
  let releaseNavbar: (() => void) | undefined

  function cancel() {
    generation += 1
    cancelBrowserAnimationFrame(frame)
    frame = undefined
    releaseNavbar?.()
    releaseNavbar = undefined
  }

  function onKeydown(event: KeyboardEvent) {
    if (SCROLL_KEYS.has(event.key))
      cancel()
  }

  async function handleClick(event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return

    const anchor = event.currentTarget as HTMLAnchorElement
    const hash = decodeURIComponent(anchor.hash)
    const heading = getDocument()?.getElementById(hash.slice(1))
    const currentWindow = getWindow()
    if (!heading || !currentWindow)
      return

    event.preventDefault()
    cancel()
    const request = generation
    const failure = await router.push({ hash })
    if (request !== generation || (failure && !isNavigationFailure(failure, NavigationFailureType.duplicated)))
      return

    // 使用文章标题的样式偏移，保持目标位于导航栏下方。
    const start = currentWindow.scrollY
    const margin = Number.parseFloat(currentWindow.getComputedStyle(heading).scrollMarginTop) || 0
    const target = Math.max(0, Math.min(
      start + heading.getBoundingClientRect().top - margin,
      currentWindow.document.documentElement.scrollHeight - currentWindow.innerHeight,
    ))
    heading.focus({ preventScroll: true })
    releaseNavbar = lockNavbarScrollReaction({ timeoutMs: SCROLL_DURATION + 100 })

    if (reducedMotion.value) {
      currentWindow.scrollTo({ top: target, behavior: 'instant' })
      return
    }

    const started = currentWindow.performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / SCROLL_DURATION)
      const eased = 1 - (1 - progress) ** 3
      currentWindow.scrollTo({ top: start + (target - start) * eased, behavior: 'instant' })
      frame = progress < 1 ? requestBrowserAnimationFrame(step) : undefined
    }
    frame = requestBrowserAnimationFrame(step)
  }

  watch(() => router.currentRoute.value.path, cancel)
  watch(reducedMotion, cancel)
  onMounted(() => {
    const currentWindow = getWindow()
    currentWindow?.addEventListener('wheel', cancel, { passive: true })
    currentWindow?.addEventListener('touchstart', cancel, { passive: true })
    currentWindow?.addEventListener('keydown', onKeydown)
  })
  onBeforeUnmount(() => {
    cancel()
    const currentWindow = getWindow()
    currentWindow?.removeEventListener('wheel', cancel)
    currentWindow?.removeEventListener('touchstart', cancel)
    currentWindow?.removeEventListener('keydown', onKeydown)
  })

  return handleClick
}
