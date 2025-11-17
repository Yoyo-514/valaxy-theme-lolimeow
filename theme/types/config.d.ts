import type { DefaultTheme } from 'valaxy'
import type { Footer } from './footer'
import type { NavbarOptions, NavItem } from './navbar'
import type { Pagination } from './pagination'
import type { UserUI } from './ui'

export namespace LolimeowTheme {
  export type Config = ThemeConfig
  export type Sidebar = any
}

export interface ThemeConfig extends DefaultTheme.Config {
  ui: UserUI

  footer: Footer

  navbar: NavItem[]
  navbarOptions: NavbarOptions
  /**
   * Pagination configuration
   */
  pagination?: Pagination
}

export type ThemeUserConfig = {
  [K in keyof ThemeConfig]?: Partial<ThemeConfig[K]>
}
