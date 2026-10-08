import type { WalineInitOptions } from '@waline/client'

/** 保留 Valaxy Waline 插件的表情配置语义，其余选项使用主题客户端的类型。 */
export type LmWalineOptions = Omit<WalineInitOptions, 'emoji' | 'el'> & {
  cdn?: string
  types?: string[]
  emoji?: string[]
}

/** 插件的内置表情组与自定义目录可以同时使用；空 types 表示不加载内置组。 */
export function resolveWalineEmoji({
  cdn = '//unpkg.com/',
  types = ['bilibili', 'qq', 'weibo'],
  emoji = [],
}: Pick<LmWalineOptions, 'cdn' | 'types' | 'emoji'>): WalineInitOptions['emoji'] {
  return [
    ...types.map(type => `${cdn}@waline/emojis/${type}/`),
    ...emoji.map(url => `${url}/`),
  ] as WalineInitOptions['emoji']
}
