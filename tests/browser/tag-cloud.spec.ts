import { expect, test } from '@playwright/test'
import { waitForHydration } from './helpers'

for (const width of [412, 1350]) {
  test(`tag cloud keeps the page stable and filters posts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 })
    await page.addInitScript(() => {
      const shifts: number[] = []
      Object.assign(window, { tagCloudShifts: shifts })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean, value: number }
          if (!shift.hadRecentInput)
            shifts.push(shift.value)
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/tags/')
    await waitForHydration(page)
    await expect(page.locator('.lm-tag-cloud')).toHaveClass(/--packed/)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const shifts = await page.evaluate(() => (window as Window & { tagCloudShifts?: number[] }).tagCloudShifts ?? [])
    expect(shifts.reduce((sum, value) => sum + value, 0)).toBeLessThan(0.1)

    const cloud = page.locator('.lm-tag-cloud')
    const height = (await cloud.boundingBox())!.height
    const tag = cloud.getByRole('button', { name: 'Markdown, 2', exact: true })
    await tag.click()
    await expect(tag).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.lm-tag-index__panel')).toContainText('Markdown')
    expect((await cloud.boundingBox())!.height).toBe(height)
  })
}

test('tag cloud keeps all labels usable through content and viewport changes', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/examples/tag-cloud')
  await waitForHydration(page)
  const cloud = page.locator('.lm-tag-cloud')
  for (const width of [1350, 412, 320]) {
    await page.setViewportSize({ width, height: 940 })
    for (const [scenario, count] of [['1 个标签', 1], ['3 个标签', 3], ['7 个标签', 7], ['50 个标签', 50], ['长标签', 3], ['空词云', 0]] as const) {
      await page.getByRole('button', { name: scenario, exact: true }).click()
      await expect(cloud.getByRole('button')).toHaveCount(count)
      if (count && scenario !== '长标签') {
        await expect(cloud).toHaveClass(/--packed/)
        await expect(cloud.locator('button[style*="translate"]')).toHaveCount(count)
      }
      if (count) {
        const last = cloud.getByRole('button').last()
        await last.click()
        await expect(last).toHaveAttribute('aria-pressed', 'true')
        await expect.poll(() => cloud.evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          return Array.from(element.querySelectorAll('button')).every((button) => {
            const rect = button.getBoundingClientRect()
            return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
              && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1
          })
        })).toBe(true)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
  }
  expect(errors).toEqual([])
})
