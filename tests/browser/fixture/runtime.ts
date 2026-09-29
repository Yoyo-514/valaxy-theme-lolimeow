import type { ResolvedBackground } from '../../../theme/features/background/types'
import type { Hero } from '../../../theme/types'
import { createApp, h, onBeforeUnmount, ref } from 'vue'
import { createBackgroundRotationScheduler } from '../../../theme/features/background/background-rotation'
import { preloadImage } from '../../../theme/features/background/image-loader'
import { useMottoPlayback } from '../../../theme/features/hero/motto/use-motto-playback'
import { useMottoSource } from '../../../theme/features/hero/motto/use-motto-source'

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
    const hero = ref<Hero>({
      motto: ['Alpha', 'Beta'],
      mottoSource: 'config',
      hitokoto: {},
      mottoInterval: 1200,
      typewriter: false,
      typingSpeed: 100,
      showSocialIcons: false,
      showScrollDown: false,
      height: '100vh',
      textAlign: 'center',
    })
    const mounted = ref(true)
    const playback = useMottoPlayback(hero, mounted, useMottoSource(hero, mounted))
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
      h('output', { id: 'motto' }, playback.renderedMotto.value),
      h('button', { onClick: () => {
        hero.value.motto = ['Replacement text has no stale rotation']
        hero.value.typewriter = true
      } }, 'Replace motto'),
    ])
  },
}).mount('#app')
