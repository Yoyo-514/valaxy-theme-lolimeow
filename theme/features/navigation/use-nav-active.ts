import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isSectionMatch, normalizePath } from './navigation-path'

/** 导航激活态直接跟随路由，抽屉预览态由抽屉自身持有。 */
export function useNavActive() {
  const route = useRoute()
  const currentPath = computed(() => normalizePath(route.path))
  function isActive(link: string) {
    return isSectionMatch(currentPath.value, normalizePath(link))
  }
  return { currentPath, activePath: currentPath, isActive }
}
