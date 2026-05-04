import type { BrowserTimeout } from './browser'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from './browser'

type AnyFunction = (this: any, ...args: any[]) => any

export interface RateLimitOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
  signal?: AbortSignal
}

export interface RateLimitedControls<T = unknown> {
  cancel: () => void
  flush: () => T | undefined
  pending: () => boolean
}

export type RateLimitedFunction<T extends AnyFunction> = ((
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & RateLimitedControls<ReturnType<T>>

export function createDebouncedFunction<T extends AnyFunction>(
  handler: T,
  wait = 0,
  options: RateLimitOptions = {},
): RateLimitedFunction<T> {
  const { leading = false, trailing = true, signal } = options
  const delay = Math.max(0, wait)
  const maxWait = typeof options.maxWait === 'number' ? Math.max(0, options.maxWait) : undefined

  let timer: BrowserTimeout | undefined
  let maxTimer: BrowserTimeout | undefined
  let lastInvoke: (() => ReturnType<T>) | undefined
  let lastResult: ReturnType<T> | undefined

  function resetTimers() {
    clearBrowserTimeout(timer)
    clearBrowserTimeout(maxTimer)
    timer = undefined
    maxTimer = undefined
  }

  function invoke() {
    if (!lastInvoke || signal?.aborted)
      return lastResult

    // 始终执行最后一次调用参数，保证 trailing 场景拿到最新用户输入。
    const invokePending = lastInvoke
    lastInvoke = undefined
    lastResult = invokePending()

    return lastResult
  }

  function finish() {
    resetTimers()

    if (trailing) {
      invoke()
    }
    else {
      lastInvoke = undefined
    }
  }

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (signal?.aborted)
      return lastResult

    const shouldInvokeLeading = leading && !timer && !maxTimer
    const currentWindow = getWindow()
    lastInvoke = () => handler.apply(this, args)

    if (shouldInvokeLeading)
      invoke()

    if (!currentWindow) {
      // SSR/测试环境没有计时器时同步落地 trailing，避免状态永久 pending。
      if (!shouldInvokeLeading && trailing)
        invoke()

      return lastResult
    }

    clearBrowserTimeout(timer)
    timer = setBrowserTimeout(finish, delay)

    if (maxWait !== undefined && !maxTimer)
      maxTimer = setBrowserTimeout(finish, maxWait)

    return lastResult
  } as RateLimitedFunction<T>

  debounced.cancel = () => {
    resetTimers()
    lastInvoke = undefined
  }

  debounced.flush = () => {
    if (!debounced.pending())
      return lastResult

    finish()
    return lastResult
  }

  debounced.pending = () => Boolean(timer || maxTimer)

  signal?.addEventListener('abort', debounced.cancel, { once: true })

  return debounced
}

export function createThrottledFunction<T extends AnyFunction>(
  handler: T,
  wait = 0,
  options: Omit<RateLimitOptions, 'maxWait'> = {},
): RateLimitedFunction<T> {
  // throttle 复用 debounce 的 maxWait 语义，确保持续触发时也会按节流间隔执行。
  return createDebouncedFunction(handler, wait, {
    leading: true,
    trailing: true,
    ...options,
    maxWait: wait,
  })
}
