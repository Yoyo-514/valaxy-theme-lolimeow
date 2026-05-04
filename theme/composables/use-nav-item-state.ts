import type { MaybeRefOrGetter } from 'vue'
import type { NavItem } from '../types'
import { computed, toValue } from 'vue'
import { getWindow } from '../utils'
import { useNavActive } from './use-nav-active'

const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

export function isExternalNavLink(link: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return false

  try {
    const url = new URL(link, currentWindow.location.href)
    if (!HTTP_PROTOCOLS.has(url.protocol))
      return false

    return url.origin !== currentWindow.location.origin
  }
  catch {
    return false
  }
}

export function shouldShowExternalNavIndicator(item: NavItem) {
  return isExternalNavLink(item.link)
}

export function shouldOpenNavLinkWithWindow(item: NavItem) {
  return isExternalNavLink(item.link) || Boolean(item.target && item.target !== '_self')
}

export function resolveInternalNavRoute(link: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return link

  try {
    const url = new URL(link, currentWindow.location.href)
    if (!HTTP_PROTOCOLS.has(url.protocol) || url.origin !== currentWindow.location.origin)
      return link

    return `${url.pathname}${url.search}${url.hash}`
  }
  catch {
    return link
  }
}

export function useNavItemState(item: MaybeRefOrGetter<NavItem>) {
  const { isActive } = useNavActive()

  const children = computed(() => toValue(item).items ?? [])
  const hasChildren = computed(() => children.value.length > 0)
  const itemActive = computed(() => isActive(toValue(item).link))
  const childActive = computed(() => children.value.some(child => isActive(child.link)))
  const active = computed(() => itemActive.value || childActive.value)

  return {
    active,
    childActive,
    children,
    hasChildren,
    itemActive,
  }
}
