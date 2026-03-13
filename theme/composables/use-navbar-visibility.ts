import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 顶栏显隐控制
 *
 * 规则保持尽量简单：
 * 1. 不启用 auto hide 时始终显示
 * 2. 接近页面顶部时始终显示
 * 3. 向下滚动时隐藏，向上滚动时显示
 *
 * 这里故意不加入节流和复杂状态机，先保证行为稳定、易于理解。
 */
export function useNavbarVisibility(enabled = true) {
  const visible = ref(true)
  const lastScrollTop = ref(0)
  const startHideOffset = 96
  const minDelta = 8

  function updateVisibility() {
    if (!enabled) {
      visible.value = true
      return
    }

    const currentTop = window.scrollY || 0
    const delta = currentTop - lastScrollTop.value

    // 在页面顶部和首屏过渡区域内都保持显示，避免刚离开首屏就收起。
    if (currentTop < startHideOffset) {
      visible.value = true
      lastScrollTop.value = currentTop
      return
    }

    // 只有滚动幅度足够明显时才切换状态，避免触摸板微小抖动造成闪烁。
    if (Math.abs(delta) < minDelta)
      return

    if (delta > 0)
      visible.value = false
    else
      visible.value = true

    lastScrollTop.value = currentTop
  }

  onMounted(() => {
    lastScrollTop.value = window.scrollY || 0
    window.addEventListener('scroll', updateVisibility, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateVisibility)
  })

  return {
    visible,
  }
}
