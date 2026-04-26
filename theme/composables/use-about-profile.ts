import { useFrontmatter, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../utils'

interface SiteAuthor {
  avatar?: string
  name?: string
}

export interface AboutSocialLink {
  name: string
  link: string
  icon?: string
  color?: string
}

function normalizeSocialLink(item: unknown): AboutSocialLink | null {
  if (!item || typeof item !== 'object')
    return null

  const data = item as Record<string, unknown>
  const name = resolveFrontmatterText(data.name)
  const link = resolveFrontmatterText(data.link)

  if (!name || !link)
    return null

  return {
    name,
    link,
    icon: resolveFrontmatterText(data.icon) || undefined,
    color: resolveFrontmatterText(data.color) || undefined,
  }
}

export function useAboutProfile() {
  const { t } = useI18n()
  const frontmatter = useFrontmatter()
  const siteConfig = useSiteConfig()

  const pageTitle = computed(() => {
    return resolveFrontmatterText(frontmatter.value.title, t('pages.about.title'))
  })

  const pageCover = computed(() => {
    return resolveFrontmatterCover(frontmatter.value)
  })

  const author = computed<SiteAuthor>(() => siteConfig.value.author || {})
  const authorName = computed(() => {
    return resolveFrontmatterText(frontmatter.value.name, author.value.name || siteConfig.value.title || pageTitle.value)
  })
  const authorAvatar = computed(() => {
    return resolveFrontmatterText(frontmatter.value.avatar, author.value.avatar || '')
  })
  const description = computed(() => {
    return resolveFrontmatterText(
      frontmatter.value.description ?? frontmatter.value.subtitle,
      siteConfig.value.description || t('pages.about.description'),
    )
  })
  const socialLinks = computed<AboutSocialLink[]>(() => {
    const links: unknown = siteConfig.value.social

    return Array.isArray(links)
      ? links.map(normalizeSocialLink).filter((item): item is AboutSocialLink => Boolean(item))
      : []
  })

  return {
    authorAvatar,
    authorName,
    description,
    pageEyebrow: computed(() => t('pages.about.eyebrow')),
    pageCover,
    pageTitle,
    profileLabel: computed(() => t('pages.about.profile')),
    socialLinks,
  }
}
