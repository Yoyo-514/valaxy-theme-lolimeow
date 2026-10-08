import { expect, test } from '@playwright/test'
import { waitForHydration } from './helpers'

test('selecting the current hash scrolls again and wheel input cancels the animation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/posts/demo')
  await waitForHydration(page)
  const link = page.locator('.lm-toc__link').filter({ hasText: /^Code$/ })
  await link.click()
  const heading = page.locator('.markdown-body #code')
  await expect.poll(() => heading.evaluate(el => Math.abs(el.getBoundingClientRect().top - Number.parseFloat(getComputedStyle(el).scrollMarginTop)))).toBeLessThan(3)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await link.click()
  await page.waitForFunction(() => window.scrollY > 10)
  await page.mouse.move(400, 400)
  await page.mouse.wheel(0, -300)
  await page.waitForTimeout(350)
  const stopped = await page.evaluate(() => window.scrollY)
  expect(stopped).toBeGreaterThan(0)
  expect(await heading.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(200)
  await page.waitForTimeout(200)
  expect(await page.evaluate(() => window.scrollY)).toBe(stopped)
  await expect(page.locator('html')).not.toHaveAttribute('data-lm-navbar-scroll-lock', 'true')
})

for (const width of [1280, 390]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`TOC scrolls to distant headings (${width}px, ${reducedMotion})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.emulateMedia({ reducedMotion })
      await page.goto('/posts/demo')
      await waitForHydration(page)
      const mobile = width < 1280
      const links = page.locator(mobile ? '.lm-toc-mobile__link' : '.lm-toc__link')
      if (mobile) {
        // 从文章中部打开目录，验证解锁不会先跳回页面顶部。
        await page.evaluate(() => window.scrollTo(0, 600))
        await page.locator('.lm-toc-mobile__trigger').click()
      }
      // Code 位于外链图片之前，避免图片下载造成布局变化干扰滚动时序断言。
      const link = links.filter({ hasText: /^Code$/ })
      await expect(link).toBeVisible()
      const hash = await link.getAttribute('href')
      await link.evaluate((el) => {
        el.addEventListener('click', () => {
          const samples: { time: number, y: number }[] = []
          ;(window as any).__tocSamples = samples
          const started = performance.now()
          const sample = () => {
            const y = document.body.style.position === 'fixed' ? -Number.parseFloat(document.body.style.top) : window.scrollY
            samples.push({ time: performance.now() - started, y })
            if (performance.now() - started < 650)
              requestAnimationFrame(sample)
          }
          sample()
        }, { once: true, capture: true })
      })
      await link.click()
      await expect.poll(() => page.evaluate(() => (window as any).__tocSamples?.at(-1)?.time ?? 0)).toBeGreaterThan(650)
      const result = await page.evaluate((hash) => {
        const heading = document.getElementById(decodeURIComponent(hash!.slice(1)))!
        const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop)
        const target = Math.min(scrollY + heading.getBoundingClientRect().top - margin, document.documentElement.scrollHeight - innerHeight)
        return { samples: (window as any).__tocSamples as { time: number, y: number }[], target, y: scrollY, hash: location.hash }
      }, hash)
      const start = result.samples[0].y
      expect(result.target - start).toBeGreaterThan(1000)
      expect(Math.abs(result.y - result.target)).toBeLessThan(3)
      expect(decodeURIComponent(result.hash)).toBe(decodeURIComponent(hash!))
      const intermediate = result.samples.filter(sample => sample.y > start + 5 && sample.y < result.target - 5)
      expect(intermediate.length > 0).toBe(reducedMotion === 'no-preference')
      // 到位时刻由 rAF 调度决定：动画本身固定 320ms，本地实测 324~326ms，CI runner 上观测到 502ms。
      // 不断言毫秒数，动画与瞬时滚动的区别由上面的 intermediate 断言覆盖。
      await expect(page.locator('body')).not.toHaveCSS('position', 'fixed')
      await expect(page.locator('html')).not.toHaveAttribute('data-lm-navbar-scroll-lock', 'true')
      if (mobile)
        expect(start).toBe(600)
    })
  }
}
