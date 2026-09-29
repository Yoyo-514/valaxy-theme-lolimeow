import { expect, test } from '@playwright/test'

test.use({ baseURL: 'http://127.0.0.1:4176' })

test('rotation loads real images and stopping prevents further commits', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Start rotation' }).click()
  await expect(page.locator('#commits')).toHaveText('1', { timeout: 7000 })
  await page.getByRole('button', { name: 'Stop rotation' }).click()
  // 越过完整轮换间隔，确认取消后没有再次提交。
  await page.waitForTimeout(4500)
  await expect(page.locator('#commits')).toHaveText('1')
  expect(errors).toEqual([])
})

test('image cancellation rejects with AbortError', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Abort image' }).click()
  await expect(page.locator('#abort-result')).toHaveText('AbortError')
})
