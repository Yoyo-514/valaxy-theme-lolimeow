import type { ArchiveGroup } from './types'
import { useWindowSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

/** Archive 时间线切换为折叠模式的视口宽度，单位为像素。 */
const ARCHIVE_ACCORDION_BREAKPOINT = 1024

/**
 * 管理归档时间线在桌面预览与折叠模式下的年份状态。
 *
 * @param getGroups - 获取当前归档分组的响应式函数。
 * @returns 时间线模式、活动分组及交互控制方法。
 */
export function useArchiveTimelineState(getGroups: () => ArchiveGroup[]) {
  const { width } = useWindowSize()
  const hoveredYear = ref<string | null>(null)
  const selectedYear = ref<string | null>(null)
  const openedYear = ref<string | null>(null)

  // 桌面端用 hover 预览、click 固定；移动端用 openedYear 表达手风琴展开态。
  const groups = computed(() => getGroups())
  const isAccordionMode = computed(() => width.value < ARCHIVE_ACCORDION_BREAKPOINT)
  const defaultDesktopYear = computed(() => groups.value[0]?.year ?? null)

  /**
   * 校验年份是否仍存在于当前归档分组。
   *
   * @param year - 待校验的年份。
   * @returns 可用年份；不存在时返回 `null`。
   */
  function resolveAvailableYear(year: string | null) {
    return groups.value.some(group => group.year === year) ? year : null
  }

  /**
   * 按悬停、选中和默认年份的优先级解析桌面活动年份。
   *
   * @returns 当前桌面活动年份或 `null`。
   */
  function resolveDesktopYear() {
    return resolveAvailableYear(hoveredYear.value)
      ?? resolveAvailableYear(selectedYear.value)
      ?? defaultDesktopYear.value
  }

  /**
   * 按展开、选中、悬停和默认年份的优先级解析折叠活动年份。
   *
   * @returns 当前折叠模式活动年份或 `null`。
   */
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

  /**
   * 在桌面模式下预览指定年份。
   *
   * @param year - 待预览的年份。
   */
  function previewGroup(year: string) {
    if (isAccordionMode.value)
      return

    hoveredYear.value = year
  }

  /** 清除桌面模式下的悬停预览年份。 */
  function resetDesktopPreview() {
    if (isAccordionMode.value)
      return

    hoveredYear.value = null
  }

  /**
   * 选择年份；折叠模式切换展开态，桌面模式固定并预览该年份。
   *
   * @param year - 待选择的年份。
   */
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
