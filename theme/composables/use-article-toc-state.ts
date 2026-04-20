import type { MenuItem } from '@valaxyjs/utils'
import { lockNavbarScrollReaction } from '@theme/utils'
import { useOutline } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const HASH_PREFIX_RE = /^#/
const ACTIVE_SCROLL_GAP = 24
const ACTIVE_LINE_MIN = 96
const ACTIVE_LINE_MAX = 168

interface TocItem {
  title: string
  link: string
  depth: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getActiveScrollOffset() {
  if (typeof window === 'undefined')
    return 160

  const rawOffset = getComputedStyle(document.documentElement)
    .getPropertyValue('--lm-navbar-offset')
    .trim()
  const parsedOffset = Number.parseFloat(rawOffset)
  const navbarOffset = Number.isFinite(parsedOffset) ? parsedOffset : 72
  const readingLineOffset = clamp(window.innerHeight * 0.18, ACTIVE_LINE_MIN, ACTIVE_LINE_MAX)

  return Math.max(navbarOffset + ACTIVE_SCROLL_GAP, readingLineOffset)
}

export function useArticleTocState() {
  const { headers, handleClick: originalHandleClick } = useOutline()
  const activeLink = ref('')

  const items = computed<TocItem[]>(() => {
    const flattened: TocItem[] = []

    const visit = (nodes: MenuItem[], depth = 0) => {
      nodes.forEach((node) => {
        if (node.link && node.title) {
          flattened.push({
            title: node.title,
            link: node.link,
            depth,
          })
        }

        if (Array.isArray(node.children) && node.children.length)
          visit(node.children, depth + 1)
      })
    }

    visit(headers.value || [])
    return flattened.filter(item => item.depth <= 1)
  })
  const visible = computed(() => items.value.length >= 2)

  function handleClick(event: MouseEvent) {
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

    const scrollTop = window.scrollY + getActiveScrollOffset()
    let nextActive = currentItems[0]?.link || ''

    currentItems.forEach((item) => {
      const id = decodeURIComponent(item.link.replace(HASH_PREFIX_RE, ''))
      const heading = document.getElementById(id)

      if (heading) {
        const headingTop = heading.getBoundingClientRect().top + window.scrollY
        if (headingTop <= scrollTop)
          nextActive = item.link
      }
    })

    activeLink.value = nextActive
  }

  onMounted(() => {
    nextTick(() => {
      updateActiveLink()
    })

    window.addEventListener('scroll', updateActiveLink, { passive: true })
    window.addEventListener('resize', updateActiveLink, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveLink)
    window.removeEventListener('resize', updateActiveLink)
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
