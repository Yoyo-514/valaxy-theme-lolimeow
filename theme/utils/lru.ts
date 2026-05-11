export class LRUCache<K, V> {
  private readonly cap: number
  private readonly cache = new Map<K, V>()

  constructor(capacity: number) {
    this.cap = Math.max(0, capacity)
  }

  get size() {
    return this.cache.size
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    const val = this.cache.get(key)!

    this.cache.delete(key)
    this.cache.set(key, val)

    return val
  }

  set(key: K, val: V): void {
    if (this.cap <= 0)
      return

    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.cap) {
      const oldestKey = this.cache.keys().next().value as K | undefined
      if (oldestKey !== undefined)
        this.cache.delete(oldestKey)
    }

    this.cache.set(key, val)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}
