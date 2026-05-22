import type { MaybeRefOrGetter } from 'vue'
import type { TagCloudSourceItem } from '../../domain/taxonomy'
import { computed, toValue } from 'vue'
import { buildTagCloudRows } from '../../domain'

/**
 * 将标签统计数据包装为响应式标签云布局。
 */
export function useTagCloud(items: MaybeRefOrGetter<TagCloudSourceItem[]>) {
  return computed(() => buildTagCloudRows(toValue(items)))
}
