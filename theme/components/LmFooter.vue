<script lang="ts" setup>
import { useSiteConfig, useValaxyConfig } from 'valaxy'
import pkg from 'valaxy/package.json'
import { capitalize, computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'

const { t } = useI18n()

const config = useValaxyConfig()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const year = new Date().getFullYear()

const isThisYear = computed(() => {
  return year === themeConfig.value.footer.since
})

const poweredHtml = computed(() => t('footer.powered', [`<a href="${pkg.repository}" target="_blank" rel="noopener">Valaxy</a> v${pkg.version}`]))
const footerIcon = computed(() => themeConfig.value.footer.icon!)
</script>

<template>
  <footer class="text-sm text-[var(--lm-c-text-secondary)] leading-[1.7] px-4 py-8 text-center">
    <div v-if="themeConfig.footer.icp" class="mb-3">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener"
        class="text-[var(--lm-c-link)] no-underline transition-colors duration-250 ease-in-out hover:text-[var(--lm-c-text-primary)]"
      >
        {{ themeConfig.footer.icp }}
      </a>
    </div>

    <div class="text-[var(--lm-c-text-secondary)] flex flex-wrap gap-2 items-center justify-center">
      <span>
        &copy;
        <template v-if="!isThisYear">
          {{ themeConfig.footer.since }} -
        </template>
        {{ year }}
      </span>

      <a
        class="text-[var(--lm-c-brand)] no-underline inline-flex transition-colors duration-250 ease-in-out items-center justify-center hover:text-[var(--lm-c-text-primary)]"
        :href="footerIcon.url"
        target="_blank"
        :title="footerIcon.title"
      >
        <div :class="footerIcon.name" />
      </a>

      <span>{{ siteConfig.author.name }}</span>
    </div>

    <div v-if="themeConfig.footer.powered" class="text-[var(--lm-c-text-muted)] mt-3">
      <span v-html="poweredHtml" />
      <span>
        | {{ t('footer.theme') }} -
        <a
          class="text-[var(--lm-c-link)] no-underline transition-colors duration-250 ease-in-out hover:text-[var(--lm-c-text-primary)]"
          :href="themeConfig.pkg.homepage"
          :title="`valaxy-theme-${config.theme}`"
          target="_blank"
        >
          {{ capitalize(config.theme) }}
        </a>
        v{{ themeConfig.pkg.version }}
      </span>
    </div>

    <slot />
  </footer>
</template>
