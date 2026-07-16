import { computed, onMounted, ref } from 'vue'
import { getWindow } from '../../shared/browser'

/** 友链可访问性探测的界面状态。 */
export type LinkStatus = 'idle' | 'checking' | 'online' | 'offline' | 'unknown'

/** 当前浏览器会话内已经完成的友链探测结果。 */
const LINK_STATUS_CACHE = new Map<string, LinkStatus>()

/**
 * 判断目标地址是否能在当前浏览器环境执行 HTTP(S) 探测。
 *
 * @param url - 待检测的友链地址。
 * @returns 浏览器环境存在且地址协议为 HTTP(S) 时返回 `true`。
 */
function canCheckLink(url: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return false

  try {
    const target = new URL(url, currentWindow.location.href)
    return target.protocol === 'http:' || target.protocol === 'https:'
  }
  catch {
    return false
  }
}

/**
 * 使用 `no-cors` 探测浏览器是否接受友链请求，HEAD 请求抛错时再尝试 GET。
 * `no-cors` 无法读取真实 HTTP 状态，请求成功兑现不代表响应为 2xx。
 *
 * @param url - 待探测的友链地址。
 * @returns 请求被浏览器接受时返回 `online`，两次请求均抛错时返回 `offline`，非浏览器环境返回 `unknown`。
 */
async function probeLink(url: string): Promise<LinkStatus> {
  if (!getWindow())
    return 'unknown'

  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'HEAD',
      mode: 'no-cors',
    })
    return 'online'
  }
  catch {
    // HEAD 请求抛错后继续使用 GET 探测。
  }

  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'GET',
      mode: 'no-cors',
    })
    return 'online'
  }
  catch {
    return 'offline'
  }
}

/**
 * 在组件挂载后按需探测友链状态，并复用当前会话内已经完成的结果。
 *
 * @param url - 返回当前友链地址的 Getter。
 * @param enabled - 返回是否启用状态检测的 Getter。
 * @returns 对禁用状态做空闲回退的响应式友链状态。
 */
export function useLinkStatus(url: () => string, enabled: () => boolean) {
  const status = ref<LinkStatus>('idle')

  const visibleStatus = computed(() => {
    if (!enabled())
      return 'idle'

    return status.value
  })

  onMounted(async () => {
    if (!enabled())
      return

    const targetUrl = url()
    if (!canCheckLink(targetUrl)) {
      status.value = 'unknown'
      return
    }

    const cachedStatus = LINK_STATUS_CACHE.get(targetUrl)
    if (cachedStatus) {
      status.value = cachedStatus
      return
    }

    status.value = 'checking'
    const nextStatus = await probeLink(targetUrl)
    LINK_STATUS_CACHE.set(targetUrl, nextStatus)
    status.value = nextStatus
  })

  return {
    status: visibleStatus,
  }
}
