import type { ThemeConfig, ThemeUserConfig } from '../types'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeUserConfig = {
  valaxyDarkOptions: {
    circleTransition: false,
  },

  ui: {
    primary: '#0078E7',
  },

  footer: {
    since: 2022,
    icon: {
      name: 'i-ri-cloud-line',
      animated: true,
      color: 'var(--va-c-primary)',
      url: 'https://sponsors.yunyoujun.cn',
      title: 'Sponsor YunYouJun',
    },

    powered: true,
  },

  navbar: [],
}

/**
 * generateSafelist by config
 * @param themeConfig
 */
export function generateSafelist(themeConfig: ThemeConfig) {
  const { navbar, footer, ui } = themeConfig
  const footerIcon = footer?.icon?.img ?? footer?.icon?.name

  const safelist: string[] = []

  if (footerIcon)
    safelist.push(footerIcon)

  navbar?.forEach((navbarItem) => {
    if (navbarItem.icon)
      safelist.push(navbarItem.icon)

    if (Array.isArray(navbarItem.items)) {
      navbarItem.items.forEach((item) => {
        if (item.icon)
          safelist.push(item.icon)
      })
    }
  })

  if (ui?.toggleLocaleBtn?.icon)
    safelist.push(ui.toggleLocaleBtn.icon)

  if (ui?.toggleDarkBtn?.darkIcon)
    safelist.push(ui.toggleDarkBtn.darkIcon)
  if (ui?.toggleDarkBtn?.lightIcon)
    safelist.push(ui.toggleDarkBtn.lightIcon)

  return safelist
}
