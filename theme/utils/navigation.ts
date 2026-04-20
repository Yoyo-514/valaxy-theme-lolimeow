const HOME_PAGINATION_PATH_RE = /^\/(?:page\/\d+\/?)?$/
const PATHNAME_REGEX = /[?#]/
const TRAILING_SLASH_REGEX = /\/+$/

export const NAVBAR_SCROLL_LOCK_ATTR = 'data-lm-navbar-scroll-lock'

interface NavbarScrollLockOptions {
  deferFrames?: number
  timeoutMs?: number
}

export function lockNavbarScrollReaction(options: NavbarScrollLockOptions = {}) {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    return () => {}

  const { deferFrames = 0, timeoutMs } = options
  const root = document.documentElement
  let released = false
  let timeoutId: number | undefined

  root.setAttribute(NAVBAR_SCROLL_LOCK_ATTR, 'true')

  const release = () => {
    if (released)
      return

    released = true

    if (timeoutId)
      window.clearTimeout(timeoutId)

    root.removeAttribute(NAVBAR_SCROLL_LOCK_ATTR)
  }

  if (Number.isFinite(timeoutMs))
    timeoutId = window.setTimeout(release, timeoutMs)

  if (deferFrames > 0) {
    let remainingFrames = deferFrames

    const scheduleRelease = () => {
      if (released)
        return

      if (remainingFrames <= 0) {
        release()
        return
      }

      remainingFrames -= 1
      window.requestAnimationFrame(scheduleRelease)
    }

    window.requestAnimationFrame(scheduleRelease)
  }

  return release
}

export function normalizePath(path: string) {
  if (!path)
    return '/'

  const [pathname] = path.split(PATHNAME_REGEX)
  if (!pathname)
    return '/'

  return pathname !== '/' ? pathname.replace(TRAILING_SLASH_REGEX, '') : '/'
}

export function isSectionMatch(current: string, target: string) {
  if (target === '/')
    return current === '/'

  return current === target || current.startsWith(`${target}/`)
}

export function isHomePaginationPath(path: string) {
  return HOME_PAGINATION_PATH_RE.test(path)
}
