import { useMounted } from '@vueuse/core'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'
import { useMottoPlayback } from './motto/use-motto-playback'
import { useMottoSource } from './motto/use-motto-source'

/** 编排 Hero 签名来源与文本播放，SSR 先渲染配置文案。 */
export function useHeroMotto() {
  const themeConfig = useThemeConfig()
  const hero = computed(() => themeConfig.value.hero)
  const mounted = useMounted()
  const source = useMottoSource(hero, mounted)
  const playback = useMottoPlayback(hero, mounted, source)
  const hasMotto = computed(() => source.mottos.value.length > 0)

  return {
    ...playback,
    hasMotto,
    shouldFadeMotto: computed(() => !hero.value.typewriter),
    // 一言请求前保留外壳，避免水合后插入条带造成首屏布局偏移。
    shouldShowMotto: computed(() => hasMotto.value || source.remote.value),
  }
}
