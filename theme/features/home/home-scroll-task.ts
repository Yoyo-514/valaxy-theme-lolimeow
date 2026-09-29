import type { RouterScrollBehavior } from 'vue-router'
import { nextTick } from 'vue'
import { settleHomeHistoryRestoration } from './home-history-state'

type RouterScrollResult = Awaited<ReturnType<RouterScrollBehavior>>

/** 等待中的单次滚动行为任务。 */
interface PendingScrollTask {
  /** 任务所属导航代次。 */
  generation: number
  /** 本任务负责完成的首页恢复代次。 */
  homeRestorationGeneration?: number
  /** 当前等待或释放阶段持有的动画帧 ID。 */
  frameId?: number
  /** Promise 是否已经返回滚动结果。 */
  settled: boolean
  /** 以安全滚动结果完成任务。 */
  resolve: (result: RouterScrollResult) => void
  /** 以原始错误拒绝任务。 */
  reject: (reason?: unknown) => void
}

/** 管理单个 Router 的可取消滚动任务；导航代次由调用方维护。 */
export function createHomeScrollTasks(getNavigationGeneration: () => number) {
  let activeScrollTask: PendingScrollTask | undefined

  /**
   * 取消旧帧并让尚未返回结果的旧 Promise 以 false 安全完成。
   */
  const cancelActiveScrollTask = () => {
    const task = activeScrollTask

    if (!task)
      return

    if (task.frameId !== undefined && typeof window !== 'undefined')
      window.cancelAnimationFrame(task.frameId)

    if (!task.settled) {
      task.settled = true
      task.resolve(false)
    }

    if (task.homeRestorationGeneration !== undefined)
      settleHomeHistoryRestoration(task.homeRestorationGeneration)

    activeScrollTask = undefined
  }

  /**
   * 判断当前文档是否能可靠地产生动画帧。
   *
   * @returns 可见浏览器文档支持 RAF 时返回 true。
   */
  const canWaitForAnimationFrame = () => {
    return typeof window !== 'undefined'
      && typeof window.requestAnimationFrame === 'function'
      && typeof document !== 'undefined'
      && document.visibilityState !== 'hidden'
  }

  /**
   * 将滚动结果绑定到可取消导航任务，并在 Router 消费结果后的下一布局帧完成首页握手。
   *
   * @param result - 当前滚动行为将交给 Router 的结果或异步结果。
   * @param taskGeneration - 当前导航代次。
   * @param homeRestorationGeneration - 可选的首页恢复握手代次。
   * @param waitForRestoredLayout - 返回结果前是否先等待 nextTick 与一帧布局。
   * @returns 可由更新导航安全取消的滚动结果 Promise。
   */
  const coordinateScrollResult = (
    result: ReturnType<RouterScrollBehavior>,
    taskGeneration: number,
    homeRestorationGeneration: number | undefined,
    waitForRestoredLayout: boolean,
  ): Promise<RouterScrollResult> => {
    return new Promise<RouterScrollResult>((resolve, reject) => {
      const task: PendingScrollTask = {
        generation: taskGeneration,
        homeRestorationGeneration,
        settled: false,
        resolve,
        reject,
      }

      activeScrollTask = task

      /** 当前任务仍属于最新导航且没有被替换时才允许继续。 */
      const isTaskActive = () => {
        return activeScrollTask === task && getNavigationGeneration() === task.generation
      }

      /** 完成首页握手；异步滚动结果尚未完成时继续保留任务的取消能力。 */
      const releaseHomeRestoration = () => {
        if (!isTaskActive())
          return

        if (task.homeRestorationGeneration !== undefined)
          settleHomeHistoryRestoration(task.homeRestorationGeneration)

        task.homeRestorationGeneration = undefined

        if (task.settled)
          activeScrollTask = undefined
      }

      /**
       * 在下一帧释放握手；隐藏页签改用双微任务越过 Router 的 Promise 采纳层。
       */
      const scheduleHomeRestorationRelease = () => {
        if (task.homeRestorationGeneration === undefined)
          return

        if (!canWaitForAnimationFrame()) {
          Promise.resolve().then(() => Promise.resolve().then(releaseHomeRestoration))
          return
        }

        task.frameId = window.requestAnimationFrame(() => {
          task.frameId = undefined
          releaseHomeRestoration()
        })
      }

      /**
       * 返回滚动结果；savedPosition 在 Router 实际应用结果后的下一帧释放 Observer。
       */
      const finishWithResult = (scrollResult: RouterScrollResult) => {
        if (!isTaskActive())
          return

        task.settled = true
        task.resolve(scrollResult)

        if (task.homeRestorationGeneration === undefined) {
          activeScrollTask = undefined
          return
        }

        if (waitForRestoredLayout)
          scheduleHomeRestorationRelease()
      }

      /** 透传有效任务的错误，同时确保 Observer 不会永久停用。 */
      const failTask = (reason: unknown) => {
        if (!isTaskActive())
          return

        if (task.frameId !== undefined && typeof window !== 'undefined')
          window.cancelAnimationFrame(task.frameId)

        if (task.homeRestorationGeneration !== undefined)
          settleHomeHistoryRestoration(task.homeRestorationGeneration)

        activeScrollTask = undefined
        task.settled = true
        task.reject(reason)
      }

      /** 等待待委托结果，并进入 Router 消费与握手释放阶段。 */
      const resolveScrollResult = () => {
        Promise.resolve(result).then(finishWithResult, failTask)
      }

      if (!waitForRestoredLayout) {
        // 无 savedPosition 时独立释放握手，不受旧滚动行为异步结果是否结束影响。
        scheduleHomeRestorationRelease()
        resolveScrollResult()
        return
      }

      nextTick().then(() => {
        if (!isTaskActive())
          return

        // 后台标签页不会稳定触发 RAF；nextTick 后直接交还 savedPosition。
        if (!canWaitForAnimationFrame()) {
          resolveScrollResult()
          return
        }

        task.frameId = window.requestAnimationFrame(() => {
          task.frameId = undefined

          if (isTaskActive())
            resolveScrollResult()
        })
      }, failTask)
    })
  }

  return { cancelActiveScrollTask, coordinateScrollResult }
}
