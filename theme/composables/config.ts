import type { ThemeConfig } from '@theme/types'
import { useConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * getThemeConfig
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useConfig<T>()
  return computed(() => config!.value.themeConfig)
}
