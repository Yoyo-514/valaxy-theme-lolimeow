<script setup lang="ts">
import type { LmWalineOptions } from '../../features/comment/waline-options'
import { Waline } from '@waline/client/component'
import { useAppStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { resolveWalineEmoji } from '../../features/comment/waline-options'
import '@waline/client/style'

const props = defineProps<{ options: LmWalineOptions }>()
const appStore = useAppStore()
const route = useRoute()
const { locale } = useI18n()
const path = computed(() => props.options.path || route.path.replace(/\/$/, ''))
const emoji = computed(() => resolveWalineEmoji(props.options))
</script>

<template>
  <Waline
    v-bind="options"
    :server-u-r-l="options.serverURL"
    :lang="locale"
    :path="path"
    :dark="appStore.isDark"
    :emoji="emoji"
  />
</template>
