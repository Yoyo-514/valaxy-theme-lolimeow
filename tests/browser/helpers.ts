import type { Page } from '@playwright/test'

/** SSG 页面按钮在水合前已可见；等待 Vue 挂载完成后再测试交互。 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#app') as Element & { __vue_app__?: unknown })?.__vue_app__))
}
