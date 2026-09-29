import type { ResolvedBackground } from '../../../theme/features/background/types'
import { createApp, h, onBeforeUnmount, ref } from 'vue'
import { createBackgroundRotationScheduler } from '../../../theme/features/background/background-rotation'
import { preloadImage } from '../../../theme/features/background/image-loader'

const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E'
const background: ResolvedBackground = {
  type: 'image',
  source: 'background',
  imageUrl: pixel,
  fallbackImageUrl: pixel,
  staticImageUrls: [pixel],
  apiImageUrls: [],
  random: true,
  rotationEnabled: true,
  rotationInterval: 4000,
  gradientValue: '',
  colorValue: '',
  overlayOpacity: 0,
  position: 'center',
  size: 'cover',
  fixed: false,
}

createApp({
  setup() {
    const commits = ref(0)
    const abortResult = ref('idle')
    const scheduler = createBackgroundRotationScheduler({
      scope: 'app',
      isCurrentRequest: () => true,
      commit: () => { commits.value += 1 },
      onPause: () => {},
      handleFailure: () => { throw new Error('Unexpected image failure') },
    })
    onBeforeUnmount(scheduler.stop)

    async function abortImage() {
      const controller = new AbortController()
      const result = preloadImage(pixel, controller.signal)
      controller.abort()
      try {
        await result
        abortResult.value = 'loaded'
      }
      catch (error) {
        abortResult.value = (error as Error).name
      }
    }

    return () => h('main', [
      h('button', { onClick: () => scheduler.schedule(background, 1) }, 'Start rotation'),
      h('button', { onClick: scheduler.stop }, 'Stop rotation'),
      h('output', { id: 'commits' }, String(commits.value)),
      h('button', { onClick: abortImage }, 'Abort image'),
      h('output', { id: 'abort-result' }, abortResult.value),
    ])
  },
}).mount('#app')
