<script lang="ts" setup>
import type { Post } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { usePostCardViewModel } from '../composables'

const props = defineProps<{
  post: Post
  index?: number
}>()

const imageLoaded = ref(false)

const {
  title,
  currentCover: cover,
  excerpt,
  tags,
  hasMedia,
  isTextOnly,
  isReversed,
  handleCoverError,
} = usePostCardViewModel(props.post, props.index ?? 0)

watch(
  () => cover.value,
  () => {
    imageLoaded.value = false
  },
  { immediate: true },
)

const showLoadingPlaceholder = computed(() => hasMedia.value && !imageLoaded.value)

function handleImageLoad() {
  imageLoaded.value = true
}
</script>

<template>
  <RouterLink
    :to="post.path || ''"
    class="lm-post-card group rounded-2 no-underline h-full w-full block relative overflow-hidden"
    :class="{ 'lm-post-card--reversed': isReversed, 'lm-post-card--text-only': isTextOnly }"
  >
    <div v-if="hasMedia" class="lm-post-card__media min-h-full self-stretch relative overflow-hidden">
      <div class="lm-post-card__media-shape inset-0 absolute overflow-hidden">
        <div
          v-if="showLoadingPlaceholder"
          class="lm-post-card__loading-placeholder inset-0 absolute"
          aria-hidden="true"
        />

        <img
          v-if="cover"
          :src="cover"
          alt=""
          class="lm-post-card__image h-full w-full block inset-0 absolute object-cover"
          :class="{ 'lm-post-card__image--visible': imageLoaded }"
          @load="handleImageLoad"
          @error="handleCoverError"
        >
      </div>
    </div>

    <div class="lm-post-card__content px-[1.35rem] py-[1.2rem] flex flex-col min-w-0 justify-start">
      <LmDate :date="post.date" />
      <h2 class="lm-post-card__title text-[1.45rem] text-[var(--lm-c-text-primary)] leading-[1.3] font-700 mt-[0.55rem] line-clamp-2">
        {{ title }}
      </h2>

      <div v-if="tags.length" class="lm-post-card__tags mt-[0.6rem] flex flex-wrap gap-[0.4rem]">
        <span
          v-for="tag in tags"
          :key="tag"
          class="lm-post-card__tag text-[0.75rem] text-[var(--lm-c-text-secondary)] px-[0.45rem] py-[0.1rem] rounded-full bg-[color-mix(in_srgb,var(--lm-c-brand)_10%,transparent)]"
        >
          {{ tag }}
        </span>
      </div>

      <p v-if="excerpt" class="lm-post-card__excerpt text-[var(--lm-c-text-muted)] leading-[1.7] mt-[0.8rem] text-right line-clamp-3">
        {{ excerpt }}
      </p>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
@use '../styles/mixins/surface' as *;

.lm-post-card {
  @include lm-surface-panel;

  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  min-height: 12rem;
  border: 1px solid var(--lm-c-border);
  transition:
    border-color 240ms ease,
    transform 240ms ease,
    box-shadow 240ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--lm-c-brand) 28%, var(--lm-c-border));
    transform: translateY(-2px);
  }
}

.lm-post-card--text-only {
  grid-template-columns: 1fr;
  min-height: auto;
}

.lm-post-card--text-only::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--lm-c-brand) 10%, transparent), transparent 40%),
    linear-gradient(135deg, transparent 0 62%, rgba(255, 255, 255, 0.08) 62% 100%);
  opacity: 0.8;
}

.lm-post-card--text-only {
  .lm-post-card__content {
    align-items: flex-start;
    text-align: left;
  }
  .lm-post-card__excerpt {
    text-align: left;
  }
}

.lm-post-card__media-shape {
  clip-path: polygon(0 0, 80% 0, 100% 100%, 0 100%);
}

.lm-post-card__image {
  opacity: 0;
  transition: opacity 220ms ease;
}

.lm-post-card__image--visible {
  opacity: 1;
}

.lm-post-card__loading-placeholder {
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--lm-c-bg-glass) 92%, white) 0%,
    color-mix(in srgb, var(--lm-c-brand-soft) 20%, var(--lm-c-bg-glass)) 100%
  );
}

.lm-post-card__loading-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.3) 45%, transparent 100%);
  transform: translateX(-100%);
  animation: lm-post-card-shimmer 1.8s ease-in-out infinite;
}

@keyframes lm-post-card-shimmer {
  to {
    transform: translateX(100%);
  }
}

.lm-post-card__content {
  align-items: flex-end;
  text-align: right;
}

.lm-post-card--reversed {
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);

  .lm-post-card__media {
    order: 2;
  }

  .lm-post-card__media-shape {
    clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%);
  }

  .lm-post-card__content {
    order: 1;
    align-items: flex-start;
  }

  .lm-post-card__excerpt {
    text-align: left;
  }
}

@container (max-width: 24rem) {
  .lm-post-card,
  .lm-post-card--reversed {
    grid-template-columns: 1fr;
    min-height: unset;
  }

  .lm-post-card__media,
  .lm-post-card--reversed .lm-post-card__media {
    order: 1;
  }

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    order: 2;
  }

  .lm-post-card__media-shape,
  .lm-post-card--reversed .lm-post-card__media-shape {
    clip-path: none;
  }

  .lm-post-card__media {
    min-height: 9rem;
  }

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .lm-post-card,
  .lm-post-card--reversed {
    grid-template-columns: 1fr;
    min-height: unset;
  }

  .lm-post-card__media,
  .lm-post-card--reversed .lm-post-card__media {
    order: 1;
  }

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    order: 2;
  }

  .lm-post-card__media-shape,
  .lm-post-card--reversed .lm-post-card__media-shape {
    clip-path: none;
  }

  .lm-post-card__media {
    min-height: 9rem;
  }
}
</style>
