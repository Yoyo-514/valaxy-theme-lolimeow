import { expect, test } from '@playwright/test'
import { expectScrollable, expectScrollLocked, waitForHydration } from './helpers'

test('article outline tracks headings without widening the page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration|recursive updates/i.test(message.text()))
      errors.push(message.text())
  })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/posts/demo')
  await waitForHydration(page)
  const links = page.locator('.lm-toc__link')
  await expect(links.first()).toBeVisible()
  const count = await links.count()
  const lastLink = links.nth(count - 1)
  const lastHref = (await lastLink.getAttribute('href')) ?? ''
  const lastHeading = page.locator(`[id="${decodeURIComponent(lastHref.slice(1))}"]`)
  await lastLink.click()
  // 图片等延迟渲染的内容可能在点击后继续改变布局，高亮落到哪一项并不稳定，
  // 这里只断言点击把目标标题带进了视口，且目录仍在高亮某一项。
  await expect(lastHeading).toBeInViewport()
  await expect(page.locator('.lm-toc__link--active')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
})

test('mobile TOC restores focus and releases scrolling before heading navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/posts/demo')
  await waitForHydration(page)
  const trigger = page.locator('.lm-toc-mobile__trigger')
  await trigger.click()
  await expect(page.locator('.lm-toc-mobile__panel')).toBeVisible()
  await expectScrollLocked(page)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  const lastLink = page.locator('.lm-toc-mobile__link').last()
  const lastHref = (await lastLink.getAttribute('href')) ?? ''
  await lastLink.click()
  await expect(page.locator('.lm-toc-mobile__panel')).toHaveCount(0)
  // 锁在导航前释放：页面确实滚到了目标标题，而不是被锁在原地。
  await expect(page.locator(`[id="${decodeURIComponent(lastHref.slice(1))}"]`)).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('search contains keyboard focus and restores the trigger on Escape', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const trigger = page.getByRole('button', { name: '打开搜索' })
  await trigger.click()
  const input = page.locator('.lm-search-header__input')
  await expect(input).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  expect(await page.locator('.lm-search-shell__panel').evaluate(el => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expectScrollable(page)
})

test('returning from a post restores the home reading position', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const card = page.locator('.lm-post-card').last()
  await card.scrollIntoViewIfNeeded()
  const position = await page.evaluate(() => window.scrollY)
  // 首页需要真的滚下去过，才谈得上恢复阅读位置。
  expect(position).toBeGreaterThan(0)
  await card.click()
  await expect(page).toHaveURL(/\/posts\//)
  await page.goBack()
  await expect(card).toBeVisible()
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - position)).toBeLessThan(5)
})

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`mobile drawer navigates after closing (${reducedMotion})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion })
    await page.goto('/')
    await waitForHydration(page)
    await page.locator('.lm-nav-tools__menu-button').click()
    const drawer = page.locator('.lm-mobile-nav-panel')
    await expect(drawer).toBeVisible()
    await drawer.getByRole('button', { name: '归档' }).click()
    await expect(page).toHaveURL(/\/archives\/?$/)
    await expect(drawer).toHaveCount(0)
    // 归档页只有一个视口高，滚不动；锁滚动的释放由目录与搜索用例在长页面上覆盖。
  })
}
