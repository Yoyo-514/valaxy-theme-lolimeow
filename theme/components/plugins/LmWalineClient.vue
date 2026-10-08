<script setup lang="ts">
import type { LmWalineOptions } from '../../features/comment/waline-options'
import { Waline } from '@waline/client/component'
import { useAppStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { resolveWalineClientOptions, resolveWalineEmoji } from '../../features/comment/waline-options'
// @ts-expect-error Waline 的样式入口是纯 CSS，没有类型声明
import '@waline/client/style'

const props = defineProps<{ options: LmWalineOptions }>()
const appStore = useAppStore()
const route = useRoute()
const { locale } = useI18n()
const path = computed(() => props.options.path || route.path.replace(/\/$/, ''))
const emoji = computed(() => resolveWalineEmoji(props.options))
const clientOptions = computed(() => resolveWalineClientOptions(props.options))
// 组件未在 props 类型里收录 boolean 形式的 highlighter / imageUploader / texRenderer（运行时支持），这里按组件类型收口。
const walineProps = computed(() => clientOptions.value as unknown as InstanceType<typeof Waline>['$props'])
</script>

<template>
  <Waline
    v-bind="walineProps"
    :server-u-r-l="clientOptions.serverURL"
    :lang="locale"
    :path="path"
    :dark="appStore.isDark"
    :emoji="emoji"
  />
</template>
