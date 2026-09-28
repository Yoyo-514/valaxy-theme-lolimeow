<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArchiveGroups } from '../../features/archive'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalPosts } = useArchiveGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.archives.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.archives.stats.posts'),
      value: totalPosts.value,
    },
  ]
})
</script>

<template>
  <LmAggregatePage class="lm-archives-page" :title="pageTitle" :cover="pageCover" :stats="stats">
    <LmArchiveTimeline
      :groups="groups"
      :empty-label="t('pages.archives.empty')"
      :unknown-year-label="t('pages.archives.unknownYear')"
      :count-label="t('pages.archives.countLabel')"
    />
  </LmAggregatePage>
</template>
