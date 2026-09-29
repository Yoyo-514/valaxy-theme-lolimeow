import { getDocument, getDocumentBody } from './runtime'

/** 单个被滚动锁改写的内联样式快照。 */
interface InlineStyleSnapshot {
  property: string
  value: string
  priority: string
}

/** 首个正文滚动锁持有的页面状态。 */
interface BodyScrollLockState {
  body: HTMLElement
  bodyStyles: InlineStyleSnapshot[]
  documentElement: HTMLElement
  documentElementStyles: InlineStyleSnapshot[]
  /** 本轮锁会话结束时是否允许恢复首个锁记录的页面坐标。 */
  restoreScroll: boolean
  scrollBehavior: InlineStyleSnapshot
  scrollX: number
  scrollY: number
  window: Window
}

/** 正文滚动锁释放选项。 */
export interface BodyScrollReleaseOptions {
  /** 是否允许本轮锁会话最终恢复旧坐标；任一持有者设为 `false` 后本轮持续生效。 */
  restoreScroll?: boolean
}

/** 正文滚动锁的幂等释放函数。 */
export type BodyScrollRelease = (options?: BodyScrollReleaseOptions) => void

let bodyScrollLockCount = 0
let bodyScrollLockState: BodyScrollLockState | undefined

const DOCUMENT_ELEMENT_LOCK_PROPERTIES = ['overflow'] as const
const BODY_LOCK_PROPERTIES = [
  'box-sizing',
  'left',
  'overflow',
  'padding-right',
  'position',
  'top',
  'width',
] as const

/** 保存元素指定内联样式属性的原始值与优先级。 */
function captureInlineStyles(element: HTMLElement, properties: readonly string[]) {
  return properties.map(property => ({
    priority: element.style.getPropertyPriority(property),
    property,
    value: element.style.getPropertyValue(property),
  }))
}

/** 恢复单个内联样式属性。 */
function restoreInlineStyle(element: HTMLElement, snapshot: InlineStyleSnapshot) {
  if (snapshot.value)
    element.style.setProperty(snapshot.property, snapshot.value, snapshot.priority)
  else
    element.style.removeProperty(snapshot.property)
}

/** 恢复一组由滚动锁改写的内联样式属性。 */
function restoreInlineStyles(element: HTMLElement, snapshots: readonly InlineStyleSnapshot[]) {
  snapshots.forEach(snapshot => restoreInlineStyle(element, snapshot))
}

/**
 * 以引用计数方式锁定根页面滚动，兼容 iOS 的根滚动容器并避免桌面滚动条消失导致布局跳动。
 *
 * @returns 幂等释放函数；可为导航关闭禁止旧坐标恢复，SSR 或文档尚不可用时无副作用。
 */
export function lockBodyScroll(): BodyScrollRelease {
  const currentDocument = getDocument()
  const body = getDocumentBody()
  const documentElement = currentDocument?.documentElement
  const currentWindow = currentDocument?.defaultView
  if (!body || !documentElement || !currentWindow)
    return () => {}

  if (bodyScrollLockCount === 0) {
    const scrollbarWidth = Math.max(0, currentWindow.innerWidth - documentElement.clientWidth)
    const bodyPaddingRight = Number.parseFloat(currentWindow.getComputedStyle(body).paddingRight) || 0

    bodyScrollLockState = {
      body,
      bodyStyles: captureInlineStyles(body, BODY_LOCK_PROPERTIES),
      documentElement,
      documentElementStyles: captureInlineStyles(documentElement, DOCUMENT_ELEMENT_LOCK_PROPERTIES),
      restoreScroll: true,
      scrollBehavior: captureInlineStyles(documentElement, ['scroll-behavior'])[0],
      scrollX: currentWindow.scrollX,
      scrollY: currentWindow.scrollY,
      window: currentWindow,
    }

    documentElement.style.setProperty('overflow', 'hidden')
    body.style.setProperty('box-sizing', 'border-box')
    body.style.setProperty('left', `${-bodyScrollLockState.scrollX}px`)
    body.style.setProperty('overflow', 'hidden')
    body.style.setProperty('position', 'fixed')
    // fixed 会同步清零窗口滚动坐标，偏移必须使用改写样式前保存的值。
    body.style.setProperty('top', `${-bodyScrollLockState.scrollY}px`)
    body.style.setProperty('width', '100%')

    if (scrollbarWidth > 0)
      body.style.setProperty('padding-right', `${bodyPaddingRight + scrollbarWidth}px`)
  }

  bodyScrollLockCount += 1
  let released = false

  /**
   * 幂等释放当前调用持有的正文滚动锁。
   *
   * @param releaseOptions - 当前释放的坐标恢复策略；`false` 会粘性禁用本轮会话的最终恢复。
   */
  return (releaseOptions = {}) => {
    if (released)
      return

    released = true
    if (releaseOptions.restoreScroll === false && bodyScrollLockState)
      bodyScrollLockState.restoreScroll = false

    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1)
    if (bodyScrollLockCount > 0 || !bodyScrollLockState)
      return

    const state = bodyScrollLockState
    bodyScrollLockState = undefined

    restoreInlineStyles(state.body, state.bodyStyles)
    restoreInlineStyles(state.documentElement, state.documentElementStyles)

    if (!state.restoreScroll)
      return

    // 避免站点的平滑滚动样式让解锁后的坐标恢复产生可见动画。
    state.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
    try {
      state.window.scrollTo(state.scrollX, state.scrollY)
    }
    finally {
      restoreInlineStyle(state.documentElement, state.scrollBehavior)
    }
  }
}
