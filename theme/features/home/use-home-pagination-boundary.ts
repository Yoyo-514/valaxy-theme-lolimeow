import type { MaybeRefOrGetter } from 'vue'
import { useSiteConfig, useSiteStore } from 'valaxy'
import { computed, toValue } from 'vue'
import { useThemeConfig } from '../../shared/config'
import { normalizePageNumber, normalizePageSize } from './pagination-normalization'

/** 首页文章流在主题和站点均未配置时采用的默认每页文章数。 */
const DEFAULT_PAGE_SIZE = 10

/**
 * 构建首页文章流的纯响应式分页边界。
 *
 * @remarks
 * 该组合式函数只创建计算属性，不安装监听器、生命周期钩子或 IntersectionObserver。
 * 主题分页大小优先于 Valaxy 站点级 pageSize；两者均无效时使用主题默认值。
 * 空站总页数保持为 0，但第一页仍视为有效边界。
 *
 * @param curPage - 当前页码，可传普通值、响应式引用或 Getter，默认为第一页。
 * @returns 当前页、每页文章数、总页数、标准分页状态与页码越界状态。
 */
export function useHomePaginationBoundary(
  curPage: MaybeRefOrGetter<number | undefined> = 1,
) {
  const themeConfig = useThemeConfig()
  const siteConfig = useSiteConfig()
  const site = useSiteStore()

  const currentPage = computed(() => normalizePageNumber(toValue(curPage)))

  const itemsPerPage = computed(() => {
    const themePageSize = normalizePageSize(themeConfig.value.pagination?.itemsPerPage)

    if (themePageSize !== undefined)
      return themePageSize

    const sitePageSize = normalizePageSize(siteConfig.value.pageSize)

    if (sitePageSize !== undefined)
      return sitePageSize

    return DEFAULT_PAGE_SIZE
  })

  const totalPages = computed(() => {
    const postCount = site.postList?.length ?? 0

    if (postCount === 0)
      return 0

    return Math.ceil(postCount / itemsPerPage.value)
  })

  const paginationType = computed(() => themeConfig.value.pagination?.type ?? 'standard')

  const isStandardPagination = computed(() => {
    return paginationType.value === 'standard'
  })

  const isPageOutOfRange = computed(() => {
    return currentPage.value > Math.max(totalPages.value, 1)
  })

  return {
    currentPage,
    itemsPerPage,
    isPageOutOfRange,
    isStandardPagination,
    paginationType,
    totalPages,
  }
}
