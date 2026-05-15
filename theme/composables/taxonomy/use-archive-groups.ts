import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildArchiveGroups, getVisibleSortedPosts } from '../../domain'

/**
 * 提供归档页所需的文章分组状态。
 */
export function useArchiveGroups() {
  const site = useSiteStore()

  const posts = computed(() => getVisibleSortedPosts(site.postList ?? []))
  const groups = computed(() => buildArchiveGroups(posts.value))
  const totalPosts = computed(() => posts.value.length)

  return {
    groups,
    totalPosts,
  }
}
