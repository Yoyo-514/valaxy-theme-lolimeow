import type { TypewriterRenderOptions } from '../../types'
import type { BrowserTimeout } from '../../utils'
import { onBeforeUnmount, ref } from 'vue'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '../../utils'

/**
 * 提供可复用的逐字渲染状态。
 *
 * 调用方只负责传入文本、速度和完成回调；计时器清理、SSR 立即渲染
 * 与切换文本时的中断都由这里统一处理。
 */
export function useTypewriter() {
  const renderedText = ref('')
  let timer: BrowserTimeout | undefined

  // 暴露显式 stop，方便调用方在切换文案或销毁前复用同一个打字机实例。
  function stop() {
    clearBrowserTimeout(timer)
    timer = undefined
  }

  /**
   * 开始渲染一段文本。重复调用会自动停止上一段文本的计时器。
   */
  function render(options: TypewriterRenderOptions) {
    stop()

    // SSR 或调用方要求立即渲染时，保留完成回调语义，便于复用轮播调度。
    if (options.immediate || !getWindow()) {
      renderedText.value = options.text
      options.onComplete?.()
      return
    }

    if (!options.text) {
      renderedText.value = ''
      options.onComplete?.()
      return
    }

    let visibleLength = 0
    renderedText.value = ''

    const step = () => {
      visibleLength += 1
      renderedText.value = options.text.slice(0, visibleLength)

      if (visibleLength < options.text.length) {
        timer = setBrowserTimeout(step, options.speed)
        return
      }

      timer = undefined
      options.onComplete?.()
    }

    timer = setBrowserTimeout(step, options.speed)
  }

  onBeforeUnmount(stop)

  return {
    render,
    renderedText,
    stop,
  }
}
