<script lang="ts" setup>
import type { NavItem } from 'theme/types'
import { useAppStore, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useNavActive, useNavbarTools, useThemeConfig } from '../composables'

const props = defineProps<{
  drawerOpen: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  toggleMobileDrawer: []
  openSearch: []
}>()

const appStore = useAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const { isActive, clearPending } = useNavActive()
const { showSearch, showDarkToggle } = useNavbarTools()

// hamburgerLines 只负责把配置层的 classic / uneven 映射成几何宽度，
// 具体的开合动画仍然留在模板里，这样配置语义和动画语义不会耦在一起。
const hamburgerLines = computed(() => {
  if (themeConfig.value.navbarOptions?.hamburgerStyle === 'classic')
    return ['w-4', 'w-4', 'w-4']

  return ['w-4', 'w-3', 'w-4']
})
</script>

<template>
  <nav
    class="lm-nav flex flex-col w-full transition-transform duration-250 ease-in-out relative"
  >
    <div class="px-4 py-2 flex gap-3 w-full items-center sm:px-5">
      <RouterLink
        class="lm-nav-brand"
        to="/"
        :aria-label="siteConfig.title"
      >
        <img
          class="shrink-0 block"
          style="width: 40px; height: 28px"
          alt="logo"
          :src="siteConfig.favicon"
        >
        <span class="text-sm leading-[1.2] font-700 hidden sm:text-base md:inline">{{ siteConfig.title }}</span>
      </RouterLink>

      <div class="text-sm leading-6 ml-auto gap-5 hidden items-center md:flex">
        <template v-for="item in $props.items" :key="item.link">
          <AppLink
            class="lm-nav-link"
            :class="isActive(item.link)
              ? 'text-[var(--lm-c-brand)] opacity-92'
              : 'text-[var(--lm-c-text-secondary)] opacity-86'"
            :to="item.link"
            :target="item.target"
            :aria-current="isActive(item.link) ? 'page' : undefined"
            rel="noopener"
            @click="clearPending"
          >
            <span
              v-if="item.icon"
              class="text-[0.95em] opacity-84 inline-block"
              :class="item.icon"
            />
            {{ item.text }}
          </AppLink>
        </template>
      </div>

      <div class="ml-auto flex gap-2 items-center md:ml-3">
        <button
          v-if="showSearch"
          type="button"
          class="lm-nav-tool-btn"
          aria-label="Open Search"
          @click="emit('openSearch')"
        >
          <div i-ri-search-line />
        </button>

        <button
          v-if="showDarkToggle"
          type="button"
          class="lm-nav-tool-btn"
          aria-label="Toggle Dark Mode"
          @click="appStore.toggleDarkWithTransition"
        >
          <div v-if="!appStore.isDark" i-ri-sun-line />
          <div v-else i-ri-moon-line />
        </button>

        <button
          type="button"
          class="lm-nav-menu-btn"
          :aria-expanded="props.drawerOpen"
          aria-label="Toggle mobile menu"
          @click="emit('toggleMobileDrawer')"
        >
          <span class="flex flex-col gap-[3px] items-center justify-center">
            <span
              v-for="(lineClass, index) in hamburgerLines"
              :key="index"
              class="rounded-full bg-[var(--lm-c-text-primary)] h-[1.75px] block origin-center transition-all duration-250 ease-in-out"
              :class="[
                lineClass,
                props.drawerOpen && index === 0 ? 'translate-y-[5px] rotate-45 w-4' : '',
                props.drawerOpen && index === 1 ? 'opacity-0' : '',
                props.drawerOpen && index === 2 ? '-translate-y-[5px] -rotate-45 w-4' : '',
              ]"
            />
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../styles/mixins/surface' as *;

.lm-nav {
  @include lm-surface-nav;

  border-radius: 0;
  margin-top: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}

.lm-nav-brand {
  @apply text-[var(--lm-c-text-primary)] no-underline inline-flex gap-2 items-center;
}

.lm-nav-link {
  @apply no-underline inline-flex gap-1.5 items-center transition-[color,opacity] duration-250 ease-in-out hover:text-[var(--lm-c-brand-strong)];
}

.lm-nav-tool-btn {
  @apply text-[var(--lm-c-text-primary)] border border-[var(--lm-c-border)] rounded-full bg-[var(--lm-c-bg-glass)] inline-flex h-9 w-9 items-center justify-center transition-[border-color,background-color,transform] duration-220 ease-out hover:border-[var(--lm-c-brand)] hover:-translate-y-0.25;
}

.lm-nav-menu-btn {
  @apply text-[var(--lm-c-text-primary)] border border-[var(--lm-c-border)] rounded-full inline-flex h-9 w-9 items-center justify-center transition-[border-color,background-color,transform] duration-220 ease-out hover:border-[var(--lm-c-brand)] md:hidden hover:-translate-y-0.25;

  background: color-mix(in srgb, var(--lm-c-bg-glass) 72%, transparent);
}
</style>
