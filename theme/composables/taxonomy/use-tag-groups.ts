import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildTagGroups, countTaggedPosts, getVisibleSortedPosts } from '../../domain'

/**
 * 提供标签页所需的标签分组和统计信息。
 */
export function useTagGroups() {
  const site = useSiteStore()

  const posts = computed(() => getVisibleSortedPosts(site.postList ?? []))
  const groups = computed(() => buildTagGroups(posts.value))
  const totalTags = computed(() => groups.value.length)
  const totalPosts = computed(() => countTaggedPosts(groups.value))

  return {
    groups,
    totalPosts,
    totalTags,
  }
}
