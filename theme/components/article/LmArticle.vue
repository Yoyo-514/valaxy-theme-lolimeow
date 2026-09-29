<template>
  <article class="lm-article">
    <LmArticleHeader />

    <div class="lm-article__content-stack">
      <div class="lm-article__content-main">
        <div class="lm-article__reading">
          <div class="markdown-body pb-4 max-w-none prose dark:prose-invert">
            <slot />
          </div>
        </div>

        <LmPostNav />
        <LmComment />
      </div>

      <div class="lm-article__toc-shell">
        <LmToc class="lm-article__toc" />
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.lm-article {
  @apply pb-6;
}

.lm-article__content-stack {
  @apply relative mx-auto w-full max-w-3xl;
}

.lm-article__content-main {
  @apply w-full min-w-0;
}

.lm-article__reading {
  @apply w-full px-4 sm:px-6 xl:px-0;
}

.lm-article__toc-shell {
  @apply hidden xl:block;
  min-width: 0;
}

@media (min-width: 1280px) {
  .lm-article__content-stack {
    // 正文保持居中，目录只使用右侧实际剩余空间，不再向视口外延伸。
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 48rem) minmax(0, 1fr);
    max-width: none;
  }

  .lm-article__content-main {
    grid-column: 2;
    grid-row: 1;
  }

  .lm-article__toc-shell {
    grid-column: 3;
    grid-row: 1;
    margin-inline: 2.75rem 1.5rem;
    max-width: 16rem;
  }
}
</style>
