<script setup lang="ts">
import { useFrontmatter, usePostList } from 'valaxy'
import { computed } from 'vue'

import { useRoute } from 'vue-router'

const frontmatter = useFrontmatter()

const route = useRoute()
const posts = usePostList()

function findCurrentIndex() {
  return posts.value.findIndex(p => p.path === route.path)
}

const nextPost = computed(() => posts.value[findCurrentIndex() - 1])
const prevPost = computed(() => posts.value[findCurrentIndex() + 1])
</script>

<template>
  <article class="pt-24">
    <header class="pt-6 text-center space-y-1 xl:pb-4">
      <h1
        class="lm-text text-3xl leading-9 tracking-tight font-extrabold md:text-5xl md:leading-14"
      >
        {{ frontmatter.title }}
      </h1>
      <LmDate :date="frontmatter.date" />
    </header>

    <div class="px-4 pb-3 pt-2">
      <slot />
    </div>

    <footer
      class="text-sm leading-5 font-medium mt-4 border-t border-[var(--lm-c-border)] grid grid-cols-2"
    >
      <div v-if="prevPost && prevPost.path" class="py-4">
        <h2 class="text-xs text-gray-500 tracking-wide uppercase">
          Previous Article
        </h2>
        <div class="link">
          <RouterLink :to="prevPost.path">
            {{ prevPost.title }}
          </RouterLink>
        </div>
      </div>
      <div v-if="nextPost && nextPost.path" class="py-4 text-right only-child:grid-col-2">
        <h2 class="text-xs text-gray-500 tracking-wide uppercase">
          Next Article
        </h2>
        <div class="link">
          <RouterLink :to="nextPost.path">
            {{ nextPost.title }}
          </RouterLink>
        </div>
      </div>
    </footer>
  </article>
</template>
