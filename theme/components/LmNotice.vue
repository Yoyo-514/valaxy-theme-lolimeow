<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSessionStorage } from '../shared/browser'
import { useThemeConfig } from '../shared/config'

const { t } = useI18n()
const themeConfig = useThemeConfig()

const isOpen = ref(true)
const isMounted = ref(false)

const enabled = computed(() => themeConfig.value.notice.enable)
const closable = computed(() => themeConfig.value.notice.closable !== false)
const notice = computed(() => themeConfig.value.notice.message?.trim() ?? '')

const storageKey = computed(() => {
  if (!notice.value)
    return ''

  return `lm-notice:dismissed:${encodeURIComponent(notice.value)}`
})

/** 根据会话存储判断公告是否已被关闭；存储不可读或不可关闭时按未关闭处理。 */
function resolveDismissed(key: string, canClose: boolean) {
  const sessionStorage = getSessionStorage()
  if (!canClose || !sessionStorage)
    return false

  return sessionStorage.getItem(key) === '1'
}

/** 按当前公告与开关状态同步可见性。 */
function applyOpenState() {
  const key = storageKey.value

  if (!key) {
    isOpen.value = false
    return
  }

  // 水合前不读 sessionStorage：SSR 与客户端首帧必须一致（公告默认可见），
  // 否则已关闭公告的访问者会先看到公告水合、随后被移除，产生不一致与闪跳。
  if (!isMounted.value) {
    isOpen.value = true
    return
  }

  isOpen.value = !resolveDismissed(key, closable.value)
}

watch(
  [storageKey, closable],
  applyOpenState,
  { immediate: true },
)

onMounted(() => {
  isMounted.value = true
  // 水合完成后才应用会话级已读状态；已关闭过的公告会在挂载后立即收起。
  applyOpenState()
})

const visible = computed(() => enabled.value && Boolean(notice.value) && isOpen.value)

/** 关闭当前公告，并在允许关闭时记录本次会话的已读状态。 */
function closeNotice() {
  if (!closable.value)
    return

  isOpen.value = false

  if (storageKey.value)
    getSessionStorage()?.setItem(storageKey.value, '1')
}
</script>

<template>
  <section
    v-if="visible"
    class="lm-notice"
    :aria-label="t('notice.label')"
  >
    <div class="lm-notice__icon" aria-hidden="true">
      <div i-ri-megaphone-line />
    </div>

    <div class="lm-notice__content">
      <p class="lm-notice__message">
        {{ notice }}
      </p>
    </div>

    <button
      v-if="closable"
      type="button"
      class="lm-notice__close"
      :aria-label="t('button.closeNotice')"
      @click="closeNotice"
    >
      <div i-ri-close-line />
    </button>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/mixins/surface' as *;

.lm-notice {
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 72%, transparent),
    color-mix(in srgb, var(--lm-c-border-hover) 42%, transparent),
    0 14px 30px rgb(15 23 42 / 0.08),
    14px
  );

  @apply mt-4 relative grid grid-cols-[auto_minmax(0,1fr)_auto] rounded-3 items-center gap-3 overflow-hidden border px-4 py-3 md:gap-3.5;

  border: 1px solid color-mix(in srgb, var(--lm-c-border-hover) 38%, transparent);
}

.lm-notice::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--lm-c-brand), color-mix(in srgb, var(--lm-c-brand) 28%, white));
  opacity: 0.9;
}

.lm-notice::after {
  content: '';
  position: absolute;
  inset: auto -2rem -2.5rem auto;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--lm-c-brand) 12%, transparent);
  filter: blur(18px);
  pointer-events: none;
}

.lm-notice__icon {
  @include lm-surface-nav(
    color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-bg-glass)),
    color-mix(in srgb, var(--lm-c-brand) 24%, transparent),
    0 8px 18px rgb(15 23 42 / 0.06),
    10px
  );

  @apply relative z-[var(--lm-z-raised)] inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full;
  color: var(--lm-c-brand);
}

.lm-notice__content {
  @apply relative z-[var(--lm-z-raised)] min-w-0;
}

.lm-notice__message {
  @apply m-0 text-sm leading-6 md:text-[0.95rem] md:leading-[1.65];
  color: var(--lm-c-text-primary);
}

.lm-notice__close {
  @apply relative z-[var(--lm-z-raised)] inline-flex h-8 w-8 items-center justify-center rounded-full;
  color: var(--lm-c-text-secondary);
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.lm-notice__close:hover,
.lm-notice__close:focus-visible {
  color: var(--lm-c-text-primary);
  background: color-mix(in srgb, var(--lm-c-brand) 12%, transparent);
  transform: translateY(-1px);
}
</style>
