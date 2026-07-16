<script lang="ts" setup>
import type { BrowserTimeout } from '../../shared/browser'
import type { NavItem } from '../../types'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { resolveInternalNavRoute, shouldOpenNavLinkWithWindow } from '../../features/navigation'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from '../../shared/browser'

const props = defineProps<{
  open: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  close: []
  openSearch: []
}>()

const { t } = useI18n()
const router = useRouter()
/**
 * 导航目标高亮的预览时长，避免抽屉立刻离场导致用户无法感知目标项。
 */
const ACTIVE_PREVIEW_DURATION = 80

/**
 * 抽屉收起动画时长，延迟跳转以免导航打断离场过渡。
 */
const NAV_CLOSE_DURATION = 280

let navigateTimer: BrowserTimeout | undefined

/** 通知布局关闭移动端导航抽屉。 */
function closeDrawer() {
  emit('close')
}

/**
 * 预览目标项高亮，关闭抽屉后按链接类型完成导航。
 *
 * @param item - 用户点击的导航项。
 */
function handleItemClick(item: NavItem) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return

  clearBrowserTimeout(navigateTimer)

  navigateTimer = setBrowserTimeout(() => {
    closeDrawer()

    setBrowserTimeout(() => {
      if (shouldOpenNavLinkWithWindow(item)) {
        currentWindow.open(item.link, item.target || '_blank', 'noopener')
        return
      }

      router.push(resolveInternalNavRoute(item.link))
    }, NAV_CLOSE_DURATION)
  }, ACTIVE_PREVIEW_DURATION)
}

/**
 * 在抽屉进入过渡前将高度归零。
 *
 * @param el - 执行过渡的抽屉元素。
 */
function beforeEnter(el: Element) {
  (el as HTMLElement).style.height = '0px'
}

/**
 * 将抽屉高度过渡到真实内容高度。
 *
 * @param el - 执行过渡的抽屉元素。
 */
function enter(el: Element) {
  const node = el as HTMLElement
  // 使用真实内容高度做展开，而不是写死 max-height，
  // 这样导航项数量变化时不需要同步改动画参数。
  node.style.height = `${node.scrollHeight}px`
}

/**
 * 在抽屉进入过渡结束后恢复自适应高度。
 *
 * @param el - 完成进入过渡的抽屉元素。
 */
function afterEnter(el: Element) {
  (el as HTMLElement).style.height = 'auto'
}

/**
 * 在抽屉离开前固定当前内容高度，建立收起过渡起点。
 *
 * @param el - 即将执行离开过渡的抽屉元素。
 */
function beforeLeave(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.scrollHeight}px`
}

/**
 * 强制建立离开过渡起点后将抽屉高度收至零。
 *
 * @param el - 执行离开过渡的抽屉元素。
 */
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
      class="lm-mobile-nav-panel w-full relative z-[var(--lm-z-drawer)] overflow-hidden md:hidden"
    >
      <nav class="flex flex-col" :aria-label="t('button.mobileNav')">
        <LmMobileNavGroup
          v-for="item in props.items"
          :key="item.link"
          :item="item"
          @navigate="handleItemClick"
        />
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

.lm-mobile-nav-enter-active,
.lm-mobile-nav-leave-active {
  overflow: hidden;
  transition: height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
