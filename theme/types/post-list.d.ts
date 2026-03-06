export interface PostListOptions {
  /**
   * 文章列表标题
   */
  title?: string

  /**
   * 文章列表中的封面图是否隔列反转
   */
  imageReversed?: boolean

  /**
   * 文章列表封面图配置
   */
  coverFallback?: string[]

  /**
   * 文章列表封面图随机 API 列表
   */
  coverApiUrls?: string[]

  /**
   * 是否启用随机封面策略，优先使用 coverApiUrls > coverFallback
   */
  coverRandom?: boolean

  /**
   * 是否显示文章列表的摘要
   */
  showExcerpt?: boolean

  /**
   * 文章列表摘要长度，单位为字符，仅在 showExcerpt 为 true 时生效
   * @default 140
   */
  excerptLength?: number

  /**
   * 文章列表列数配置
   */
  columns?: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', number>>
}
