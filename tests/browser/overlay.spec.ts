import { expect, test } from '@playwright/test'
import { expectScrollable, expectScrollLocked } from './helpers'

test.use({ baseURL: 'http://127.0.0.1:4176' })

test('nested modals keep focus and restore the original trigger after non-LIFO removal', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, 500))
  const trigger = page.getByRole('button', { name: 'Open first modal' })
  await trigger.click()
  await expectScrollLocked(page)
  const openSecond = page.getByRole('button', { name: 'Open second modal' })
  await expect(openSecond).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(openSecond).toBeFocused()
  await openSecond.click()
  await expect(page.getByRole('button', { name: 'Priority focus' })).toBeFocused()
  await page.getByRole('button', { name: 'Remove first modal' }).click()
  await expect(page.getByRole('dialog', { name: 'First', exact: true })).toHaveCount(0)
  expect(await page.getByRole('dialog', { name: 'Second' }).evaluate(el => el.contains(document.activeElement))).toBe(true)
  await expectScrollLocked(page)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(500)
  await expectScrollable(page)
})
