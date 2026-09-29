import type { Ref } from 'vue'
import type { Hero } from '../../../types'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { isAbortError } from '../../../shared/browser'
import { fetchHitokoto } from './hitokoto'

/** 管理配置签名与一言来源；挂载前保留配置文案，取消后不接纳旧响应。 */
export function useMottoSource(hero: Readonly<Ref<Hero>>, mounted: Readonly<Ref<boolean>>) {
  const remote = computed(() => hero.value.mottoSource === 'hitokoto')
  const text = ref('')
  const pending = ref(false)
  let request: AbortController | undefined

  function cancel() {
    request?.abort()
    request = undefined
  }

  async function refresh() {
    if (!mounted.value || !remote.value)
      return
    cancel()
    const controller = new AbortController()
    request = controller
    const options = { ...hero.value.hitokoto, sentenceTypes: hero.value.hitokoto.sentenceTypes?.slice() }
    pending.value = true
    try {
      const data = await fetchHitokoto(options, controller.signal)
      if (controller.signal.aborted)
        return
      const sentence = data.hitokoto?.trim()
      if (sentence) {
        const from = (data.from || data.fromWho || '').trim()
        text.value = options.showFrom && from
          ? `${sentence} ${options.fromSeparator || '——'} ${from}`
          : sentence
      }
    }
    catch (error) {
      if (!isAbortError(error, controller.signal))
        console.error('[lolimeow] Failed to fetch hitokoto.', error)
    }
    finally {
      if (!controller.signal.aborted) {
        pending.value = false
        request = undefined
      }
    }
  }

  const configMottos = computed(() => {
    const motto = hero.value.motto
    return Array.isArray(motto) ? motto.filter(Boolean) : motto ? [motto] : []
  })
  const mottos = computed(() => {
    if (!remote.value)
      return configMottos.value
    if (pending.value)
      return []
    return text.value ? [text.value] : configMottos.value
  })

  watch([mounted, remote, () => hero.value.hitokoto], () => {
    cancel()
    text.value = ''
    pending.value = false
    void refresh()
  }, { immediate: true, deep: true, flush: 'sync' })
  onBeforeUnmount(cancel)

  return { mottos, pending, remote, refresh }
}
