import type { Request } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { waitForHydration } from './helpers'

function isCommentList(request: Request) {
  const url = new URL(request.url())
  return url.pathname.endsWith('/api/comment') && url.searchParams.get('type') !== 'count'
}

/** 视口外多远算「接近评论区」：LmComment.vue 的 rootMargin 是 400px，这里取视口外 200px。 */
const COMMENT_PRELOAD_OFFSET = 200

for (const width of [412, 1350]) {
  test(`comments load near the viewport without delaying or repeating pageviews at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 823 })
    const requests: Request[] = []
    page.on('request', request => requests.push(request))
    const pageviews = () => requests.filter(request => new URL(request.url()).pathname.endsWith('/api/article') && request.method() === 'POST')

    await page.goto('/posts/demo')
    await waitForHydration(page)
    await expect.poll(() => pageviews().length).toBe(1)
    expect(pageviews()[0].postDataJSON().path).toBe('/posts/demo')
    await expect(page.locator('[data-waline]')).toHaveCount(0)
    expect(requests.filter(isCommentList)).toHaveLength(0)
    expect(requests.filter(request => request.url().includes('/emojis') || request.url().includes('@waline/emojis'))).toHaveLength(0)

    // 在预加载距离内、尚未进入视口时触发评论。
    await page.locator('.lm-comment').evaluate((element, offset) => window.scrollTo({
      top: scrollY + element.getBoundingClientRect().top - innerHeight - offset,
      behavior: 'instant',
    }), COMMENT_PRELOAD_OFFSET)
    await expect(page.locator('[data-waline]')).toBeAttached()
    await expect.poll(() => requests.filter(isCommentList).length).toBe(1)
    expect(decodeURIComponent(requests.find(isCommentList)!.url())).toContain('/posts/demo')
    expect(pageviews()).toHaveLength(1)

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(page.locator('[data-waline]')).toBeAttached()
    expect(pageviews()).toHaveLength(1)
  })
}

test('article navigation resets comment activation and uses the new counter path', async ({ page }) => {
  const requests: Request[] = []
  page.on('request', request => requests.push(request))
  await page.goto('/posts/hello-valaxy')
  await waitForHydration(page)
  await page.locator('.lm-comment').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-waline]')).toBeAttached()

  const next = page.locator('.lm-post-nav__item').first()
  const path = await next.getAttribute('href')
  await next.click()
  await expect(page).toHaveURL(new RegExp(`${path}/?$`))
  await expect.poll(() => requests.filter(request => new URL(request.url()).pathname.endsWith('/api/article')
    && request.method() === 'POST' && request.postDataJSON().path === path).length).toBe(1)
  // 评论的懒激活由上面的视口用例覆盖；这里关注换文章后的计数与重新激活。
  await page.locator('.lm-comment').scrollIntoViewIfNeeded()
  await expect.poll(() => requests.some(request => isCommentList(request) && decodeURIComponent(request.url()).includes(path!))).toBe(true)

  await page.goto('/tags/')
  await waitForHydration(page)
  await expect(page.locator('.lm-comment')).toHaveCount(0)
  expect(requests.filter(request => isCommentList(request) && decodeURIComponent(request.url()).includes('/tags'))).toHaveLength(0)
})
