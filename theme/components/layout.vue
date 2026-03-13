<script setup lang="ts">
import { computed } from 'vue'
import { useMobileDrawer, useNavbarVisibility, useSearchModal, useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()

const navItems = computed(() => themeConfig.value.navbar.filter(item => item.text))
const { isOpen: isDrawerOpen, close: closeDrawer, toggle: toggleDrawer } = useMobileDrawer()
const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchModal()

const { visible } = useNavbarVisibility(themeConfig.value.navbarOptions?.autoHide ?? true)

const headerVisible = computed(() => {
  return isDrawerOpen.value || isSearchOpen.value || visible.value
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

    <main class="w-full relative z-10">
      <slot />
    </main>

    <LmHelper />

    <div class="relative z-10">
      <LmFooter />
    </div>
  </div>
</template>
