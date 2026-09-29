<script setup lang="ts">
import { useResizeObserver, useWindowScroll, useWindowSize } from '@vueuse/core'
import { computed, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDocumentBody, getDocumentElement, getWindow, prefersReducedMotion } from '../shared/browser'

const { t } = useI18n()
const { y } = useWindowScroll()
const { height: viewportHeight } = useWindowSize({ initialHeight: 0 })
const documentBody = shallowRef<HTMLElement>()
const documentHeight = ref(0)
const shapeId = `${useId()}-helper-cat`
const clipId = `${shapeId}-progress`

/** 内容加载、折叠或视口变化后重新测量可滚动高度。 */
function measureDocument() {
  documentHeight.value = getDocumentElement()?.scrollHeight ?? 0
}

onMounted(() => {
  documentBody.value = getDocumentBody()
  measureDocument()
})
useResizeObserver(documentBody, measureDocument)
watch(viewportHeight, measureDocument)

// 首屏保持安静；整只猫头共用同一条进度水平线。
const showBackToTop = computed(() => y.value > 120)
const scrollProgress = computed(() => {
  const maxScroll = documentHeight.value - viewportHeight.value
  return maxScroll > 0 ? Math.min(1, Math.max(0, y.value / maxScroll)) : 0
})
const fillHeight = computed(() => 48 * scrollProgress.value)
const buttonTitle = computed(() => `${t('button.backToTop')} · ${Math.round(scrollProgress.value * 100)}%`)

/** 按用户动态效果偏好返回顶部。 */
function backToTop() {
  getWindow()?.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
}
</script>

<template>
  <div class="lm-helper-stage">
    <Transition name="lm-helper-cat">
      <button
        v-if="showBackToTop"
        class="lm-helper-cat"
        type="button"
        :aria-label="t('button.backToTop')"
        :title="buttonTitle"
        @click="backToTop"
      >
        <svg class="lm-helper-cat__svg" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <g :id="shapeId">
              <path class="lm-helper-cat__ear lm-helper-cat__ear--left" d="m11 31-1-16q-1-6 4-3l14 13Z" />
              <path class="lm-helper-cat__ear lm-helper-cat__ear--right" d="m36 25 14-13q5-3 4 3l-1 16Z" />
              <path d="M5 36c0-10 11-16 27-16s27 6 27 16v3c0 12-11 19-27 19S5 51 5 39Z" />
            </g>
            <path :id="`${shapeId}-arrow`" d="m24 37 8-8 8 8m-8-7v17" />
            <clipPath :id="clipId" clipPathUnits="userSpaceOnUse">
              <rect x="0" :y="58 - fillHeight" width="64" :height="fillHeight" />
            </clipPath>
          </defs>
          <use :href="`#${shapeId}`" class="lm-helper-cat__base" />
          <use :href="`#${shapeId}`" class="lm-helper-cat__progress" :clip-path="`url(#${clipId})`" />
          <use :href="`#${shapeId}-arrow`" class="lm-helper-cat__arrow" />
          <use :href="`#${shapeId}-arrow`" class="lm-helper-cat__arrow lm-helper-cat__arrow--filled" :clip-path="`url(#${clipId})`" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.lm-helper-stage {
  @apply fixed right-4 z-[var(--lm-z-floating)] sm:right-6;
  bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
}

.lm-helper-cat {
  @apply inline-flex h-14 w-14 cursor-pointer items-center justify-center border-none bg-transparent p-0;
  border-radius: var(--lm-radius-md);
  filter: drop-shadow(0 4px 7px rgb(15 23 42 / 0.2));
}

.lm-helper-cat:focus-visible {
  outline: 2px solid var(--lm-c-primary-border-strong);
  outline-offset: 3px;
}

.lm-helper-cat__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.lm-helper-cat__base {
  fill: var(--lm-c-bg-base);
}

.lm-helper-cat__progress {
  fill: var(--lm-c-primary-base);
}

.lm-helper-cat__arrow {
  fill: none;
  stroke: var(--lm-c-text-primary);
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lm-helper-cat__arrow--filled {
  stroke: var(--lm-c-primary-on-solid);
}

.lm-helper-cat__ear {
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.lm-helper-cat__ear--left {
  transform-origin: 17px 26px;
}

.lm-helper-cat__ear--right {
  transform-origin: 47px 26px;
}

@media (hover: hover) {
  .lm-helper-cat:hover .lm-helper-cat__ear--left {
    transform: rotate(-9deg);
  }

  .lm-helper-cat:hover .lm-helper-cat__ear--right {
    transform: rotate(9deg);
  }
}

.lm-helper-cat-enter-active,
.lm-helper-cat-leave-active {
  transition: opacity 160ms ease-out;
}

.lm-helper-cat-enter-from,
.lm-helper-cat-leave-to {
  opacity: 0;
}

@media (min-width: 1280px) {
  .lm-helper-stage {
    bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-helper-cat .lm-helper-cat__ear,
  .lm-helper-cat:hover .lm-helper-cat__ear,
  .lm-helper-cat-enter-active,
  .lm-helper-cat-leave-active {
    transition: none;
    transform: none;
  }
}
</style>
