<script setup lang="ts">
import type { Post } from 'valaxy'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <dl class="pb-10 pt-6 xl:pt-11 xl:border-b xl:border-gray-200">
    <dt class="sr-only">
      Authors
    </dt>
    <dd>
      <ul
        class="flex justify-center space-x-8 xl:block sm:space-x-12 xl:space-x-0 xl:space-y-8"
      >
        <li class="flex items-center space-x-2">
          <img
            v-if="frontmatter.gravatar"
            :src="`https://gravatar.com/avatar/${frontmatter.gravatar}`"
            alt="author image"
            class="rounded-full h-10 w-10"
          >
          <dl class="text-sm leading-5 font-medium whitespace-nowrap">
            <dt class="sr-only">
              Name
            </dt>
            <dd class="st-text">
              {{ frontmatter.author }}
            </dd>
            <dt v-if="frontmatter.twitter" class="sr-only">
              Twitter
            </dt>
            <dd v-if="frontmatter.twitter">
              <a
                :href="`https://twitter.com/${frontmatter.twitter}`"
                target="_blank"
                rel="noopnener noreferrer"
                class="link"
              >{{ frontmatter.twitter }}</a>
            </dd>
          </dl>
        </li>
      </ul>
    </dd>
  </dl>
</template>
