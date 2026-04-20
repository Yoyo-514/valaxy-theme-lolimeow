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
