/**
 * 归档页单篇文章条目。
 */
export interface ArchiveEntry {
  path: string
  title: string
  date?: string | number | Date
  /** 按站点时区解析的日历日期，供年月分组和展示共同使用。 */
  calendarDate?: string
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
