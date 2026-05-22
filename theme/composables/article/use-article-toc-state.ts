import type { MenuItem } from 'valaxy'
import { useOutline } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp, createThrottledFunction, getDocument, getDocumentElement, getWindow, lockNavbarScrollReaction } from '../../utils'

const HASH_PREFIX_RE = /^#/
const ACTIVE_SCROLL_GAP = 24
const ACTIVE_LINE_MIN = 96
const ACTIVE_LINE_MAX = 168
const ACTIVE_SCROLL_THROTTLE = 100

interface TocItem {
  title: string
  link: string
  depth: number
}

function getActiveScrollOffset() {
  const currentWindow = getWindow()
  const root = getDocumentElement()
  if (!currentWindow || !root)
    return 160

  const rawOffset = currentWindow.getComputedStyle(root)
    .getPropertyValue('--lm-navbar-offset')
    .trim()
  const parsedOffset = Number.parseFloat(rawOffset)
  const navbarOffset = Number.isFinite(parsedOffset) ? parsedOffset : 72
  // 激活线放在视口上方阅读区域内，比单纯贴着导航栏更符合阅读进度感知。
  const readingLineOffset = clamp(currentWindow.innerHeight * 0.18, ACTIVE_LINE_MIN, ACTIVE_LINE_MAX)

  return Math.max(navbarOffset + ACTIVE_SCROLL_GAP, readingLineOffset)
}

function flattenTocItems(nodes: MenuItem[], depth = 0): TocItem[] {
  return nodes.flatMap((node) => {
    const currentItem = node.link && node.title
      ? [{ title: node.title, link: node.link, depth }]
      : []
    const childItems = Array.isArray(node.children) && node.children.length
      ? flattenTocItems(node.children, depth + 1)
      : []

    return [...currentItem, ...childItems]
  })
}

function resolveActiveLink(items: TocItem[], scrollTop: number, currentDocument: Document, currentWindow: Window) {
  return items.reduce((activeLink, item) => {
    const id = decodeURIComponent(item.link.replace(HASH_PREFIX_RE, ''))
    const heading = currentDocument.getElementById(id)

    if (!heading)
      return activeLink

    const headingTop = heading.getBoundingClientRect().top + currentWindow.scrollY
    return headingTop <= scrollTop ? item.link : activeLink
  }, items[0]?.link || '')
}

export function useArticleTocState() {
  const { headers, handleClick: originalHandleClick } = useOutline()
  const activeLink = ref('')

  const items = computed<TocItem[]>(() => {
    // 组件只展示两级目录，深层标题仍参与 Valaxy 大纲但不挤压侧栏层级。
    return flattenTocItems(headers.value || []).filter(item => item.depth <= 1)
  })
  const visible = computed(() => items.value.length >= 2)

  function handleClick(event: MouseEvent) {
    // 点击目录会主动滚动页面，短暂锁住导航栏滚动响应可避免头部闪烁。
    lockNavbarScrollReaction({
      deferFrames: 2,
      timeoutMs: 420,
    })
    originalHandleClick(event)
  }

  function updateActiveLink() {
    const currentItems = items.value
    if (!currentItems.length) {
      activeLink.value = ''
      return
    }

    const currentWindow = getWindow()
    const currentDocument = getDocument()
    if (!currentWindow || !currentDocument) {
      activeLink.value = currentItems[0]?.link || ''
      return
    }

    const scrollTop = currentWindow.scrollY + getActiveScrollOffset()
    activeLink.value = resolveActiveLink(currentItems, scrollTop, currentDocument, currentWindow)
  }

  const updateActiveLinkOnScroll = createThrottledFunction(updateActiveLink, ACTIVE_SCROLL_THROTTLE)

  onMounted(() => {
    const currentWindow = getWindow()

    nextTick(() => {
      updateActiveLink()
    })

    currentWindow?.addEventListener('scroll', updateActiveLinkOnScroll, { passive: true })
    currentWindow?.addEventListener('resize', updateActiveLink, { passive: true })
  })

  onUnmounted(() => {
    const currentWindow = getWindow()
    currentWindow?.removeEventListener('scroll', updateActiveLinkOnScroll)
    currentWindow?.removeEventListener('resize', updateActiveLink)
    updateActiveLinkOnScroll.cancel()
  })

  watch(
    items,
    async () => {
      await nextTick()
      updateActiveLink()
    },
    { deep: true },
  )

  return {
    items,
    visible,
    activeLink,
    handleClick,
  }
}
