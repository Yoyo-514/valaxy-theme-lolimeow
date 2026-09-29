import type { Router, RouterScrollBehavior } from 'vue-router'
import { isHomePaginationPath, lockNavbarScrollReaction } from '../../navigation'
import { getHomeHistoryState } from './home-history-state'
import { createHomeScrollTasks } from './home-scroll-task'

/** 单个 Router 的稳定滚动行为控制器。 */
interface HomePaginationScrollController {
  scrollBehavior: RouterScrollBehavior
}

/** Vite HMR 在模块替换间保留的最小数据接口。 */
interface HotModuleState {
  data: Record<string, unknown>
}

const hotModule = (import.meta as ImportMeta & { hot?: HotModuleState }).hot
const persistedControllers = hotModule?.data.lolimeowHomePaginationScrollControllers

/** 按 Router 隔离安装状态；弱键不会阻止 SSR 请求级 Router 被回收。 */
const homePaginationScrollControllers
  = (persistedControllers instanceof WeakMap
    ? persistedControllers
    : new WeakMap()) as WeakMap<Router, HomePaginationScrollController>

if (hotModule)
  hotModule.data.lolimeowHomePaginationScrollControllers = homePaginationScrollControllers

/**
 * 为首页分页路由稳定安装滚动行为，并在分页切换时短暂锁定导航栏滚动响应。
 *
 * 同一 Router 只安装一次；首页历史恢复通过显式导航代次与文章流握手，不使用固定超时。
 *
 * @remarks
 * 接管语义：本函数会覆盖 `router.options.scrollBehavior`。安装前的旧滚动行为
 * 会保留为非首页导航的委托目标（无 savedPosition 时回退调用），但在本函数之后
 * 安装的其它滚动行为提供方（用户站点配置或 addon）会完全替换主题的接管逻辑；
 * WeakMap 保证同一 Router 上主题只安装一次，先到者生效。
 *
 * @param router - 当前应用的 Vue Router 实例。
 */
export function useHomePaginationScrollBehavior(router: Router) {
  if (homePaginationScrollControllers.has(router))
    return

  const { beginHomeHistoryRestoration, homeHistoryRestorationState, settleHomeHistoryRestoration } = getHomeHistoryState(router)
  const previousScrollBehavior = router.options.scrollBehavior
  let releaseNavbarScrollLock: ReturnType<typeof lockNavbarScrollReaction> | undefined
  let navigationGeneration = 0
  const { cancelActiveScrollTask, coordinateScrollResult } = createHomeScrollTasks(() => navigationGeneration, settleHomeHistoryRestoration)

  const routeGenerations = new WeakMap<object, { navigation: number, restoration?: number }>()

  /** 释放当前导航栏锁。 */
  const releaseActiveNavbarScrollLock = () => {
    releaseNavbarScrollLock?.()
    releaseNavbarScrollLock = undefined
  }

  /**
   * 开始新的导航代次，并同步取消上一代仍持有的滚动副作用。
   *
   * @returns 新导航代次。
   */
  const beginNavigationGeneration = () => {
    cancelActiveScrollTask()
    releaseActiveNavbarScrollLock()
    navigationGeneration += 1
    return navigationGeneration
  }

  router.beforeEach((to) => {
    const currentNavigationGeneration = beginNavigationGeneration()
    const generations = { navigation: currentNavigationGeneration, restoration: undefined as number | undefined }
    routeGenerations.set(to, generations)

    const pendingHomeGeneration = homeHistoryRestorationState.value.pending
      ? homeHistoryRestorationState.value.generation
      : undefined

    if (pendingHomeGeneration !== undefined)
      settleHomeHistoryRestoration(pendingHomeGeneration)

    if (isHomePaginationPath(to.path)) {
      const homeRestorationGeneration = beginHomeHistoryRestoration(to.fullPath)
      generations.restoration = homeRestorationGeneration
    }
  })

  /** 导航失败和异常共用清理出口；旧代次不能取消新导航。 */
  function finishFailedNavigation(to: object) {
    const generations = routeGenerations.get(to)
    if (generations?.navigation === navigationGeneration) {
      cancelActiveScrollTask()
      releaseActiveNavbarScrollLock()
    }
    if (generations?.restoration !== undefined)
      settleHomeHistoryRestoration(generations.restoration)
    routeGenerations.delete(to)
  }

  router.afterEach((to, _from, failure) => {
    if (failure)
      finishFailedNavigation(to)
  })
  router.onError((_error, to) => finishFailedNavigation(to))

  /**
   * 处理首页分页滚动定位，并将非首页导航委托给安装前的滚动行为。
   *
   * @param to - 即将进入的标准化路由。
   * @param from - 当前离开的标准化路由。
   * @param savedPosition - 浏览器历史导航保存的滚动位置。
   * @returns Vue Router 可消费的滚动位置或旧滚动行为结果。
   */
  const handleHomePaginationScroll: RouterScrollBehavior = function handleHomePaginationScroll(
    to,
    from,
    savedPosition,
  ) {
    const taskGeneration = routeGenerations.get(to)?.navigation ?? beginNavigationGeneration()

    if (taskGeneration !== navigationGeneration)
      return false

    cancelActiveScrollTask()
    releaseActiveNavbarScrollLock()

    const homeRestorationGeneration = isHomePaginationPath(to.path)
      ? routeGenerations.get(to)?.restoration ?? beginHomeHistoryRestoration(to.fullPath)
      : undefined

    if (savedPosition) {
      return coordinateScrollResult(
        savedPosition,
        taskGeneration,
        homeRestorationGeneration,
        true,
      )
    }

    /** 解析无 savedPosition 时沿用的滚动结果。 */
    const resolveDefaultScrollResult = (): ReturnType<RouterScrollBehavior> => {
      if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
        releaseNavbarScrollLock = lockNavbarScrollReaction({ deferFrames: 2 })
        return to.hash
          ? { el: to.hash, top: 0 }
          : { top: 0 }
      }

      if (previousScrollBehavior)
        return previousScrollBehavior(to, from, savedPosition)

      if (to.path !== from.path)
        return { top: 0 }
    }

    let scrollResult: ReturnType<RouterScrollBehavior>

    try {
      scrollResult = resolveDefaultScrollResult()
    }
    catch (error) {
      if (homeRestorationGeneration !== undefined)
        settleHomeHistoryRestoration(homeRestorationGeneration)

      throw error
    }

    if (homeRestorationGeneration === undefined)
      return scrollResult

    // 即使没有 savedPosition，也在 Router 消费结果后按当前代次释放 Observer。
    return coordinateScrollResult(
      scrollResult,
      taskGeneration,
      homeRestorationGeneration,
      false,
    )
  }

  homePaginationScrollControllers.set(router, {
    scrollBehavior: handleHomePaginationScroll,
  })
  router.options.scrollBehavior = handleHomePaginationScroll
}
