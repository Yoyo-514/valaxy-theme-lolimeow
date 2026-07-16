import type { Router, RouterScrollBehavior } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { isHomePaginationPath, lockNavbarScrollReaction } from '../navigation'

/**
 * 为首页分页路由安装滚动行为，并在分页切换时短暂锁定导航栏滚动响应。
 *
 * 该组合式函数会全局覆写路由器的滚动行为；卸载时仅在当前行为仍由本实例安装时恢复旧行为，
 * 避免覆盖生命周期更晚的安装者。
 *
 * @param router - 当前应用的 Vue Router 实例。
 */
export function useHomePaginationScrollBehavior(router: Router) {
  let previousScrollBehavior: RouterScrollBehavior | undefined
  let installedScrollBehavior: RouterScrollBehavior | undefined
  let releaseNavbarScrollLock: ReturnType<typeof lockNavbarScrollReaction> | undefined

  onMounted(() => {
    previousScrollBehavior = router.options.scrollBehavior

    /**
     * 处理首页分页滚动定位，并将非首页导航委托给安装前的滚动行为。
     * 每次新导航都会先释放并清空上一轮导航栏锁，再按当前导航决定是否创建新锁。
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
      releaseNavbarScrollLock?.()
      releaseNavbarScrollLock = undefined

      if (savedPosition)
        return savedPosition

      if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
        releaseNavbarScrollLock = lockNavbarScrollReaction({ deferFrames: 2 })

        if (to.hash) {
          return {
            el: to.hash,
            top: 0,
          }
        }

        return { top: 0 }
      }

      if (previousScrollBehavior)
        return previousScrollBehavior(to, from, savedPosition)

      if (to.path !== from.path)
        return { top: 0 }
    }

    installedScrollBehavior = handleHomePaginationScroll
    router.options.scrollBehavior = installedScrollBehavior
  })

  onUnmounted(() => {
    releaseNavbarScrollLock?.()
    releaseNavbarScrollLock = undefined

    if (installedScrollBehavior && router.options.scrollBehavior === installedScrollBehavior)
      router.options.scrollBehavior = previousScrollBehavior
  })
}
