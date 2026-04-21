export function resolveFrontmatterText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || fallback
  }

  if (typeof value === 'number')
    return String(value)

  if (value && typeof value === 'object') {
    for (const candidate of Object.values(value as Record<string, unknown>)) {
      const resolved: string = resolveFrontmatterText(candidate)
      if (resolved)
        return resolved
    }
  }

  return fallback
}

export function resolveFrontmatterCover(frontmatter: Record<string, unknown> | null | undefined): string {
  const data: Record<string, unknown> = frontmatter ?? {}
  const postCover = data.cover

  if (typeof postCover === 'string' && postCover)
    return postCover

  const image = data.image

  if (typeof image === 'string' && image)
    return image

  if (Array.isArray(image)) {
    const firstString = image.find(item => typeof item === 'string' && item)
    if (typeof firstString === 'string')
      return firstString
  }

  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string')
    return image.url

  return ''
}
