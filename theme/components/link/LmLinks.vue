<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLinkGroups } from '../../features/link'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, statusCheck, totalGroups, totalLinks } = useLinkGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.links.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.links.stats.groups'),
      value: totalGroups.value,
    },
    {
      label: t('pages.links.stats.links'),
      value: totalLinks.value,
    },
  ]
})
</script>

<template>
  <LmAggregatePage class="lm-links-page" :title="pageTitle" :cover="pageCover" :stats="stats">
    <div class="lm-links-page__body lm-aggregate-body markdown-body prose dark:prose-invert">
      <slot />
    </div>

    <LmLinkList
      :groups="groups"
      :empty-label="t('pages.links.empty')"
      :status-check="statusCheck"
    />
  </LmAggregatePage>
</template>
