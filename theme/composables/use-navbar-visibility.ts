import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 顶栏显隐控制。
 *
 * 这里刻意保持简单规则，而不是引入节流和复杂状态机：
 * 1. autoHide 关闭时始终显示
 * 2. 顶部缓冲区内始终显示，避免刚离开首屏就收起
 * 3. 只有滚动幅度足够明显时才根据方向切换状态
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

    // 顶部缓冲区内强制显示，避免首屏附近轻微滚动时出现闪烁感。
    if (currentTop < startHideOffset) {
      visible.value = true
      lastScrollTop.value = currentTop
      return
    }

    // 忽略触摸板和鼠标滚轮的微小抖动，只响应明确的滚动方向。
    if (Math.abs(delta) < minDelta)
      return

    visible.value = delta <= 0
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
