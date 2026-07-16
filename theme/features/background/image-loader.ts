import { getWindow } from '../../shared/browser'

/**
 * 在浏览器中预加载并尽量提前解码图片。
 *
 * 非浏览器环境或 `window.Image` 不可用时直接返回原地址。浏览器触发 `load`
 * 后会尝试调用 `decode`，但解码失败不视为资源加载失败。
 *
 * @param url - 待预加载的图片地址。
 * @returns 图片加载成功后的原地址。
 * @throws 浏览器触发图片 `error` 事件时抛出包含地址的加载错误。
 */
export function preloadImage(url: string) {
  return new Promise<string>((resolve, reject) => {
    const currentWindow = getWindow()

    if (!currentWindow?.Image) {
      resolve(url)
      return
    }

    const image = new currentWindow.Image()

    // onload 只能说明资源已经到达浏览器，decode 则尽量把解码阶段前置，
    // 降低切图瞬间出现白闪的概率。
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function')
          await image.decode()
      }
      catch {
        // decode 失败不视为真正的加载失败，否则兼容性问题会被放大成显示问题。
      }

      resolve(url)
    }
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    image.src = url
  })
}
