<script lang="ts" setup>
import { computed } from 'vue'
import { useBackgroundRuntime, useResolvedBackground } from '../composables'

const background = useResolvedBackground('app')
const runtimeBackground = useBackgroundRuntime('app', background)

const placeholderStyle = computed(() => runtimeBackground.placeholderStyle.value)
const hasBaseImageLayer = computed(() => Boolean(runtimeBackground.currentImageUrl.value))
const hasIncomingImageLayer = computed(() => Boolean(runtimeBackground.incomingImageUrl.value))
const incomingImageVisible = computed(() => runtimeBackground.incomingImageVisible.value)

const baseImageStyle = computed(() => {
  if (!hasBaseImageLayer.value)
    return {}

  return {
    backgroundImage: `url(${runtimeBackground.currentImageUrl.value})`,
    backgroundPosition: background.value.position,
    backgroundSize: background.value.size,
    backgroundAttachment: background.value.fixed ? 'fixed' : 'scroll',
  }
})

const incomingImageStyle = computed(() => {
  if (!hasIncomingImageLayer.value)
    return {}

  return {
    backgroundImage: `url(${runtimeBackground.incomingImageUrl.value})`,
    backgroundPosition: background.value.position,
    backgroundSize: background.value.size,
    backgroundAttachment: background.value.fixed ? 'fixed' : 'scroll',
  }
})

const overlayStyle = computed(() => ({
  opacity: String(background.value.overlayOpacity),
  background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
}))
</script>

<template>
  <div class="pointer-events-none inset-0 fixed z-0 overflow-hidden" aria-hidden="true">
    <div class="inset-0 absolute" :style="placeholderStyle" />
    <div
      v-if="hasBaseImageLayer"
      class="inset-0 absolute"
      :style="baseImageStyle"
    />
    <div
      v-if="hasIncomingImageLayer"
      class="transition-opacity duration-500 ease-out inset-0 absolute"
      :class="incomingImageVisible ? 'opacity-100' : 'opacity-0'"
      :style="incomingImageStyle"
    />
    <div
      class="inset-0 absolute"
      :style="overlayStyle"
    />
  </div>
</template>
