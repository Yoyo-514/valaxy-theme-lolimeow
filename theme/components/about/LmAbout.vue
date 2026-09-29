<script setup lang="ts">
import { useAboutProfile } from '../../features/about'

const {
  authorAvatar,
  authorName,
  description,
  pageCover,
  pageTitle,
  profileLabel,
  socialLinks,
} = useAboutProfile()
</script>

<template>
  <LmAggregatePage class="lm-about-page" :title="pageTitle" :cover="pageCover">
    <section class="lm-about-profile" :class="{ 'lm-about-profile--with-avatar': authorAvatar }" :aria-label="profileLabel">
      <div v-if="authorAvatar" class="lm-about-profile__avatar-wrap">
        <LmImage
          class="lm-about-profile__avatar"
          :src="authorAvatar"
          :alt="authorName"
        />
      </div>

      <div class="lm-about-profile__body">
        <h2 class="lm-about-profile__name">
          {{ authorName }}
        </h2>

        <p v-if="description" class="lm-about-profile__description">
          {{ description }}
        </p>

        <LmAboutSocialLinks
          v-if="socialLinks.length"
          :items="socialLinks"
        />
      </div>
    </section>

    <div class="lm-about-page__body lm-aggregate-body markdown-body prose dark:prose-invert">
      <slot />
    </div>
  </LmAggregatePage>
</template>

<style scoped lang="scss">
.lm-about-profile {
  @apply relative grid gap-5 overflow-hidden rounded-5 border p-5 sm:p-6;
  color: var(--lm-c-text-primary);
  border-color: var(--lm-c-primary-border);
  background:
    radial-gradient(circle at 10% 0%, var(--lm-c-primary-soft), transparent 32%),
    color-mix(in srgb, var(--lm-surface-reading-bg) 84%, transparent);
}

.lm-about-profile--with-avatar {
  @apply sm:grid-cols-[6.5rem_minmax(0,1fr)];
}

.lm-about-profile__avatar-wrap {
  @apply h-24 w-24 overflow-hidden rounded-5 border p-1 sm:h-26 sm:w-26;
  border-color: var(--lm-c-accent-border);
  background: var(--lm-c-accent-soft);
}

.lm-about-profile__avatar {
  @apply h-full w-full rounded-4 object-cover;
}

.lm-about-profile__body {
  @apply flex min-w-0 flex-col justify-center;
  overflow-wrap: anywhere;
}

.lm-about-profile__name {
  @apply m-0 text-2xl leading-9 font-900 sm:text-3xl;
}

.lm-about-profile__description {
  @apply m-0 mt-2 max-w-2xl text-sm leading-7 sm:text-base;
  color: var(--lm-c-text-secondary);
}
</style>
