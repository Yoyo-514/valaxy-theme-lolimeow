import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** SSG 页面按钮在水合前已可见；等待 Vue 挂载完成后再测试交互。 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#app') as Element & { __vue_app__?: unknown })?.__vue_app__))
}

/** 页面此刻不可滚动。不关心锁用什么手段，只看用户还能不能滚。 */
export async function expectScrollLocked(page: Page) {
  const before = await page.evaluate(() => window.scrollY)
  await page.evaluate(() => window.scrollTo(0, window.scrollY + 120))
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
}

/** 页面此刻可以滚动：锁释放后滚动立即生效。 */
export async function expectScrollable(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 120))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(120)
}
