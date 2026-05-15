import type { Post } from 'valaxy'
import { isVisiblePost, normalizePostTitle, resolvePostTimestamp } from '../../utils'

/**
 * 过滤隐藏文章并按更新时间/发布时间倒序排列。
 *
 * 这是归档、分类、标签等页面共享的文章入口，避免各 composable
 * 复制同一套过滤和排序规则。
 */
export function getVisibleSortedPosts(posts: readonly Post[]) {
  return posts
    .filter(isVisiblePost)
    .slice()
    .sort((left, right) => resolvePostTimestamp(right) - resolvePostTimestamp(left))
}

/**
 * 将 Valaxy 原始文章转换为聚合视图通用条目。
 */
export function createPostEntry(post: Post) {
  return {
    path: String(post.path),
    title: normalizePostTitle(post.title),
    date: post.date ?? post.updated,
  }
}
