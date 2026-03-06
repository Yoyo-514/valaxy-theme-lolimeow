<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  post: Post
}>()
</script>

<template>
  <article
    class="border border-[var(--lm-c-border)] rounded-2 bg-[var(--lm-c-bg-glass)] transition-[border-color,background-color,box-shadow,transform] duration-250 ease-in-out overflow-hidden hover:border-[var(--lm-c-brand)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
  >
    <RouterLink :to="post.path || ''" class="text-inherit px-4 pb-[1.125rem] pt-4 no-underline block">
      <LmDate :date="post.date" />
      <div class="mt-3">
        <h2 class="text-[1.5rem] text-[var(--lm-c-text-primary)] leading-[1.3] font-700 m-0">
          {{ post.title }}
        </h2>
      </div>
      <div
        v-if="post.excerpt"
        class="text-[var(--lm-c-text-muted)] leading-[1.7] mt-3"
        v-html="post.excerpt"
      />
    </RouterLink>
  </article>
</template>
