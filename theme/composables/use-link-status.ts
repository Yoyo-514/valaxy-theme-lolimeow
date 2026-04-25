import { computed, onMounted, ref } from 'vue'

export type LinkStatus = 'idle' | 'checking' | 'online' | 'offline' | 'unknown'

const LINK_STATUS_CACHE = new Map<string, LinkStatus>()

function canCheckLink(url: string) {
  if (typeof window === 'undefined')
    return false

  try {
    const target = new URL(url, window.location.href)
    return target.protocol === 'http:' || target.protocol === 'https:'
  }
  catch {
    return false
  }
}

async function probeLink(url: string) {
  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'HEAD',
      mode: 'no-cors',
    })

    return 'online'
  }
  catch {
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
