<script lang="ts" setup>
import type { NavItem } from '@theme/types'
import { useNavActive } from '@theme/composables'

const props = defineProps<{
  item: NavItem
}>()

const { isActive, clearPending } = useNavActive()
</script>

<template>
  <AppLink
    class="lm-nav-item"
    :class="isActive(props.item.link)
      ? 'text-[var(--lm-c-brand)] opacity-92'
      : 'text-[var(--lm-c-text-secondary)] opacity-86'"
    :to="props.item.link"
    :target="props.item.target"
    :aria-current="isActive(props.item.link) ? 'page' : undefined"
    rel="noopener"
    @click="clearPending"
  >
    <span
      v-if="props.item.icon"
      class="lm-nav-item__icon"
      :class="props.item.icon"
    />
    {{ props.item.text }}
  </AppLink>
</template>

<style lang="scss" scoped>
.lm-nav-item {
  @apply inline-flex items-center gap-1.5 no-underline transition-[color,opacity] duration-250 ease-in-out hover:text-[var(--lm-c-brand-strong)];
}

.lm-nav-item__icon {
  @apply inline-block text-[0.95em] opacity-84;
}
</style>
