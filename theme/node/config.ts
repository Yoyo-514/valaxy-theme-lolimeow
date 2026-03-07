import type { ThemeConfig } from '../types'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  valaxyDarkOptions: {
    circleTransition: false,
  },

  layout: {
    general: {
      layout: 'double-columns',
      sidebar: {
        left: [],
        right: [],
      },
    },
    home: {
      layout: 'single-column',
    },
    post: {
      layout: 'double-columns',
      sidebar: {
        left: [],
        right: ['LmToc'],
      },
    },
  },

  ui: {
    primary: '#66CCFF',
  },

  background: {
    type: 'none',
    image: {
      light: '',
      dark: '',
      urls: [],
      apiUrls: [],
      random: false,
      position: 'center center',
      size: 'cover',
      fixed: true,
      overlayOpacity: 0.3,
    },
    gradient: {
      light: '',
      dark: '',
    },
  },

  hero: {
    enable: true,
    cover: {
      urls: [],
      apiUrls: [],
      random: false,
      desktop: '',
      mobile: '',
      fixed: false,
      overlayOpacity: 0.3,
    },
    motto: '',
    mottoInterval: 4000,
    typewriter: true,
    typingSpeed: 100,
    showSocialIcons: true,
    showScrollDown: true,
    height: '100vh',
    textAlign: 'center',
  },

  navbar: [],
  navbarOptions: {
    showFavicon: true,
    tools: ['toggleDark', 'search'],
    hamburgerStyle: 'uneven',
    autoHide: true,
  },

  notice: {
    enable: false,
    message: '',
    closable: true,
    scope: 'home',
  },

  pinned: {
    enable: false,
    title: 'Pinned',
    entries: [],
  },

  postList: {
    title: 'Discovery',
    imageReversed: false,
    coverFallback: [],
    coverApiUrls: [],
    coverRandom: false,
    showExcerpt: true,
    excerptLength: 140,
    columns: {
      'sm': 1,
      'md': 1,
      'lg': 2,
      'xl': 2,
      '2xl': 3,
    },
  },

  footer: {
    since: 2023,
    icon: {
      enable: true,
      name: 'i-ri-heart-fill',
      animated: true,
      color: 'var(--lm-c-brand)',
      url: '',
      title: '',
    },

    powered: true,
  },

  pagination: {
    type: 'standard',
    animation: true,
    itemsPerPage: 10,
    infiniteScrollOptions: {
      preload: true,
      threshold: 200,
    },
  },
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
