<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  post: Post
}>()
</script>

<template>
  <article class="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
    <StarterDate :date="post.date" />
    <div class="space-y-5 xl:col-span-3">
      <div class="space-y-6">
        <h2 class="text-2xl leading-8 tracking-tight font-bold">
          <RouterLink class="st-text" :to="post.path || ''">
            {{ post.title }}
          </RouterLink>
        </h2>
        <div
          v-if="post.excerpt"
          class="text-gray-500 max-w-none prose dark:prose-invert"
          v-html="post.excerpt"
        />
      </div>
      <div class="text-base leading-6 font-medium">
        <RouterLink class="link" aria-label="read more" :to="post.path || ''">
          Read more →
        </RouterLink>
      </div>
    </div>
  </article>
</template>
