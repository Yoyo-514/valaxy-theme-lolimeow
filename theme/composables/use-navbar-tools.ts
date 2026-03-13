import { computed } from 'vue'
import { useThemeConfig } from './config'

const DEFAULT_NAVBAR_TOOLS = ['toggleDark', 'search'] as const

export function useNavbarTools() {
  const themeConfig = useThemeConfig()

  const tools = computed(() => themeConfig.value.navbarOptions?.tools ?? [...DEFAULT_NAVBAR_TOOLS])
  const showSearch = computed(() => tools.value.includes('search'))
  const showDarkToggle = computed(() => tools.value.includes('toggleDark'))
  const showLocaleToggle = computed(() => tools.value.includes('toggleLocale'))

  return {
    tools,
    showSearch,
    showDarkToggle,
    showLocaleToggle,
  }
}
