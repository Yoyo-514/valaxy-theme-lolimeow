import { computed, onMounted, ref } from 'vue'
import { getWindow } from '../utils'

export type LinkStatus = 'idle' | 'checking' | 'online' | 'offline' | 'unknown'

const LINK_STATUS_CACHE = new Map<string, LinkStatus>()

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

async function probeLink(url: string) {
  // no-cors 只能判断请求是否被浏览器接受，不能读取真实状态码。
  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'HEAD',
      mode: 'no-cors',
    })

    return 'online'
  }
  catch {
    // 部分站点禁用 HEAD，但允许 GET；兜底探测能减少误判离线。
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
}

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

    // 同一会话内复用探测结果，避免友链列表反复触发跨域请求。
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
