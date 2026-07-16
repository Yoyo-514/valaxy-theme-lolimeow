import type { BrowserTimeout } from '../../shared/browser'
import type { BackgroundScope, ResolvedBackground } from './types'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '../../shared/browser'
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

/**
 * 创建独占唯一轮换定时器的背景调度器。
 *
 * 每轮调度都校验调度世代与请求世代；仅两个世代均有效时可以提交、回退、
 * 缓存并继续安排下一轮，避免已停止或旧配置的异步结果回写背景状态。
 *
 * @param options - 请求世代判断、提交与失败处理依赖。
 * @returns 可递归排程并幂等停止的背景轮换调度器。
 */
export function createBackgroundRotationScheduler(
  options: BackgroundRotationSchedulerOptions,
): BackgroundRotationScheduler {
  let rotationTimer: BrowserTimeout | undefined
  let scheduleGeneration = 0

  /**
   * 判断轮换任务的调度世代与请求世代是否仍同时有效。
   *
   * @param requestId - 启动轮换时的请求世代标识。
   * @param generation - 启动本轮调度时捕获的调度世代。
   * @returns 两个世代均为当前有效世代时返回 true。
   */
  function isScheduleActive(requestId: number, generation: number): boolean {
    return generation === scheduleGeneration && options.isCurrentRequest(requestId)
  }

  /** 幂等停止当前唯一的轮换定时器，并使在途轮换任务失效。 */
  function stop(): void {
    scheduleGeneration += 1
    clearBrowserTimeout(rotationTimer)
    rotationTimer = undefined
  }

  /**
   * 根据背景快照与请求世代安排下一次轮换。
   *
   * @param background - 启动轮换时的背景解析快照。
   * @param requestId - 启动轮换时的请求世代标识。
   */
  function schedule(background: ResolvedBackground, requestId: number): void {
    stop()
    const currentGeneration = scheduleGeneration

    if (!background.rotationEnabled || !getWindow() || !isScheduleActive(requestId, currentGeneration))
      return

    rotationTimer = setBrowserTimeout(async () => {
      if (!isScheduleActive(requestId, currentGeneration))
        return

      rotationTimer = undefined

      if (!isScheduleActive(requestId, currentGeneration))
        return

      const nextUrl = getRotationCandidate(background)

      if (!isScheduleActive(requestId, currentGeneration))
        return

      if (!nextUrl) {
        if (isScheduleActive(requestId, currentGeneration))
          schedule(background, requestId)
        return
      }

      try {
        if (!isScheduleActive(requestId, currentGeneration))
          return

        const loadedUrl = await preloadImage(nextUrl)

        if (!isScheduleActive(requestId, currentGeneration))
          return

        options.commit(loadedUrl, background)

        if (!isScheduleActive(requestId, currentGeneration))
          return

        cacheBackgroundImage(getBackgroundCacheKey(options.scope, background), loadedUrl)
      }
      catch {
        if (!isScheduleActive(requestId, currentGeneration))
          return

        options.handleFailure()
      }
      finally {
        if (isScheduleActive(requestId, currentGeneration))
          schedule(background, requestId)
      }
    }, Math.max(background.rotationInterval, MIN_ROTATION_INTERVAL))
  }

  return {
    schedule,
    stop,
  }
}
