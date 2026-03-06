export interface Background {
  /**
   * 背景类型
   * - image: 图片
   * - gradient: css渐变
   * - none: 纯色背景
   * @default 'none'
   */
  type: 'image' | 'gradient' | 'none'

  /**
   * 背景图片配置，仅在 type 为 'image' 时有效
   * 支持 Light/Dark + 随机 API
   */
  image?: {
    light?: string
    dark?: string
    /**
     * 静态图片 URL 列表，优先级高于 light/dark 配置
     */
    urls?: string[]
    /**
     * 随机图片 API 列表，优先级高于静态图片 URL 列表
     */
    apiUrls?: string[]
    /**
     * 是否随机取图
     * @default false
     */
    random?: boolean
    /**
     * 图片位置
     * @default 'center center'
     */
    position?: string
    /**
     * 图片尺寸
     * @default 'cover'
     */
    size?: string
    /**
     * 图片是否固定
     * @default true
     */
    fixed?: boolean
    /**
     * 图片上层叠加遮罩透明度
     * @default 0.3
     */
    overlayOpacity?: number
  }

  /**
   * CSS 渐变配置，仅在 type 为 'gradient' 时有效
   */
  gradient?: {
    light?: string
    dark?: string
  }
}
