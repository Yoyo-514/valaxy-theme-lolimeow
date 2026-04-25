import type { DefaultTheme } from 'valaxy'
import type { Background } from './background'
import type { Footer } from './footer'
import type { Hero } from './hero'
import type { LayoutOptions } from './layout'
import type { Links } from './link'
import type { NavbarOptions, NavItem } from './navbar'
import type { Notice } from './notice'
import type { Pagination } from './pagination'
import type { Pinned } from './pinned'
import type { PostListOptions } from './post-list'
import type { UserUI } from './ui'

export namespace LolimeowTheme {
  export type Config = ThemeConfig
  export type Sidebar = any
}

export interface ThemeConfig extends DefaultTheme.Config {
  /**
   * 页面布局配置
   */
  layout: LayoutOptions

  /**
   * UI 基础配置
   */
  ui: UserUI

  /**
   * 背景配置
   */
  background: Background

  /**
   *首屏配置
   */
  hero: Hero

  /**
   * 导航栏配置
   */
  navbar: NavItem[]
  navbarOptions: NavbarOptions

  /**
   * 公告配置
   */
  notice: Notice

  /**
   * 置顶卡片配置
   */
  pinned: Pinned

  /**
   * 友情链接配置
   */
  links: Links

  /**
   * 文章列表配置
   */
  postList: PostListOptions

  /**
   * 页脚配置
   */
  footer: Footer

  /**
   * 分页配置
   */
  pagination?: Pagination
}

export type ThemeUserConfig = {
  [K in keyof ThemeConfig]?: Partial<ThemeConfig[K]>
}
