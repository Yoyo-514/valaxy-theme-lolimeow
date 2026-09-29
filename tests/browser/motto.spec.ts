import { expect, test } from '@playwright/test'

test.use({ baseURL: 'http://127.0.0.1:4176' })

test('motto rotates, resets on configuration change and honors reduced motion', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#motto')).toHaveText('Alpha')
  await expect(page.locator('#motto')).toHaveText('Beta')
  await page.getByRole('button', { name: 'Replace motto' }).click()
  await expect(page.locator('#motto')).not.toHaveText('Beta')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#motto')).toHaveText('Replacement text has no stale rotation')
  await page.waitForTimeout(1500)
  await expect(page.locator('#motto')).toHaveText('Replacement text has no stale rotation')
})
