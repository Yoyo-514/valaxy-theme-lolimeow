<script lang="ts" setup>
import type { NavItem } from '../../types'
import { useMediaQuery } from '@vueuse/core'
import { ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDrawerNavigation } from '../../features/navigation/drawer/use-drawer-navigation'
import { useModalFocusTrap } from '../../shared/browser'

const props = defineProps<{
  open: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const panelRef = ref<HTMLElement>()
const isDesktop = useMediaQuery('(min-width: 768px)')
const { select: handleItemClick, closeByUser: closeDrawerByUser, afterLeave } = useDrawerNavigation(toRef(props, 'open'), () => emit('close'))

useModalFocusTrap({
  container: panelRef,
  lockBodyScroll: true,
  onClose: closeDrawerByUser,
  open: toRef(props, 'open'),
})

watch([isDesktop, () => props.open], ([desktop, open]) => {
  if (desktop && open)
    closeDrawerByUser()
}, { immediate: true })

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
    @after-leave="afterLeave"
  >
    <div
      v-if="props.open"
      ref="panelRef"
      class="lm-mobile-nav-panel w-full relative z-[var(--lm-z-drawer)] overflow-hidden md:hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="t('button.mobileNav')"
      tabindex="-1"
    >
      <nav class="flex flex-col" :aria-label="t('button.mobileNav')">
        <LmMobileNavGroup
          v-for="item in props.items"
          :key="item.link"
          :item="item"
          @navigate="handleItemClick"
        />
      </nav>

      <button
        type="button"
        class="lm-mobile-nav-panel__close"
        :aria-label="t('button.closeMobileNav')"
        @click="closeDrawerByUser"
      >
        {{ t('button.closeMobileNav') }}
      </button>
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

.lm-mobile-nav-panel__close {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  &:focus-visible {
    @apply right-3 top-2 z-1 h-9 w-auto rounded-full px-3 text-sm;

    clip: auto;
    margin: 0;
    overflow: visible;
    background: var(--lm-c-bg-glass);
    color: var(--lm-c-text-primary);
    border: 1px solid var(--lm-c-primary-base);
  }
}

.lm-mobile-nav-enter-active,
.lm-mobile-nav-leave-active {
  overflow: hidden;
  transition: height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .lm-mobile-nav-enter-active,
  .lm-mobile-nav-leave-active {
    transition: none;
  }
}
</style>
