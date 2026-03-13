import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const pendingLink = ref('')

function normalizePath(path: string) {
  if (!path)
    return '/'

  const [pathname] = path.split(/[?#]/)
  if (!pathname)
    return '/'

  return pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'
}

function isSectionMatch(current: string, target: string) {
  if (target === '/')
    return current === '/'

  return current === target || current.startsWith(`${target}/`)
}

export function useNavActive() {
  const route = useRoute()

  const currentPath = computed(() => normalizePath(route.path))
  const activePath = computed(() => normalizePath(pendingLink.value || route.path))

  function isActive(link: string) {
    return isSectionMatch(activePath.value, normalizePath(link))
  }

  function setPending(link: string) {
    pendingLink.value = link
  }

  function clearPending() {
    pendingLink.value = ''
  }

  return {
    currentPath,
    activePath,
    isActive,
    setPending,
    clearPending,
  }
}
