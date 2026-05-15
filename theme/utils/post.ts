import type { Post } from 'valaxy'
import { hashString } from './hash'

const HTML_TAG_REGEX = /<[^>]+>/g
const WHITESPACE_REGEX = /\s+/g

export function pickBySeed<T>(list: T[], seed: string) {
  if (!list.length)
    return undefined

  const index = hashString(seed) % list.length
  return list[index]
}

/**
 * 给随机图 API 附加稳定种子，让同一篇文章尽量获得相同封面。
 */
export function appendSeedQuery(url: string, seed: string) {
  // 给随机图 API 附加稳定种子，让同一文章在缓存和刷新后仍尽量命中同一张图。
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}lm_seed=${hashString(seed)}`
}

/**
 * 将文章摘要归一化为列表卡片可直接展示的纯文本。
 */
export function normalizeExcerpt(raw: string, maxLength = 140) {
  return String(raw)
    .replace(HTML_TAG_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()
    .slice(0, maxLength)
}

/**
 * 将 Valaxy 文章标题归一化为列表、归档、分类等页面的兜底文案。
 */
export function normalizePostTitle(title: Post['title']) {
  if (typeof title === 'string')
    return title.trim() || 'Untitled'

  if (title && typeof title === 'object') {
    // 多语言标题优先取第一个非空值，列表页不在这里绑定具体 locale。
    const resolved = Object.values(title).find(value => String(value).trim())
    if (resolved)
      return String(resolved).trim()
  }

  return 'Untitled'
}

/**
 * 解析文章排序用时间戳，无法解析时返回 0 以保持稳定排序。
 */
export function resolvePostTimestamp(post: Pick<Post, 'date' | 'updated'>) {
  const timestamp = new Date(post.date ?? post.updated ?? 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

/**
 * 判断文章是否可出现在公开列表中。
 */
export function isVisiblePost(post: Post) {
  return Boolean(post.path) && post.hide !== true
}
