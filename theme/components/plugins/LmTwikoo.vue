<script setup lang="ts">
/**
 * @deprecated Twikoo 集成已停止维护。
 * 当前文件仅保留历史实现与样式作为迁移参考，不再推荐启用。
 * 主题运行时分发已切换为仅使用 Waline，相关入口见 `theme/components/LmComment.vue`。
 */
// 已废弃：保留旧实现供迁移参考。
// import { useTwikooWithOptions } from 'valaxy-addon-twikoo'

// 已废弃：保留旧样式供迁移参考。
// import 'valaxy-addon-twikoo/client/styles/index.scss'

// 已废弃：保留旧初始化逻辑供迁移参考。
// useTwikooWithOptions()
</script>

<template>
  <div class="lm-twikoo">
    <div id="tcomment" w="full" />
  </div>
</template>

<style lang="scss" scoped>
.lm-twikoo {
  @apply w-full;
}

:deep(#twikoo) {
  color: var(--lm-c-text-primary);
}

:deep(#twikoo .tk-input),
:deep(#twikoo .tk-content),
:deep(#twikoo .tk-preview-container),
:deep(#twikoo .tk-comments-container) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 14%, var(--lm-c-border));
}

:deep(#twikoo .tk-input),
:deep(#twikoo .tk-content),
:deep(#twikoo .tk-preview-container) {
  border-radius: 0.75rem;
}

:deep(#twikoo .el-input__inner),
:deep(#twikoo .el-textarea__inner),
:deep(#twikoo input),
:deep(#twikoo textarea) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 84%, transparent);
  color: var(--lm-c-text-primary);
  box-shadow: none;
}

:deep(#twikoo .el-input__inner),
:deep(#twikoo .el-textarea__inner) {
  padding: 0.5rem 0.75rem;
}

:deep(#twikoo .el-input__inner::placeholder),
:deep(#twikoo .el-textarea__inner::placeholder),
:deep(#twikoo input::placeholder),
:deep(#twikoo textarea::placeholder) {
  color: var(--lm-c-text-muted);
}

:deep(#twikoo .tk-meta),
:deep(#twikoo .tk-extras),
:deep(#twikoo .tk-time),
:deep(#twikoo .tk-row.actions),
:deep(#twikoo .tk-action-link) {
  color: var(--lm-c-text-secondary);
}

:deep(#twikoo .tk-action-link:hover),
:deep(#twikoo a:hover) {
  color: var(--lm-c-brand-strong);
}

:deep(#twikoo .tk-submit .el-button),
:deep(#twikoo .tk-preview .el-button),
:deep(#twikoo .el-button) {
  border-radius: 0.75rem;
  border-color: color-mix(in srgb, var(--lm-c-brand) 18%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 84%, transparent);
  color: var(--lm-c-text-primary);
  box-shadow: none;
}

:deep(#twikoo .tk-submit .el-button--primary),
:deep(#twikoo .tk-preview .el-button--primary),
:deep(#twikoo .el-button--primary) {
  border-color: color-mix(in srgb, var(--lm-c-brand) 52%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-c-brand) 88%, white);
  color: white;
}

:deep(#twikoo .tk-tag),
:deep(#twikoo .tk-extra) {
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-c-brand) 8%, transparent);
}

:deep(#twikoo .tk-avatar),
:deep(#twikoo .tk-avatar img) {
  border-radius: 9999px;
}

:deep(#twikoo .tk-content blockquote),
:deep(#twikoo .tk-preview-container blockquote) {
  border-left: 3px solid color-mix(in srgb, var(--lm-c-brand) 50%, white);
  color: var(--lm-c-text-secondary);
}
</style>
