/**
 * 单一页面场景下的布局策略
 */
export interface LayoutStrategy {
  /**
   * 定义页面结构层级，不约束具体宽度、间距、视觉样式
   */
  layout: 'single-column' | 'double-columns' | 'triple-columns'
  /**
   * 左右侧栏中要渲染的“模块标识符列表”
   */
  sidebar?: {
    /**
     * 左/右侧栏模块顺序
     * 数组顺序就是渲染顺序
     */
    left?: string[]
    right?: string[]
  }
}

export interface LayoutOptions {
  /**
   * 全站默认布局
   */
  general: LayoutStrategy

  /**
   * 首页布局
   */
  home?: Partial<LayoutStrategy>

  /**
   * 文章页布局
   */
  post?: Partial<LayoutStrategy>
}
