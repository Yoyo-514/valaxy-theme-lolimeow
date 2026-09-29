import { beforeEach, describe, expect, it } from 'vitest'
import { createHomeHistoryState } from '../theme/features/home/home-history-state'
import { createHomeScrollTasks } from '../theme/features/home/home-scroll-task'
import { lockBodyScroll } from '../theme/shared/browser/body-scroll-lock'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}

const nextTask = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('home scroll tasks', () => {
  let history: ReturnType<typeof createHomeHistoryState>
  beforeEach(() => {
    history = createHomeHistoryState()
  })
  it('returns saved positions and releases restoration without a browser frame', async () => {
    const tasks = createHomeScrollTasks(() => 1, history.settleHomeHistoryRestoration)
    const restoration = history.beginHomeHistoryRestoration('/')
    const position = { left: 0, top: 860 }
    await expect(tasks.coordinateScrollResult(position, 1, restoration, true)).resolves.toEqual(position)
    await nextTask()
    expect(history.homeHistoryRestorationState.value.pending).toBe(false)
  })

  it('releases restoration while a delegated result is still pending', async () => {
    const tasks = createHomeScrollTasks(() => 1, history.settleHomeHistoryRestoration)
    const result = deferred<{ top: number }>()
    const restoration = history.beginHomeHistoryRestoration('/')
    const pending = tasks.coordinateScrollResult(result.promise, 1, restoration, false)
    await nextTask()
    expect(history.homeHistoryRestorationState.value.pending).toBe(false)
    result.resolve({ top: 240 })
    await expect(pending).resolves.toEqual({ top: 240 })
  })

  it('cancels superseded navigation and ignores its late error', async () => {
    let generation = 1
    const tasks = createHomeScrollTasks(() => generation, history.settleHomeHistoryRestoration)
    const oldResult = deferred<{ top: number }>()
    const oldRestoration = history.beginHomeHistoryRestoration('/')
    const oldTask = tasks.coordinateScrollResult(oldResult.promise, generation, oldRestoration, false)
    tasks.cancelActiveScrollTask()
    generation += 1
    const currentRestoration = history.beginHomeHistoryRestoration('/page/2/')
    oldResult.reject(new Error('old navigation'))
    await expect(oldTask).resolves.toBe(false)
    await nextTask()
    expect(history.homeHistoryRestorationState.value).toMatchObject({ generation: currentRestoration, pending: true })
    await tasks.coordinateScrollResult({ top: 0 }, generation, currentRestoration, true)
    await nextTask()
    expect(history.homeHistoryRestorationState.value.pending).toBe(false)
  })

  it('passes current errors through and releases restoration', async () => {
    const tasks = createHomeScrollTasks(() => 1, history.settleHomeHistoryRestoration)
    const result = deferred<{ top: number }>()
    const restoration = history.beginHomeHistoryRestoration('/')
    const pending = tasks.coordinateScrollResult(result.promise, 1, restoration, false)
    const error = new Error('scroll failed')
    result.reject(error)
    await expect(pending).rejects.toBe(error)
    expect(history.homeHistoryRestorationState.value.pending).toBe(false)
    tasks.cancelActiveScrollTask()
  })

  it('cancels before layout without returning a stale saved position', async () => {
    const tasks = createHomeScrollTasks(() => 1, history.settleHomeHistoryRestoration)
    const restoration = history.beginHomeHistoryRestoration('/')
    const pending = tasks.coordinateScrollResult({ top: 900 }, 1, restoration, true)
    tasks.cancelActiveScrollTask()
    tasks.cancelActiveScrollTask()
    await expect(pending).resolves.toBe(false)
    await nextTask()
    expect(history.homeHistoryRestorationState.value.pending).toBe(false)
  })

  it('makes server-side scroll locks safe and idempotent', () => {
    const release = lockBodyScroll()
    expect(() => {
      release({ restoreScroll: false })
      release()
    }).not.toThrow()
  })

  it('isolates history instances and rejects incompatible feed state', () => {
    const other = createHomeHistoryState()
    history.saveHomeHistoryPageCount('entry', 'feed', 3)
    expect(other.consumeHomeHistoryPageCount('entry', 'feed')).toBeUndefined()
    expect(history.consumeHomeHistoryPageCount('entry', 'feed')).toBe(3)
    expect(history.consumeHomeHistoryPageCount('entry', 'changed')).toBeUndefined()
    expect(history.consumeHomeHistoryPageCount('entry', 'feed')).toBeUndefined()
    history.beginHomeHistoryRestoration('/')
    expect(other.homeHistoryRestorationState.value.pending).toBe(false)
  })
})
