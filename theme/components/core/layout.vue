<script setup lang="ts">
import { useCssVar } from '@vueuse/core'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileDrawer, useNavbarVisibility, useSearchModal, useThemeConfig } from '../../composables'

const HOME_PAGINATION_PATH_RE = /^\/(?:page\/\d+\/?)?$/
const NAVBAR_SCROLL_LOCK_ATTR = 'data-lm-navbar-scroll-lock'

const themeConfig = useThemeConfig()
const route = useRoute()
const router = useRouter()
const pageSurfaceTop = useCssVar('--lm-page-surface-top', document.documentElement)

const navItems = computed(() => themeConfig.value.navbar.filter(item => item.text))
const { isOpen: isDrawerOpen, close: closeDrawer, toggle: toggleDrawer } = useMobileDrawer()
const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchModal()

const { visible } = useNavbarVisibility(themeConfig.value.navbarOptions?.autoHide ?? true)
const isHomeLayout = computed(() => route.meta.layout === 'home')

// 头部壳层的显示状态必须同时考虑 drawer/search 的打开状态。
// 否则导航虽然被滚动逻辑隐藏了，但抽屉或搜索层还在屏幕上，会出现“壳层和浮层脱节”。
const headerVisible = computed(() => {
  return isDrawerOpen.value || isSearchOpen.value || visible.value
})

function isHomePaginationPath(path: string) {
  return HOME_PAGINATION_PATH_RE.test(path)
}

function lockNavbarScrollReaction() {
  if (typeof document === 'undefined')
    return

  const root = document.documentElement
  root.setAttribute(NAVBAR_SCROLL_LOCK_ATTR, 'true')

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.removeAttribute(NAVBAR_SCROLL_LOCK_ATTR)
    })
  })
}

watch(
  isHomeLayout,
  (value) => {
    if (!value)
      pageSurfaceTop.value = '0px'
  },
  { immediate: true },
)

onMounted(() => {
  const previousScrollBehavior = router.options.scrollBehavior

  router.options.scrollBehavior = (to, from, savedPosition) => {
    if (savedPosition)
      return savedPosition

    if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
      lockNavbarScrollReaction()
      return {
        el: '#lm-home-content',
        top: 0,
      }
    }

    if (previousScrollBehavior)
      return previousScrollBehavior(to, from, savedPosition)

    if (to.path !== from.path)
      return { top: 0 }
  }
})
</script>

<template>
  <div class="min-h-screen antialiased relative isolate">
    <LmBackgroundLayer />

    <div
      class="transition-transform duration-250 ease-in-out inset-x-0 top-0 fixed z-20"
      :class="headerVisible ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="w-full">
        <LmNav
          :drawer-open="isDrawerOpen"
          :items="navItems"
          @toggle-mobile-drawer="toggleDrawer"
          @open-search="openSearch"
        />
        <LmMobileDrawer
          :open="isDrawerOpen"
          :items="navItems"
          @close="closeDrawer"
          @open-search="openSearch"
        />
      </div>
    </div>

    <LmSearchModal
      :open="isSearchOpen"
      @close="closeSearch"
    />

    <div class="lm-page-surface-layer" />

    <main class="w-full relative z-10">
      <slot />
    </main>

    <LmHelper />

    <div class="relative z-10">
      <LmFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lm-page-surface-layer {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--lm-page-surface-top, 0px);
  bottom: 0;
  z-index: 5;
  pointer-events: none;

  background: color-mix(in srgb, var(--lm-c-bg-glass) 62%, transparent);
  backdrop-filter: blur(6px) saturate(1.04);
  -webkit-backdrop-filter: blur(6px) saturate(1.04);
}
</style>
