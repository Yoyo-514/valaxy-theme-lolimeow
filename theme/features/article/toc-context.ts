import type { InjectionKey, ShallowRef } from 'vue'
import type { useArticleTocState } from './use-article-toc-state'
import { computed, inject, provide, shallowRef } from 'vue'

type TocState = ReturnType<typeof useArticleTocState>
const tocKey: InjectionKey<ShallowRef<TocState | undefined>> = Symbol('article-toc')

/** 布局只提供容器；useOutline 仍由独立大纲子组件拥有，避免 Markdown 更新循环。 */
export function provideArticleToc() {
  provide(tocKey, shallowRef<TocState>())
}

export function useArticleTocSource() {
  const source = inject(tocKey)
  if (!source)
    throw new Error('Article TOC requires provideArticleToc() in the post layout.')
  return source
}

/** 两种目录视图共享一套标题查询、滚动监听和点击处理。 */
export function useArticleToc() {
  const source = useArticleTocSource()
  return {
    items: computed(() => source.value?.items.value ?? []),
    visible: computed(() => source.value?.visible.value ?? false),
    activeLink: computed(() => source.value?.activeLink.value ?? ''),
    handleClick: (event: MouseEvent) => source.value?.handleClick(event),
  }
}
