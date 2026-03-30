import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

export function useSearchModal() {
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

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
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
