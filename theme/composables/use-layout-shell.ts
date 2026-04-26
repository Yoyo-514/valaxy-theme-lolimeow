import { useCssVar } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDocumentElement } from '../utils'
import { useThemeConfig } from './config'
import { useMobileDrawer } from './use-mobile-drawer'
import { useNavbarVisibility } from './use-navbar-visibility'
import { useSearchModal } from './use-search-modal'

export function useLayoutShell() {
  const themeConfig = useThemeConfig()
  const route = useRoute()
  const root = getDocumentElement()
  const pageSurfaceTop = useCssVar('--lm-page-surface-top', root)
  const navbarOffset = useCssVar('--lm-navbar-offset', root)

  const navItems = computed(() => themeConfig.value.navbar.filter(item => item.text))
  const { isOpen: isDrawerOpen, close: closeDrawer, toggle: toggleDrawer } = useMobileDrawer()
  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchModal()
  const { visible } = useNavbarVisibility(themeConfig.value.navbarOptions?.autoHide ?? true)
  const isHomeLayout = computed(() => route.meta.layout === 'home')

  const showGlobalNotice = computed(() => {
    const notice = themeConfig.value.notice
    return !isHomeLayout.value && notice.enable && notice.scope === 'global' && Boolean(notice.message?.trim())
  })

  // 头部壳层的显示状态必须同时考虑 drawer/search 的打开状态。
  // 否则导航虽然被滚动逻辑隐藏了，但抽屉或搜索层还在屏幕上，会出现“壳层和浮层脱节”。
  const headerVisible = computed(() => {
    return isDrawerOpen.value || isSearchOpen.value || visible.value
  })

  watch(
    headerVisible,
    (value) => {
      navbarOffset.value = value ? '4.5rem' : '0.75rem'
    },
    { immediate: true },
  )

  watch(
    isHomeLayout,
    (value) => {
      if (!value)
        pageSurfaceTop.value = '0px'
    },
    { immediate: true },
  )

  return {
    closeDrawer,
    closeSearch,
    headerVisible,
    isDrawerOpen,
    isSearchOpen,
    navItems,
    openSearch,
    showGlobalNotice,
    toggleDrawer,
  }
}
