<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <Layout>
    <section class="py-24 text-center flex min-h-screen items-center justify-center">
      <div class="flex flex-col max-w-xl w-full items-center">
        <div
          class="text-[var(--lm-c-text-secondary)] border border-[var(--lm-c-border)] rounded-full bg-[var(--lm-c-bg-glass)] inline-flex h-14 w-14 items-center justify-center backdrop-blur-[12px]"
        >
          <div class="text-2xl" i-ri-alarm-warning-line />
        </div>

        <div class="text-[var(--lm-c-text-primary)] mt-6 w-full">
          <RouterView />
        </div>

        <div class="mt-8">
          <button
            type="button"
            class="text-sm text-[var(--lm-c-text-secondary)] px-5 py-2.5 border border-[var(--lm-c-border)] rounded-full bg-[var(--lm-c-bg-glass)] inline-flex transition-[color,border-color,transform,box-shadow] duration-250 ease-in-out items-center justify-center backdrop-blur-[12px] hover:text-[var(--lm-c-text-primary)] hover:border-[var(--lm-c-brand)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
            @click="router.back()"
          >
            {{ t('button.back') }}
          </button>
        </div>
      </div>
    </section>
  </Layout>
</template>
