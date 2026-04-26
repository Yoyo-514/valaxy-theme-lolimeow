import { computed } from 'vue'
import { useThemeConfig } from '../composables'

export function usePinnedEntries() {
  const themeConfig = useThemeConfig()

  const sectionTitle = computed(() => themeConfig.value.pinned.title?.trim() ?? 'Start')
  const entries = computed(() => {
    return (themeConfig.value.pinned.entries ?? []).filter((entry) => {
      return Boolean(entry.title?.trim()) && Boolean(entry.link?.trim())
    })
  })

  const entryCount = computed(() => entries.value.length)
  const trackClass = computed(() => {
    if (entryCount.value === 1)
      return 'lm-pinned__track--single'
    if (entryCount.value === 2)
      return 'lm-pinned__track--double'
    if (entryCount.value === 3)
      return 'lm-pinned__track--triple'

    return 'lm-pinned__track--scroll'
  })

  const visible = computed(() => {
    return themeConfig.value.pinned.enable && entryCount.value > 0
  })

  function getFallbackLabel(title: string) {
    return title.trim().slice(0, 2).toUpperCase()
  }

  return {
    sectionTitle,
    entries,
    entryCount,
    trackClass,
    visible,
    getFallbackLabel,
  }
}
