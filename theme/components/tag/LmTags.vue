<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTagGroups } from '../../features/tag'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalPosts, totalTags } = useTagGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.tags.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.tags.stats.tags'),
      value: totalTags.value,
    },
    {
      label: t('pages.tags.stats.posts'),
      value: totalPosts.value,
    },
  ]
})
</script>

<template>
  <LmAggregatePage class="lm-tags-page" :title="pageTitle" :cover="pageCover" :stats="stats">
    <LmTagIndex
      :groups="groups"
      :empty-label="t('pages.tags.empty')"
      :post-count-label="t('pages.tags.postCountLabel')"
    />
  </LmAggregatePage>
</template>
