/**
 * 浏览器运行时工具。
 *
 * 该模块统一封装对 window、document、sessionStorage、定时器和动画帧等浏览器 API 的访问，
 * 避免组件或 composable 在 SSR/SSG 阶段直接引用浏览器全局对象导致构建或 hydration 异常。
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
export type BrowserWindow = NonNullable<ReturnType<typeof getWindow>>
export type BrowserTimeout = number
export type BrowserAnimationFrame = ReturnType<BrowserWindow['requestAnimationFrame']>

export function getWindow() {
  // 所有浏览器全局访问统一经过这里，避免 SSR/SSG 阶段直接触碰 window。
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
  // 主题级状态类同时写到 html/body，兼容 Valaxy 与第三方样式的不同挂载点。
  getDocumentElement()?.classList.toggle(className, force)
  getDocumentBody()?.classList.toggle(className, force)
}

export function removeDocumentClass(className: string) {
  getDocumentElement()?.classList.remove(className)
  getDocumentBody()?.classList.remove(className)
}
