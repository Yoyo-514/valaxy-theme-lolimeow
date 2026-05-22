import type { TagCloudRow, TagCloudSourceItem, TagCloudViewItem } from './types'
import { clamp, hashString } from '../../utils'

/**
 * 在两个数值之间按比例插值。
 */
function interpolate(min: number, max: number, ratio: number) {
  return min + (max - min) * ratio
}

/**
 * 将标签文章数映射为 0-1 的视觉权重。
 */
function resolveWeightRatio(count: number, min: number, range: number) {
  if (range <= 0)
    return 0.55

  return clamp((count - min) / range, 0, 1)
}

/**
 * 按权重和稳定哈希排序标签云项。
 */
function compareCloudItems(left: TagCloudViewItem, right: TagCloudViewItem) {
  return right.count - left.count || hashString(left.name) - hashString(right.name)
}

/**
 * 根据标签数量决定标签云行数，避免少量标签被过度拆散。
 */
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

/**
 * 生成从中间向外填充的行序列，让标签云视觉重心更稳定。
 */
function createRowSequence(rowCount: number) {
  const center = Math.floor(rowCount / 2)
  const rows = [center]

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

/**
 * 将每行权重最高的标签移动到视觉中心附近。
 */
function moveStrongestItemToCenter(items: TagCloudViewItem[]) {
  if (items.length < 3)
    return items

  const strongestIndex = items.reduce((resolvedIndex, item, index) => {
    return item.count > items[resolvedIndex].count ? index : resolvedIndex
  }, 0)
  const nextItems = items.slice()
  const [strongestItem] = nextItems.splice(strongestIndex, 1)
  nextItems.splice(Math.floor(nextItems.length / 2), 0, strongestItem)

  return nextItems
}

/**
 * 将标签统计数据转换为标签云布局行。
 */
export function buildTagCloudRows(sourceItems: readonly TagCloudSourceItem[]): TagCloudRow[] {
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
}
