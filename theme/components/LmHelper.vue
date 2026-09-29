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
const fillHeight = computed(() => 50 * scrollProgress.value)
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
            <path
              :id="shapeId"
              d="M8.5 22.7C5.9 19.5 5.7 15.4 8.7 10.4C10.2 8.2 15.9 9.5 20.9 12.7C27.2 11.1 35.6 11.5 42.2 12C45.6 10.5 51.4 7.5 54 8.8C57.2 10.3 58.2 16.1 56.9 21.9C59.1 26.5 61 32.9 59.4 39.7C57.2 48.9 45.6 54.7 32.1 54.4C18.6 54.3 8.1 50.8 5.2 41C3.1 34 4.8 28.5 8.5 22.7Z"
            />
            <path :id="`${shapeId}-arrow`" d="m24 39 8-8 8 8" />
            <clipPath :id="clipId" clipPathUnits="userSpaceOnUse">
              <rect x="0" :y="56 - fillHeight" width="64" :height="fillHeight" />
            </clipPath>
          </defs>
          <use :href="`#${shapeId}`" class="lm-helper-cat__base" />
          <use :href="`#${shapeId}`" class="lm-helper-cat__progress" :clip-path="`url(#${clipId})`" />
          <use :href="`#${shapeId}`" class="lm-helper-cat__outline" />
          <use :href="`#${shapeId}-arrow`" class="lm-helper-cat__arrow" />
          <use :href="`#${shapeId}-arrow`" class="lm-helper-cat__arrow lm-helper-cat__arrow--filled" :clip-path="`url(#${clipId})`" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.lm-helper-stage {
  @apply fixed right-4 z-[var(--lm-z-floating)] sm:right-6 md:right-[1.6rem] xl:right-6;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
}

.lm-helper-cat {
  @apply inline-flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent p-0 xl:h-14 xl:w-14;
  border-radius: var(--lm-radius-md);
  filter: drop-shadow(0 2px 3px rgb(15 23 42 / 0.12));
  transition: transform 180ms ease-out;
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
  fill: color-mix(in srgb, var(--lm-surface-panel-bg) 98%, var(--lm-c-bg-base));
}

.lm-helper-cat__outline {
  fill: none;
  stroke: color-mix(in srgb, var(--lm-c-border-hover) 88%, white 10%);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
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

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .lm-helper-cat:hover {
    transform: translateY(-3px);
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

@media (max-width: 1279px) {
  :global(body:has(.lm-toc-mobile__trigger) .lm-helper-stage) {
    bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-helper-cat,
  .lm-helper-cat-enter-active,
  .lm-helper-cat-leave-active {
    transition: none;
    transform: none;
  }
}
</style>
