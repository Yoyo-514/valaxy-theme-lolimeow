import type { BrowserTimeout } from '../../shared/browser'
import type { TypewriterRenderOptions } from './types'
import { onBeforeUnmount, ref } from 'vue'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '../../shared/browser'

/**
 * 创建供 Hero 文案复用的逐字渲染状态。
 *
 * 计时器清理、SSR 立即渲染与切换文本时的中断均由该组合式函数统一处理。
 *
 * @returns 当前渲染文本，以及开始和停止渲染的方法。
 */
export function useTypewriter() {
  /** 当前已经显示的文本片段。 */
  const renderedText = ref('')
  let timer: BrowserTimeout | undefined

  /** 停止当前逐字渲染并释放对应计时器。 */
  function stop() {
    clearBrowserTimeout(timer)
    timer = undefined
  }

  /**
   * 按指定速度渲染文本；重复调用时会先停止上一段文本。
   *
   * @param options - 本次文本、速度、立即渲染开关和完成回调。
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

    /** 显示下一个字符，并在文本完成后触发回调。 */
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
