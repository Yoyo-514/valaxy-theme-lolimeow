import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 移动端导航展开状态。
 *
 * 这里只维护菜单开合本身：
 * 1. 打开 / 关闭 / 切换
 * 2. 路由切换后自动收起
 */
export function useMobileDrawer() {
  const route = useRoute()
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  watch(() => route.fullPath, close)

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
