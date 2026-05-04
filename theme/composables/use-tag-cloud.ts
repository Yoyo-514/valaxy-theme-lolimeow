import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface TagCloudSourceItem {
  id: string
  name: string
  count: number
}

export interface TagCloudViewItem extends TagCloudSourceItem {
  fontSize: string
  fontWeight: number
  opacity: number
  shiftX: string
  shiftY: string
}

export interface TagCloudRow {
  id: string
  items: TagCloudViewItem[]
}

function hashString(input: string) {
  let hash = 0

  for (let i = 0; i < input.length; i += 1)
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0

  return hash
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function interpolate(min: number, max: number, ratio: number) {
  return min + (max - min) * ratio
}

function resolveWeightRatio(count: number, min: number, range: number) {
  if (range <= 0)
    return 0.55

  return clamp((count - min) / range, 0, 1)
}

function compareCloudItems(left: TagCloudViewItem, right: TagCloudViewItem) {
  // 同权重标签用稳定哈希排序，避免每次响应式重算后云图跳动。
  return right.count - left.count || hashString(left.name) - hashString(right.name)
}

function resolveRowCount(count: number) {
  if (count <= 1)
    return 1

  if (count <= 4)
    return 2

  if (count <= 9)
    return 3

  if (count <= 18)
    return 4

  return 5
}

function createRowSequence(rowCount: number) {
  const center = Math.floor(rowCount / 2)
  const rows = [center]

  // 从中心行向外分发，让高权重标签优先落在视觉重心附近。
  for (let offset = 1; rows.length < rowCount; offset += 1) {
    const left = center - offset
    const right = center + offset

    if (left >= 0)
      rows.push(left)

    if (right < rowCount)
      rows.push(right)
  }

  return rows
}

function moveStrongestItemToCenter(items: TagCloudViewItem[]) {
  if (items.length < 3)
    return items

  // 每行最强标签放到行内中部，减少大字号贴边造成的视觉失衡。
  const strongestIndex = items.reduce((resolvedIndex, item, index) => {
    return item.count > items[resolvedIndex].count ? index : resolvedIndex
  }, 0)
  const nextItems = items.slice()
  const [strongestItem] = nextItems.splice(strongestIndex, 1)
  nextItems.splice(Math.floor(nextItems.length / 2), 0, strongestItem)

  return nextItems
}

export function useTagCloud(items: MaybeRefOrGetter<TagCloudSourceItem[]>) {
  return computed<TagCloudRow[]>(() => {
    const sourceItems = toValue(items)

    if (!sourceItems.length)
      return []

    const counts = sourceItems.map(item => item.count)
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    const range = max - min

    const viewItems = sourceItems
      .map((item) => {
        const ratio = resolveWeightRatio(item.count, min, range)
        const hash = hashString(item.name)
        const shiftX = ((hash % 9) - 4) / 10
        const shiftY = (((hash >> 4) % 7) - 3) / 10

        return {
          ...item,
          fontSize: `${interpolate(0.95, 2.35, ratio).toFixed(2)}rem`,
          fontWeight: Math.round(interpolate(600, 900, ratio)),
          opacity: interpolate(0.66, 1, ratio),
          shiftX: `${shiftX.toFixed(2)}rem`,
          shiftY: `${shiftY.toFixed(2)}rem`,
        }
      })
      .sort(compareCloudItems)

    const rowCount = resolveRowCount(viewItems.length)
    const rowSequence = createRowSequence(rowCount)
    const rows: TagCloudViewItem[][] = Array.from({ length: rowCount }, () => [])

    viewItems.forEach((item, index) => {
      const rowIndex = rowSequence[index % rowSequence.length]
      rows[rowIndex].push(item)
    })

    return rows
      .map((row, index) => ({
        id: `tag-cloud-row-${index}`,
        items: moveStrongestItemToCenter(row),
      }))
      .filter(row => row.items.length)
  })
}
