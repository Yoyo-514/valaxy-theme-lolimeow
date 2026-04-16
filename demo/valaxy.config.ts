import type { ThemeConfig } from 'valaxy-theme-lolimeow'
import { defineConfig } from 'valaxy'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */
export default defineConfig<ThemeConfig>({
  theme: 'lolimeow',

  themeConfig: {
    ui: {
      primary: '#66CCFF',
    },

    // 背景图
    background: {
      type: 'image',
      image: {
        light: '/images/background1.webp',
        dark: '/images/background2.webp',
        urls: ['/images/background1.webp', '/images/background2.webp'],
        apiUrls: [
          'https://www.dmoe.cc/random.php',
        ],
        random: true,
        overlayOpacity: 0.3,
      },
    },

    // 首屏
    hero: {
      motto: ['中文测试test', 'Welcome to Valaxy Theme Lolimeow', 'Test Long Long Long Long Long Long Long Long Long Long Long Long Text'],
      cover: {
        urls: ['/images/background1.webp', '/images/background2.webp'],
        apiUrls: [
          'https://img.xjh.me/random_img.php?return=302',
        ],
        random: true,
        fixed: false,
      },
      typewriter: true,
    },

    // 导航栏
    navbar: [
      { text: '首页', link: '/', icon: 'i-ri-home-line' },
      { text: '归档', link: '/archives/', icon: 'i-ri-archive-line' },
      { text: '分类', link: '/categories/', icon: 'i-ri-folder-line' },
      { text: '标签', link: '/tags/', icon: 'i-ri-price-tag-3-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-links-line' },
      { text: '关于', link: '/about/', icon: 'i-ri-user-line' },
    ],
    navbarOptions: {
      title: 'My Blog',
      tools: ['toggleDark', 'search'],
      hamburgerStyle: 'classic',
    },

    // 公告
    notice: {
      enable: true,
      message: 'This is a notice message.',
      closable: true,
      scope: 'home',
    },

    // 置顶
    pinned: {
      enable: true,
      title: 'START',
      entries: [
        {
          title: 'Docs',
          link: 'https://valaxy.site',
          desc: 'Valaxy Documentation',
          img: '/images/background1.webp',
        },
        {
          title: 'About',
          link: '/about',
          desc: 'About Me',
          img: '/images/background2.webp',
        },
      ],
    },

    // 文章列表
    postList: {
      title: 'Discovery',
      coverApiUrls: ['https://img.xjh.me/random_img.php?return=302'],
      coverRandom: true,
      showExcerpt: true,
      excerptLength: 140,
      maxColumns: 1,
      minCardWidth: '18rem',
    },

    pagination: {
      type: 'infinite-scroll',
      animation: true,
      itemsPerPage: 10,
      infiniteScrollOptions: {
        preload: true,
        threshold: 200,
      },
    },

    footer: {
      since: 2023,
    },
  },
})
