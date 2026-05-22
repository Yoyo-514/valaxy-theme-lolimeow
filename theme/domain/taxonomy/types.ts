/**
 * 归档页单篇文章条目。
 */
export interface ArchiveEntry {
  path: string
  title: string
  date?: string | number | Date
  categories: string[]
}

/**
 * 归档页按年份聚合后的文章组。
 */
export interface ArchiveGroup {
  year: string
  sortKey: number
  count: number
  entries: ArchiveEntry[]
}

/**
 * 分类树中的文章条目。
 */
export interface CategoryEntry {
  path: string
  title: string
  date?: string | number | Date
}

/**
 * 分类页树节点，包含当前分类层级、子分类与直属文章。
 */
export interface CategoryNode {
  name: string
  fullPath: string
  parentPath: string
  depth: number
  total: number
  childCount: number
  entries: CategoryEntry[]
  children: CategoryNode[]
}

/**
 * 标签页单篇文章条目。
 */
export interface TagEntry {
  path: string
  title: string
  date?: string | number | Date
}

/**
 * 标签页按标签聚合后的文章组。
 */
export interface TagGroup {
  id: string
  name: string
  count: number
  entries: TagEntry[]
}

/**
 * 标签云布局算法的输入项。
 */
export interface TagCloudSourceItem {
  id: string
  name: string
  count: number
}

/**
 * 标签云布局算法输出给 UI 的单个标签。
 */
export interface TagCloudViewItem extends TagCloudSourceItem {
  fontSize: string
  fontWeight: number
  opacity: number
  shiftX: string
  shiftY: string
}

/**
 * 标签云的一行布局结果。
 */
export interface TagCloudRow {
  id: string
  items: TagCloudViewItem[]
}
