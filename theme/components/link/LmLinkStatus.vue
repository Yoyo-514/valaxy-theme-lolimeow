<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLinkStatus } from '../../features/link'

const props = defineProps<{
  url: string
  enabled: boolean
}>()

const { t } = useI18n()
const { status } = useLinkStatus(() => props.url, () => props.enabled)

const statusLabel = computed(() => {
  return t(`pages.links.status.${status.value}`)
})
</script>

<template>
  <span
    v-if="status !== 'idle'"
    class="lm-link-status"
    :class="`lm-link-status--${status}`"
    :title="statusLabel"
    :aria-label="statusLabel"
  />
</template>

<style scoped lang="scss">
.lm-link-status {
  @apply absolute bottom-2 right-0.5 h-3 w-3 rounded-full;
  background: var(--lm-c-text-muted);
  border: 2px solid color-mix(in srgb, var(--lm-surface-reading-bg) 92%, white);
  box-shadow:
    0 0 0 0.16rem color-mix(in srgb, var(--lm-c-text-muted) 16%, transparent),
    0 0.15rem 0.45rem color-mix(in srgb, #000 16%, transparent);
}

.lm-link-status--checking {
  background: var(--lm-c-info-solid);
  box-shadow:
    0 0 0 0.16rem var(--lm-c-info-soft-hover),
    0 0.15rem 0.45rem color-mix(in srgb, #000 16%, transparent);
}

.lm-link-status--online {
  background: var(--lm-c-success-solid);
  box-shadow:
    0 0 0 0.16rem var(--lm-c-success-soft-hover),
    0 0.15rem 0.45rem color-mix(in srgb, #000 16%, transparent);
}

.lm-link-status--offline {
  background: var(--lm-c-danger-solid);
  box-shadow:
    0 0 0 0.16rem var(--lm-c-danger-soft-hover),
    0 0.15rem 0.45rem color-mix(in srgb, #000 16%, transparent);
}
</style>
