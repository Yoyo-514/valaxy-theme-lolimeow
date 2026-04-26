import type { LinkGroup, LinkItem } from '../types'
import { computed } from 'vue'
import { useThemeConfig } from './config'

export interface ResolvedLinkItem extends LinkItem {
  name: string
  desc: string
  url: string
  avatar: string
  color: string
  blog: string
  initials: string
}

export interface ResolvedLinkGroup {
  title: string
  items: ResolvedLinkItem[]
}

const DEFAULT_ACCENT_COLOR = 'var(--lm-c-brand)'

function resolveInitials(name: string) {
  const normalized = name.trim()
  if (!normalized)
    return '?'

  return Array.from(normalized).slice(0, 2).join('')
}

function normalizeLinkItem(item: LinkItem): ResolvedLinkItem | null {
  const name = item.name?.trim()
  const url = item.url?.trim()

  if (!name || !url)
    return null

  return {
    ...item,
    name,
    url,
    desc: item.desc?.trim() ?? '',
    avatar: item.avatar?.trim() ?? '',
    color: item.color?.trim() || DEFAULT_ACCENT_COLOR,
    blog: item.blog?.trim() ?? '',
    initials: resolveInitials(name),
  }
}

function normalizeLinkGroup(group: LinkGroup): ResolvedLinkGroup | null {
  const items = (group.items ?? [])
    .map(normalizeLinkItem)
    .filter((item): item is ResolvedLinkItem => Boolean(item))

  if (!items.length)
    return null

  return {
    title: group.title?.trim() || 'Links',
    items,
  }
}

export function useLinkGroups() {
  const themeConfig = useThemeConfig()

  const groups = computed<ResolvedLinkGroup[]>(() => {
    return (themeConfig.value.links?.groups ?? [])
      .map(normalizeLinkGroup)
      .filter((group): group is ResolvedLinkGroup => Boolean(group))
  })

  const totalGroups = computed(() => groups.value.length)
  const totalLinks = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.length, 0)
  })
  const statusCheck = computed(() => themeConfig.value.links?.statusCheck === true)

  return {
    groups,
    statusCheck,
    totalGroups,
    totalLinks,
  }
}
