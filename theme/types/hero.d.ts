export type HeroMottoSource = 'config' | 'hitokoto'

export interface HeroHitokotoDisplayOptions {
  /**
   * 是否在一言后展示来源
   * @default false
   */
  showFrom?: boolean

  /**
   * 一言正文与来源之间的分隔符
   * @default '——'
   */
  fromSeparator?: string
}

export interface Hero {
  /**
   * 是否启用首屏封面
   * @default true
   */
  enable: boolean

  /**
   * 封面背景图设置
   * - 不配置 cover: 继承全局背景设置
   * - 配置 cover: 以 cover 为准，覆盖全局背景设置
   */
  cover?: HeroCover

  /**
   * 签名文字
   * 支持字符串（固定显示）或字符串数组（打字机轮播效果）
   * @default ''
   */
  motto: string | string[]

  /**
   * 签名文案来源
   * - config: 使用 themeConfig.hero.motto
   * - hitokoto: 使用 valaxy-addon-hitokoto
   * @default 'config'
   */
  mottoSource: HeroMottoSource

  /**
   * 一言在 Hero motto 中的展示配置；请求参数请写在 addonHitokoto({...}) 中
   */
  hitokoto: HeroHitokotoDisplayOptions

  /**
   * 签名切换间隔（ms），仅在 motto 为字符串数组时生效
   * @default 4000
   */
  mottoInterval: number

  /**
   * 是否启用打字机效果
   * @default true
   */
  typewriter: boolean

  /**
   * 打字机效果速度（ms/字符），仅在 motto 为字符串数组且 typewriter 为 true 时生效
   * @default 100
   */
  typingSpeed: number

  /**
   * 是否在封面上显示社交图标
   * @default true
   */
  showSocialIcons: boolean

  /**
   * 是否显示向下滚动箭头
   * @default true
   */
  showScrollDown: boolean

  /**
   * 封面高度
   * @default '100vh'
   */
  height: string

  /**
   * 封面上文字的对齐方式
   * @default 'center'
   */
  textAlign: 'left' | 'center' | 'right'
}

interface HeroCover {
  /**
   * 本地/静态图片列表
   */
  urls?: string[]

  /**
   * 随机图片 API 列表
   */
  apiUrls?: string[]

  /**
   * 是否启用随机取图
   * - true: 优先 使用 apiUrls 中的随机图片，apiUrls 为空时使用 urls 中的随机图片
   * - false: 使用 desktop/mobile 中的单图或 urls 中的第一张图片
   * @default false
   */
  random?: boolean
  /**
   * 多图轮换间隔（ms）
   * 当 urls 有多张，或 random 为 true 时生效
   * @default 12000
   */
  rotationInterval?: number

  /**
   * 单图配置
   * 当 random 为 false 且 urls 为空时生效
   */
  desktop?: string
  mobile?: string

  /**
   * 是否固定背景
   * @default false
   */
  fixed?: boolean

  /**
   * 封面叠加遮罩透明度（0-1），帮助文字在图片上可读
   * @default 0.3
   */
  overlayOpacity?: number
}
