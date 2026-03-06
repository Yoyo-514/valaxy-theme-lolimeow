<script setup lang="ts">
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '../composables'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const themeConfig = useThemeConfig()

const title = computed(() => themeConfig.value.postList.title ?? 'Discovery')
const routes = usePostList({ type: props.type || '' })
const posts = computed(() => props.posts || routes.value)
</script>

<template>
  <section class="py-8 md:py-12">
    <div class="mb-6">
      <h2 class="text-[1.5rem] text-[var(--lm-c-text-primary)] leading-[1.3] font-700 m-0">
        {{ title }}
      </h2>
    </div>
    <ul v-if="posts.length > 0" class="m-0 p-0 list-none flex flex-col gap-4">
      <template v-for="post in posts" :key="post.path">
        <Transition name="fade">
          <li v-if="post" class="m-0">
            <LmPostCard :post="post" />
          </li>
        </Transition>
      </template>
    </ul>
    <div
      v-else
      class="text-[var(--lm-c-text-secondary)] px-4 py-12 text-center border border-[var(--lm-c-border)] rounded-4 border-dashed bg-[color-mix(in_srgb,var(--lm-c-bg-glass)_72%,transparent)]"
    >
      No posts found.
    </div>
  </section>
</template>
