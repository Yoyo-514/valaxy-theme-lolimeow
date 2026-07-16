import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'
import { getWindow } from '../../shared/browser'

/**
 * 管理搜索弹窗的打开、关闭、切换状态及 Escape 键关闭行为。
 *
 * @returns 搜索弹窗状态与对应控制方法。
 */
export function useSearchModal() {
  const isOpen = ref(false)

  /** 打开搜索弹窗。 */
  function open() {
    isOpen.value = true
  }

  /** 关闭搜索弹窗。 */
  function close() {
    isOpen.value = false
  }

  /** 在打开与关闭状态之间切换搜索弹窗。 */
  function toggle() {
    isOpen.value = !isOpen.value
  }

  useEventListener(getWindow(), 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape')
      close()
  })

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
