import { onBeforeUnmount, onMounted, ref } from 'vue'

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

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape')
      close()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
