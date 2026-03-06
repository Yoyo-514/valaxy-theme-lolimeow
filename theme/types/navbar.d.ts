export interface NavItem {
  text?: string
  link: string
  icon?: string
  /**
   * i18n localization
   */
  locale?: string | number
  /**
   * Icon animation
   */
  animated?: string
  /**
   * The target attribute of the <a> tag, specifying how to open the link
   */
  target?: '_blank' | '_self' | '_parent' | '_top' | ''
  /**
   * Submenu Items
   */
  items?: NavItem[]
}

export interface NavbarOptions {
  /**
   * Whether to display the site favicon
   * @efault true
   */
  showFavicon?: boolean
  /**
   * The title of the navbar
   */
  title?: string | string[]
  subTitle?: string
  /**
   * Tool buttons to include in the navbar
   * @default ['toggleDark', 'search']
   */
  tools?: ('toggleLocale' | 'toggleDark' | 'search')[]
  /**
   * The style of the hamburger menu in the navbar
   * - 'uneven': A style where one line is different in length
   * - 'classic': The traditional three equal-length lines
   * @default 'uneven'
   */
  hamburgerStyle?: 'uneven' | 'classic'

  /**
   * 导航栏是否随滚动自动隐藏/显示
   * @default true
   */
  autoHide?: boolean
}
