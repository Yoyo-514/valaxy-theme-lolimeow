<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHomePaginationScrollBehavior, useLayoutShell } from '../../composables'

defineProps<{
  hideFooter?: boolean
}>()

const router = useRouter()
const {
  closeDrawer,
  closeSearch,
  headerVisible,
  isDrawerOpen,
  isSearchOpen,
  navItems,
  openSearch,
  showGlobalNotice,
  toggleDrawer,
} = useLayoutShell()

useHomePaginationScrollBehavior(router)
</script>

<template>
  <div class="min-h-screen antialiased relative isolate">
    <LmBackgroundLayer />

    <button
      v-if="isDrawerOpen"
      type="button"
      class="lm-mobile-drawer-backdrop"
      aria-label="关闭移动端导航"
      @click="closeDrawer"
    />

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

    <div v-if="showGlobalNotice" class="lm-global-notice">
      <LmNotice />
    </div>

    <main class="w-full relative z-10">
      <slot />
    </main>

    <LmHelper />

    <div v-if="!hideFooter" class="relative z-10">
      <LmFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lm-mobile-drawer-backdrop {
  @apply fixed inset-0 z-15 border-0 bg-transparent p-0 md:hidden;
}

.lm-global-notice {
  @apply relative z-10 mx-auto w-full max-w-6xl pt-12 px-4 sm:px-6 xl:px-0;
}

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
