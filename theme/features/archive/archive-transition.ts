/** 离场面板仍在视觉过渡中，但不应继续接收点击或键盘焦点。 */
export function disableLeavingArchivePanel(element: Element) {
  element.setAttribute('inert', '')
  element.setAttribute('aria-hidden', 'true')
}

/** Vue 复用或重新进入面板时恢复交互；结束事件与超时由 Transition 统一管理。 */
export function enableArchivePanel(element: Element) {
  element.removeAttribute('inert')
  element.removeAttribute('aria-hidden')
}
