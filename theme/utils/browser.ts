export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export function getWindow() {
  if (typeof window === 'undefined')
    return undefined

  return window
}

export function getDocumentElement() {
  if (typeof document === 'undefined')
    return undefined

  return document.documentElement
}

export function getDocumentBody() {
  if (typeof document === 'undefined')
    return undefined

  return document.body
}

export function getRootFontSize(fallback = 16) {
  const currentWindow = getWindow()
  const root = getDocumentElement()

  if (!currentWindow || !root)
    return fallback

  const parsed = Number.parseFloat(currentWindow.getComputedStyle(root).fontSize)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function getSessionStorage() {
  return getWindow()?.sessionStorage
}

export function toggleDocumentClass(className: string, force?: boolean) {
  getDocumentElement()?.classList.toggle(className, force)
  getDocumentBody()?.classList.toggle(className, force)
}

export function removeDocumentClass(className: string) {
  getDocumentElement()?.classList.remove(className)
  getDocumentBody()?.classList.remove(className)
}
