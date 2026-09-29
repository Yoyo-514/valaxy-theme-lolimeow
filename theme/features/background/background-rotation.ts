import type { BrowserTimeout } from '../../shared/browser'
import type { BackgroundScope, ResolvedBackground } from './types'
import { clearBrowserTimeout, getDocument, getWindow, setBrowserTimeout } from '../../shared/browser'
import { cacheBackgroundImage } from './background-cache'
import { getBackgroundCacheKey, getRotationCandidate } from './background-image'
import { preloadImage } from './image-loader'

/** 随机背景轮换允许的最短间隔，单位为毫秒。 */
const MIN_ROTATION_INTERVAL = 4000

/** 背景轮换调度器的依赖与回调选项。 */
export interface BackgroundRotationSchedulerOptions {
  /** 背景生效范围，用于隔离成功图片缓存。 */
  scope: BackgroundScope
  /** 判断指定请求世代是否仍为当前有效世代。 */
  isCurrentRequest: (requestId: number) => boolean
  /** 提交已完成预加载的轮换图片。 */
  commit: (url: string, background: ResolvedBackground) => void
  /** 页面隐藏暂停轮换时取消尚未完成的视觉过渡。 */
  onPause: () => void
  /** 处理当前世代的轮换图片加载失败。 */
  handleFailure: () => void
}

/** 递归安排随机背景轮换的调度器。 */
export interface BackgroundRotationScheduler {
  /** 根据背景快照与请求世代安排下一次轮换。 */
  schedule: (background: ResolvedBackground, requestId: number) => void
  /** 幂等停止当前唯一的轮换定时器，并使在途轮换任务失效。 */
  stop: () => void
}

/** 单个调度拥有定时器、图片请求与可见性监听；停止或隐藏会统一取消在途请求。 */
export function createBackgroundRotationScheduler(options: BackgroundRotationSchedulerOptions): BackgroundRotationScheduler {
  let dispose = () => {}

  function stop() {
    dispose()
    dispose = () => {}
  }

  function schedule(background: ResolvedBackground, requestId: number) {
    stop()
    const document = getDocument()
    if (!background.random || !background.rotationEnabled || !getWindow() || !document || !options.isCurrentRequest(requestId))
      return

    const lifetime = new AbortController()
    let timer: BrowserTimeout | undefined
    let load: AbortController | undefined
    const interval = Math.max(background.rotationInterval, MIN_ROTATION_INTERVAL)
    const isActive = () => !lifetime.signal.aborted && options.isCurrentRequest(requestId) && document.visibilityState !== 'hidden'

    function cancelPending() {
      clearBrowserTimeout(timer)
      timer = undefined
      load?.abort()
      load = undefined
    }

    function scheduleNext() {
      if (isActive()) {
        timer = setBrowserTimeout(() => {
          timer = undefined
          // 只在异步入口报告意外错误，内部回调无需逐层吞错。
          void rotate().catch(error => console.error('[lolimeow] Background rotation failed.', error))
        }, interval)
      }
    }

    async function rotate() {
      if (!isActive())
        return
      const url = getRotationCandidate(background)
      if (!url) {
        scheduleNext()
        return
      }
      const controller = new AbortController()
      load = controller
      const canCommit = () => isActive() && !controller.signal.aborted
      try {
        let loadedUrl: string
        try {
          loadedUrl = await preloadImage(url, controller.signal)
        }
        catch {
          if (canCommit())
            options.handleFailure()
          return
        }
        if (canCommit()) {
          options.commit(loadedUrl, background)
          cacheBackgroundImage(getBackgroundCacheKey(options.scope, background), loadedUrl)
        }
      }
      finally {
        if (load === controller)
          load = undefined
        if (canCommit())
          scheduleNext()
      }
    }

    function onVisibilityChange() {
      cancelPending()
      if (document!.visibilityState === 'hidden')
        options.onPause()
      else
        scheduleNext()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    dispose = () => {
      lifetime.abort()
      cancelPending()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    scheduleNext()
  }

  return { schedule, stop }
}
