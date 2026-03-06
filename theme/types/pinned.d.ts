export interface PinnedEntry {
  /**
   * 卡片标题
   */
  title: string

  /**
   * 卡片链接
   */
  link: string

  /**
   * 卡片描述
   */
  desc?: string

  /**
   * 卡片图片
   */
  img?: string
}

export interface Pinned {
  /**
   * 是否启用置顶卡片
   * @default true
   */
  enable: boolean

  /**
   * 置顶卡片标题
   */
  title?: string

  /**
   * 置顶卡片列表
   */
  entries: PinnedEntry[]
}
