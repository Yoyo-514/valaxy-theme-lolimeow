<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoryGroups } from '../../features/category'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { categories, totalCategories, totalPosts } = useCategoryGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.categories.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.categories.stats.categories'),
      value: totalCategories.value,
    },
    {
      label: t('pages.categories.stats.posts'),
      value: totalPosts.value,
    },
  ]
})
</script>

<template>
  <LmAggregatePage class="lm-categories-page" :title="pageTitle" :cover="pageCover" :stats="stats">
    <LmCategoryTree
      :nodes="categories"
      :empty-label="t('pages.categories.empty')"
      :post-count-label="t('pages.categories.postCountLabel')"
      :child-count-label="t('pages.categories.childCountLabel')"
      :uncategorized-label="t('pages.categories.uncategorized')"
    />
  </LmAggregatePage>
</template>
