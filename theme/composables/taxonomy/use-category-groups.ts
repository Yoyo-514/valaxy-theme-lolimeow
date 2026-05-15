import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildCategoryTree, countCategoryNodes, getVisibleSortedPosts } from '../../domain'

/**
 * 提供分类页所需的分类树和统计信息。
 */
export function useCategoryGroups() {
  const site = useSiteStore()

  const posts = computed(() => getVisibleSortedPosts(site.postList ?? []))
  const categories = computed(() => buildCategoryTree(posts.value))
  const totalCategories = computed(() => countCategoryNodes(categories.value))
  const totalPosts = computed(() => posts.value.length)

  return {
    categories,
    totalCategories,
    totalPosts,
  }
}
