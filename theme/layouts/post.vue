<script setup lang="ts">
import { provideArticleToc } from '../features/article/toc-context'

provideArticleToc()
</script>

<template>
  <Layout>
    <div class="w-full">
      <LmArticle>
        <RouterView />
      </LmArticle>
    </div>
    <template #overlay>
      <LmArticleOutline />
      <LmTocMobile />
    </template>
  </Layout>
</template>
