import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const pendingLink = ref('')

const PATHNAME_REGEX = /[?#]/
const TRAILING_SLASH_REGEX = /\/+$/

function normalizePath(path: string) {
  if (!path)
    return '/'

  const [pathname] = path.split(PATHNAME_REGEX)
  if (!pathname)
    return '/'

  return pathname !== '/' ? pathname.replace(TRAILING_SLASH_REGEX, '') : '/'
}

function isSectionMatch(current: string, target: string) {
  if (target === '/')
    return current === '/'

  return current === target || current.startsWith(`${target}/`)
}

export function useNavActive() {
  const route = useRoute()

  const currentPath = computed(() => normalizePath(route.path))
  // pendingLink 用来覆盖“抽屉先收起、再跳转”的时间窗，
  // 让移动端在动画期间也能先高亮目标导航项。
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
