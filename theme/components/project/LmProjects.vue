<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectGroups } from '../../features/project'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalFeatured, totalGroups, totalProjects } = useProjectGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.projects.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.projects.stats.groups'),
      value: totalGroups.value,
    },
    {
      label: t('pages.projects.stats.projects'),
      value: totalProjects.value,
    },
    {
      label: t('pages.projects.stats.featured'),
      value: totalFeatured.value,
    },
  ]
})
</script>

<template>
  <LmAggregatePage class="lm-projects-page" :title="pageTitle" :cover="pageCover" :stats="stats">
    <div class="lm-projects-page__body lm-aggregate-body markdown-body prose dark:prose-invert">
      <slot />
    </div>

    <LmProjectList
      :groups="groups"
      :empty-label="t('pages.projects.empty')"
    />
  </LmAggregatePage>
</template>
