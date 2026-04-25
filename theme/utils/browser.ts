export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
export type BrowserWindow = NonNullable<ReturnType<typeof getWindow>>
export type BrowserTimeout = number
export type BrowserAnimationFrame = ReturnType<BrowserWindow['requestAnimationFrame']>

export function getWindow() {
  if (typeof window === 'undefined')
    return undefined

  return window
}

export function getDocument() {
  if (typeof document === 'undefined')
    return undefined

  return document
}

export function getDocumentElement() {
  return getDocument()?.documentElement
}

export function getDocumentBody() {
  return getDocument()?.body
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

export function setBrowserTimeout(handler: () => void, timeout?: number): BrowserTimeout | undefined {
  return getWindow()?.setTimeout(handler, timeout)
}

export function clearBrowserTimeout(timeoutId: BrowserTimeout | undefined) {
  if (timeoutId !== undefined)
    getWindow()?.clearTimeout(timeoutId)
}

export function requestBrowserAnimationFrame(callback: FrameRequestCallback) {
  return getWindow()?.requestAnimationFrame(callback)
}

export function toggleDocumentClass(className: string, force?: boolean) {
  getDocumentElement()?.classList.toggle(className, force)
  getDocumentBody()?.classList.toggle(className, force)
}

export function removeDocumentClass(className: string) {
  getDocumentElement()?.classList.remove(className)
  getDocumentBody()?.classList.remove(className)
}
