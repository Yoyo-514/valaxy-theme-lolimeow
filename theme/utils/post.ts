import type { Post } from 'valaxy'

const HTML_TAG_REGEX = /<[^>]+>/g
const WHITESPACE_REGEX = /\s+/g

/** 封面随机图相关 */
export function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1)
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  return hash
}

export function pickBySeed<T>(list: T[], seed: string) {
  if (!list.length)
    return undefined

  const index = hashString(seed) % list.length
  return list[index]
}

export function appendSeedQuery(url: string, seed: string) {
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}lm_seed=${hashString(seed)}`
}

/** 文章摘要 */
export function normalizeExcerpt(raw: string, maxLength = 140) {
  return String(raw)
    .replace(HTML_TAG_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()
    .slice(0, maxLength)
}

export function normalizePostTitle(title: Post['title']) {
  if (typeof title === 'string')
    return title.trim() || 'Untitled'

  if (title && typeof title === 'object') {
    const resolved = Object.values(title).find(value => String(value).trim())
    if (resolved)
      return String(resolved).trim()
  }

  return 'Untitled'
}

export function resolvePostTimestamp(post: Pick<Post, 'date' | 'updated'>) {
  const timestamp = new Date(post.date ?? post.updated ?? 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function isVisiblePost(post: Post) {
  return Boolean(post.path) && post.hide !== true
}
