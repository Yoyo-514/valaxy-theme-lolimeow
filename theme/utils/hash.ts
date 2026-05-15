/**
 * 封面随机图、标签云等需要稳定分布时使用的轻量哈希。
 *
 * 这里不使用加密哈希，只需要同一输入在客户端和构建时得到稳定结果。
 */
export function hashString(input: string) {
  let hash = 0

  for (let i = 0; i < input.length; i += 1)
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0

  return hash
}
