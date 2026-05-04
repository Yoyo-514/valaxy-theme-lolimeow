import type { ArchiveGroup } from './use-archive-groups'
import { useWindowSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { ARCHIVE_ACCORDION_BREAKPOINT } from '../utils'

export function useArchiveTimelineState(getGroups: () => ArchiveGroup[]) {
  const { width } = useWindowSize()
  const hoveredYear = ref<string | null>(null)
  const selectedYear = ref<string | null>(null)
  const openedYear = ref<string | null>(null)

  // 桌面端用 hover 预览、click 固定；移动端用 openedYear 表达手风琴展开态。
  const groups = computed(() => getGroups())
  const isAccordionMode = computed(() => width.value < ARCHIVE_ACCORDION_BREAKPOINT)
  const defaultDesktopYear = computed(() => groups.value[0]?.year ?? null)

  function resolveAvailableYear(year: string | null) {
    return groups.value.some(group => group.year === year) ? year : null
  }

  function resolveDesktopYear() {
    return resolveAvailableYear(hoveredYear.value)
      ?? resolveAvailableYear(selectedYear.value)
      ?? defaultDesktopYear.value
  }

  function resolveAccordionYear() {
    return resolveAvailableYear(openedYear.value)
      ?? resolveAvailableYear(selectedYear.value)
      ?? resolveAvailableYear(hoveredYear.value)
      ?? defaultDesktopYear.value
  }

  const activeYear = computed(() => {
    if (isAccordionMode.value)
      return resolveAccordionYear()

    return resolveDesktopYear()
  })

  const activeGroup = computed(() => {
    if (!activeYear.value)
      return null

    return groups.value.find(group => group.year === activeYear.value) ?? null
  })

  watch(isAccordionMode, (nextMode) => {
    // 响应式模式切换时迁移当前年份，避免同一组归档在断点两侧丢失焦点。
    if (nextMode) {
      openedYear.value = resolveAccordionYear()
      return
    }

    selectedYear.value = resolveAvailableYear(selectedYear.value)
      ?? resolveAvailableYear(openedYear.value)
      ?? defaultDesktopYear.value
    hoveredYear.value = null
  }, { immediate: true })

  watch(groups, () => {
    if (isAccordionMode.value) {
      openedYear.value = resolveAccordionYear()
      return
    }

    selectedYear.value = resolveAvailableYear(selectedYear.value)
      ?? resolveAvailableYear(openedYear.value)
      ?? defaultDesktopYear.value
    hoveredYear.value = resolveAvailableYear(hoveredYear.value)
  })

  function previewGroup(year: string) {
    if (isAccordionMode.value)
      return

    hoveredYear.value = year
  }

  function resetDesktopPreview() {
    if (isAccordionMode.value)
      return

    hoveredYear.value = null
  }

  function selectGroup(year: string) {
    if (isAccordionMode.value) {
      openedYear.value = openedYear.value === year ? null : year
      return
    }

    selectedYear.value = year
    hoveredYear.value = year
  }

  return {
    isAccordionMode,
    activeYear,
    activeGroup,
    previewGroup,
    resetDesktopPreview,
    selectGroup,
  }
}
