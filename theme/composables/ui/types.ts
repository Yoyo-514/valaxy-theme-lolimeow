/**
 * 可复用打字机渲染选项。
 */
export interface TypewriterRenderOptions {
  text: string
  speed: number
  immediate?: boolean
  onComplete?: () => void
}
