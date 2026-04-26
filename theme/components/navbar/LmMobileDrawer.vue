<script lang="ts" setup>
import type { NavItem } from '../../types'
import type { BrowserTimeout } from '../../utils'
import { useRouter } from 'vue-router'
import { useNavActive } from '../../composables'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '../../utils'

const props = defineProps<{
  open: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  close: []
  openSearch: []
}>()

const router = useRouter()
// ACTIVE_PREVIEW_DURATION 给高亮一个极短的预览窗口，
// 避免点击后抽屉立刻离场，用户来不及感知当前目标项。
const ACTIVE_PREVIEW_DURATION = 80
// NAV_CLOSE_DURATION 必须和抽屉高度过渡时长保持一致，
// 否则跳转会打断收起动画。
const NAV_CLOSE_DURATION = 280

const HTTP_LINK_REGEX = /^https?:?\/\//

const { isActive, setPending, clearPending } = useNavActive()

let navigateTimer: BrowserTimeout | undefined

function closeDrawer() {
  emit('close')
}

function isExternalLink(item: NavItem) {
  return item.target === '_blank' || HTTP_LINK_REGEX.test(item.link)
}

function handleItemClick(item: NavItem) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return

  setPending(item.link)

  clearBrowserTimeout(navigateTimer)

  navigateTimer = setBrowserTimeout(() => {
    closeDrawer()

    setBrowserTimeout(() => {
      if (isExternalLink(item)) {
        clearPending()
        currentWindow.open(item.link, item.target || '_blank', 'noopener')
        return
      }

      router.push(item.link).finally(() => {
        clearPending()
      })
    }, NAV_CLOSE_DURATION)
  }, ACTIVE_PREVIEW_DURATION)
}

function beforeEnter(el: Element) {
  (el as HTMLElement).style.height = '0px'
}

function enter(el: Element) {
  const node = el as HTMLElement
  // 使用真实内容高度做展开，而不是写死 max-height，
  // 这样导航项数量变化时不需要同步改动画参数。
  node.style.height = `${node.scrollHeight}px`
}

function afterEnter(el: Element) {
  (el as HTMLElement).style.height = 'auto'
}

function beforeLeave(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.scrollHeight}px`
}

function leave(el: Element) {
  const node = el as HTMLElement

  // 强制触发一次回流，确保浏览器接收到“当前高度 -> 0”的过渡起点。
  void node.offsetHeight
  node.style.height = '0px'
}
</script>

<template>
  <Transition
    name="lm-mobile-nav"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
  >
    <div
      v-if="props.open"
      class="lm-mobile-nav-panel w-full relative z-[calc(var(--lm-z-nav)+1)] overflow-hidden md:hidden"
    >
      <nav class="flex flex-col" aria-label="Mobile navigation">
        <button
          v-for="item in props.items"
          :key="item.link"
          type="button"
          class="lm-mobile-nav-item"
          :class="isActive(item.link)
            ? 'text-[var(--lm-c-brand)] bg-[color-mix(in_srgb,var(--lm-c-brand-soft)_52%,transparent)]'
            : 'text-[var(--lm-c-text-secondary)] hover:text-[var(--lm-c-brand)]'"
          @click="handleItemClick(item)"
        >
          <span v-if="item.icon" :class="item.icon" />
          {{ item.text }}
        </button>
      </nav>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-mobile-nav-panel {
  @include lm-surface-panel;

  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
  margin-top: -1px;
  transform-origin: top center;
  box-shadow: 0 18px 36px rgb(15 23 42 / 0.16);
}

.lm-mobile-nav-item {
  @apply text-sm px-4 py-3 border-b border-[var(--lm-c-divider)] no-underline inline-flex gap-2.5 min-h-11 items-center transition-[color,background-color] duration-220 ease-out last:border-b-0;
}

.lm-mobile-nav-enter-active,
.lm-mobile-nav-leave-active {
  overflow: hidden;
  transition: height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
