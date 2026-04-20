<script setup lang="ts">
import { useArticleTocState } from '@theme/composables'
import { removeDocumentClass, toggleDocumentClass } from '@theme/utils'
import { onBeforeUnmount, ref, watch } from 'vue'

const { items, visible, activeLink, handleClick } = useArticleTocState()
const open = ref(false)

function closePanel() {
  open.value = false
}

function togglePanel() {
  open.value = !open.value
}

function onSelect(event: MouseEvent) {
  handleClick(event)
  closePanel()
}

watch(open, (isOpen) => {
  toggleDocumentClass('lm-toc-mobile-open', isOpen)
})

watch(items, () => {
  closePanel()
})

watch(visible, (isVisible) => {
  if (!isVisible)
    closePanel()
})

onBeforeUnmount(() => {
  removeDocumentClass('lm-toc-mobile-open')
})
</script>

<template>
  <div v-if="visible" class="lm-toc-mobile xl:hidden">
    <button
      type="button"
      class="lm-toc-mobile__trigger"
      :aria-expanded="open"
      aria-controls="lm-toc-mobile-panel"
      aria-label="打开文章目录"
      @click="togglePanel"
    >
      <span class="lm-toc-mobile__trigger-icon i-ri-file-list-2-line" />
    </button>

    <Transition name="lm-toc-mobile-fade">
      <button
        v-if="open"
        type="button"
        class="lm-toc-mobile__scrim"
        aria-label="关闭文章目录"
        @click="closePanel"
      />
    </Transition>

    <Transition name="lm-toc-mobile-sheet">
      <section
        v-if="open"
        id="lm-toc-mobile-panel"
        class="lm-toc-mobile__panel"
        aria-label="文章目录"
      >
        <div class="lm-toc-mobile__panel-header">
          <div>
            <p class="lm-toc-mobile__eyebrow">
              On this page
            </p>
            <h2 class="lm-toc-mobile__title">
              文章目录
            </h2>
          </div>

          <button
            type="button"
            class="lm-toc-mobile__close"
            aria-label="关闭文章目录"
            @click="closePanel"
          >
            <span class="i-ri-close-line" />
          </button>
        </div>

        <nav class="lm-toc-mobile__nav">
          <a
            v-for="item in items"
            :key="item.link"
            :href="item.link"
            class="lm-toc-mobile__link"
            :class="{
              'lm-toc-mobile__link--active': activeLink === item.link,
              'lm-toc-mobile__link--nested': item.depth > 0,
            }"
            @click="onSelect"
          >
            {{ item.title }}
          </a>
        </nav>
      </section>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.lm-toc-mobile {
  @apply xl:hidden;
}

.lm-toc-mobile__trigger {
  @apply fixed bottom-5 right-4 z-35 inline-flex h-11 w-11 items-center justify-center rounded-full p-0 shadow-lg transition-transform duration-200 sm:right-6;
  border: 1px solid color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 92%, transparent);
  color: var(--lm-c-text-primary);
  backdrop-filter: blur(14px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);

  &:active {
    transform: scale(0.97);
  }

  &::after {
    content: '';
    position: absolute;
    inset: -0.4rem;
    border-radius: inherit;
  }
}

.lm-toc-mobile__trigger-icon {
  @apply text-lg;
  color: var(--lm-c-brand);
}

.lm-toc-mobile__scrim {
  @apply fixed inset-0 z-38 border-none p-0;
  background: rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(2px);
}

.lm-toc-mobile__panel {
  @apply fixed inset-x-0 bottom-0 z-39 mx-auto flex max-h-[72vh] w-full max-w-3xl flex-col overflow-hidden rounded-[8px];
  border: 1px solid color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  border-bottom: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--lm-surface-reading-bg) 96%, transparent) 0%,
    color-mix(in srgb, var(--lm-surface-reading-bg) 92%, transparent) 100%
  );
  box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

.lm-toc-mobile__panel-header {
  @apply flex items-start justify-between gap-4 px-5 pb-4 pt-5;
  border-bottom: 1px solid color-mix(in srgb, var(--lm-c-brand) 10%, var(--lm-c-border));
}

.lm-toc-mobile__eyebrow {
  @apply m-0 text-xs font-700 uppercase tracking-[0.16em];
  color: var(--lm-c-text-muted);
}

.lm-toc-mobile__title {
  @apply mt-2 text-lg font-800;
  color: var(--lm-c-text-primary);
}

.lm-toc-mobile__close {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border-none p-0 text-base transition-colors;
  background: color-mix(in srgb, var(--lm-c-brand-soft) 52%, transparent);
  color: var(--lm-c-text-secondary);

  &:hover {
    color: var(--lm-c-brand-strong);
  }
}

.lm-toc-mobile__nav {
  @apply flex flex-col gap-1 overflow-y-auto px-3 py-3;
}

.lm-toc-mobile__link {
  @apply relative rounded-2xl px-4 py-3 text-sm leading-6 no-underline transition-colors duration-200;
  color: var(--lm-c-text-secondary);

  &::before {
    content: '';
    position: absolute;
    left: 0.7rem;
    top: 50%;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 9999px;
    transform: translateY(-50%);
    background: color-mix(in srgb, var(--lm-c-border) 80%, transparent);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  &:hover {
    color: var(--lm-c-brand-strong);
  }
}

.lm-toc-mobile__link--nested {
  @apply pl-8 text-[0.92rem];
}

.lm-toc-mobile__link--active {
  background: color-mix(in srgb, var(--lm-c-brand-soft) 52%, transparent);
  color: color-mix(in srgb, var(--lm-c-brand-strong) 72%, var(--lm-c-text-primary));
  font-weight: 700;

  &::before {
    transform: translateY(-50%) scale(1.2);
    background: var(--lm-c-brand);
  }
}

.lm-toc-mobile-fade-enter-active,
.lm-toc-mobile-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lm-toc-mobile-fade-enter-from,
.lm-toc-mobile-fade-leave-to {
  opacity: 0;
}

.lm-toc-mobile-sheet-enter-active,
.lm-toc-mobile-sheet-leave-active {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.lm-toc-mobile-sheet-enter-from,
.lm-toc-mobile-sheet-leave-to {
  opacity: 0;
  transform: translateY(1.4rem);
}

:global(html.lm-toc-mobile-open),
:global(body.lm-toc-mobile-open) {
  overflow: hidden;
}

@media (min-width: 768px) {
  .lm-toc-mobile__trigger {
    right: 1.6rem;
    height: 2.8rem;
    width: 2.8rem;
  }

  .lm-toc-mobile__panel {
    @apply bottom-4;
    border-bottom: 1px solid color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
  }
}
</style>
