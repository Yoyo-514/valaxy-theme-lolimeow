import type { ProjectGroup, ProjectItem, ProjectStatus } from '../../types'
import { computed } from 'vue'
import { useThemeConfig } from '../config'

export interface ProjectAction {
  type: 'visit' | 'repo' | 'docs' | 'demo'
  url: string
}

export interface ResolvedProjectItem extends ProjectItem {
  name: string
  desc: string
  color: string
  tags: string[]
  status: ProjectStatus
  featured: boolean
  actions: ProjectAction[]
}

export interface ResolvedProjectGroup {
  title: string
  desc: string
  items: ResolvedProjectItem[]
}

const DEFAULT_ACCENT_COLOR = 'var(--lm-c-brand)'
const DEFAULT_STATUS: ProjectStatus = 'active'

function normalizeProjectAction(type: ProjectAction['type'], url: string | undefined): ProjectAction | null {
  const normalizedUrl = url?.trim()
  if (!normalizedUrl)
    return null

  return {
    type,
    url: normalizedUrl,
  }
}

function normalizeProjectTags(tags: string[] | undefined) {
  if (!Array.isArray(tags))
    return []

  return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)))
}

function normalizeProjectStatus(status: ProjectStatus | undefined): ProjectStatus {
  if (status === 'archived' || status === 'wip')
    return status

  return DEFAULT_STATUS
}

function normalizeProjectItem(item: ProjectItem): ResolvedProjectItem | null {
  const name = item.name?.trim()
  if (!name)
    return null

  const actions = [
    normalizeProjectAction('visit', item.link),
    normalizeProjectAction('repo', item.repo),
    normalizeProjectAction('docs', item.docs),
    normalizeProjectAction('demo', item.demo),
  ].filter((action): action is ProjectAction => Boolean(action))

  return {
    ...item,
    name,
    desc: item.desc?.trim() ?? '',
    link: item.link?.trim() || undefined,
    repo: item.repo?.trim() || undefined,
    docs: item.docs?.trim() || undefined,
    demo: item.demo?.trim() || undefined,
    cover: item.cover?.trim() || undefined,
    icon: item.icon?.trim() || undefined,
    iconImg: item.iconImg?.trim() || undefined,
    color: item.color?.trim() || DEFAULT_ACCENT_COLOR,
    tags: normalizeProjectTags(item.tags),
    status: normalizeProjectStatus(item.status),
    featured: item.featured === true,
    actions,
  }
}

function normalizeProjectGroup(group: ProjectGroup): ResolvedProjectGroup | null {
  const items = (group.items ?? [])
    .map(normalizeProjectItem)
    .filter((item): item is ResolvedProjectItem => Boolean(item))

  if (!items.length)
    return null

  return {
    title: group.title?.trim() || 'Projects',
    desc: group.desc?.trim() ?? '',
    items,
  }
}

export function useProjectGroups() {
  const themeConfig = useThemeConfig()

  const groups = computed<ResolvedProjectGroup[]>(() => {
    return (themeConfig.value.projects?.groups ?? [])
      .map(normalizeProjectGroup)
      .filter((group): group is ResolvedProjectGroup => Boolean(group))
  })

  const totalGroups = computed(() => groups.value.length)
  const totalProjects = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.length, 0)
  })
  const totalFeatured = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.filter(item => item.featured).length, 0)
  })

  return {
    groups,
    totalFeatured,
    totalGroups,
    totalProjects,
  }
}
