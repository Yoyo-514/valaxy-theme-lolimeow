import type { Ref } from 'vue'
import type { BrowserTimeout } from '../../../shared/browser'
import type { NavItem } from '../../../types'
import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clearBrowserTimeout, getWindow, setBrowserTimeout, useReducedMotion } from '../../../shared/browser'
import { resolveInternalNavRoute, shouldOpenNavLinkWithWindow } from '../use-nav-item-state'

/** 站内导航在抽屉实际离场后执行；重开、手动关闭或其他导航都会取消待办。 */
export function useDrawerNavigation(open: Readonly<Ref<boolean>>, close: () => void) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  let previewTimer: BrowserTimeout | undefined
  let pending: NavItem | undefined
  let closingForNavigation = false

  function cancel() {
    clearBrowserTimeout(previewTimer)
    previewTimer = undefined
    pending = undefined
    closingForNavigation = false
  }

  function closeByUser() {
    cancel()
    close()
  }

  function afterLeave() {
    const item = pending
    if (!item || !closingForNavigation)
      return
    cancel()
    void router.push(resolveInternalNavRoute(item.link))
  }

  function closeForNavigation() {
    previewTimer = undefined
    closingForNavigation = true
    close()
    if (reducedMotion.value)
      afterLeave()
  }

  function select(item: NavItem) {
    cancel()
    if (shouldOpenNavLinkWithWindow(item)) {
      // 新窗口需要处于用户点击调用栈内，避免动画结束后被浏览器拦截。
      getWindow()?.open(item.link, item.target || '_blank', 'noopener')
      close()
      return
    }
    pending = item
    if (reducedMotion.value)
      closeForNavigation()
    else
      previewTimer = setBrowserTimeout(closeForNavigation, 80)
  }

  watch(open, (value) => {
    if (value || !closingForNavigation)
      cancel()
  }, { flush: 'sync' })
  watch(() => router.currentRoute.value.fullPath, cancel)
  watch(reducedMotion, (value) => {
    if (value && pending) {
      clearBrowserTimeout(previewTimer)
      closeForNavigation()
    }
  }, { flush: 'sync' })
  onBeforeUnmount(cancel)

  return { select, closeByUser, afterLeave }
}
