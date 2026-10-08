import type { WalineInitOptions } from '@waline/client'

/** 保留 Valaxy Waline 插件的表情配置语义，其余选项使用主题客户端的类型。 */
export type LmWalineOptions = Omit<WalineInitOptions, 'emoji' | 'el'> & {
  cdn?: string
  types?: string[]
  emoji?: string[]
}

/** Waline 组件的 emoji 属性只接受表情数组。 */
type WalineEmojiList = Exclude<WalineInitOptions['emoji'], boolean | undefined>

/** 插件的内置表情组与自定义目录可以同时使用；空 types 表示不加载内置组。 */
export function resolveWalineEmoji({
  cdn = '//unpkg.com/',
  types = ['bilibili', 'qq', 'weibo'],
  emoji = [],
}: Pick<LmWalineOptions, 'cdn' | 'types' | 'emoji'>): WalineEmojiList {
  return [
    ...types.map(type => `${cdn}@waline/emojis/${type}/`),
    ...emoji.map(url => `${url}/`),
  ] as WalineEmojiList
}

/** 剥离插件独有字段，得到可以直接传给 Waline 组件的选项。 */
export function resolveWalineClientOptions(options: LmWalineOptions): Omit<LmWalineOptions, 'cdn' | 'types'> {
  // cdn / types 只用于组装表情地址，Waline 组件不接受这两个字段。
  const { cdn: _cdn, types: _types, ...clientOptions } = options
  return clientOptions
}
