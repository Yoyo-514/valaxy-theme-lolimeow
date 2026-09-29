import type cloud from 'd3-cloud'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { TagCloudSourceItem, TagCloudViewItem } from './types'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, toValue, watch } from 'vue'
import { buildTagCloudItems } from './tag-cloud'

interface CloudWord extends cloud.Word {
  item: TagCloudViewItem
  buttonWidth: number
  buttonHeight: number
  fontPixels: number
}

interface CloudPosition {
  x: number
  y: number
}

/** d3-cloud 只计算位置；标签始终由 Vue 渲染为可访问的原生按钮。 */
export function usePackedTagCloud(
  source: MaybeRefOrGetter<TagCloudSourceItem[]>,
  container: Readonly<Ref<HTMLElement | null>>,
) {
  const items = computed(() => buildTagCloudItems(toValue(source)))
  const packed = shallowRef<{ height: number, positions: Record<string, CloudPosition> }>()
  let createCloud: typeof cloud | undefined
  let layout: ReturnType<typeof cloud<CloudWord>> | undefined
  let disposed = false
  let revision = 0
  let observedWidth = 0

  async function arrange() {
    const current = ++revision
    layout?.stop()
    await nextTick()
    const element = container.value
    if (disposed || current !== revision || !createCloud || !element)
      return

    const width = element.clientWidth
    if (!items.value.length || width < 64) {
      packed.value = undefined
      return
    }

    const font = getComputedStyle(element).fontFamily
    const buttons = new Map(Array.from(element.querySelectorAll<HTMLButtonElement>('[data-tag-id]'))
      .map(button => [button.dataset.tagId, button]))
    const words: CloudWord[] = items.value.map((item) => {
      const button = buttons.get(item.id)!
      return {
        item,
        buttonWidth: button.offsetWidth,
        buttonHeight: button.offsetHeight,
        fontPixels: Number.parseFloat(getComputedStyle(button).fontSize),
      }
    })
    const area = words.reduce((sum, word) => sum + (word.buttonWidth + 12) * (word.buttonHeight + 8), 0)
    const desiredWidth = Math.max(Math.sqrt(area * 3), ...words.map(word => word.buttonWidth + 32))
    const availableWidth = Math.floor(Math.min(width - 16, 720, desiredWidth) / 32) * 32
    if (words.some(word => word.buttonWidth + 16 > availableWidth)) {
      packed.value = undefined
      return
    }

    const height = Math.max(180, Math.ceil(area / availableWidth * 2))
    // 自然换行仍占据文档流；最小高度变化不能反过来改变按钮的测量原点。
    const flowHeight = Math.max(...Array.from(buttons.values(), button => button.offsetTop + button.offsetHeight)) + 12

    layout = createCloud<CloudWord>()
      .size([availableWidth, height])
      .words(words.map(word => ({ ...word })))
      .text(word => word.item.name)
      .font(font)
      .fontWeight(word => word.item.fontWeight)
      .fontSize(word => word.fontPixels)
      .rotate(0)
      .padding(6)
      // 固定从中心沿螺旋向外寻找空位，避免少量标签随机散落。
      .random(() => 0.5)
      .timeInterval(8)
      .on('end', (placed) => {
        if (disposed || current !== revision)
          return

        // 从真实按钮尺寸收紧边界；少量标签也聚集在内容区中央。
        const rectangles = placed.map(word => ({
          id: word.item.id,
          left: word.x! - word.buttonWidth / 2,
          top: word.y! - word.fontPixels * 0.3 - word.buttonHeight / 2,
          width: word.buttonWidth,
          height: word.buttonHeight,
        }))
        // d3-cloud 不保证排入每个词；遗漏的词接在下方，不能丢失标签。
        const placedIds = new Set(placed.map(word => word.item.id))
        let nextTop = Math.max(0, ...rectangles.map(rect => rect.top + rect.height)) + 8
        for (const word of words) {
          if (placedIds.has(word.item.id))
            continue
          rectangles.push({
            id: word.item.id,
            left: -word.buttonWidth / 2,
            top: nextTop,
            width: word.buttonWidth,
            height: word.buttonHeight,
          })
          nextTop += word.buttonHeight + 8
        }
        const left = Math.min(...rectangles.map(rect => rect.left))
        const right = Math.max(...rectangles.map(rect => rect.left + rect.width))
        const top = Math.min(...rectangles.map(rect => rect.top))
        const bottom = Math.max(...rectangles.map(rect => rect.top + rect.height))
        const packedHeight = Math.max(items.value.length <= 3 ? 120 : 192, flowHeight, bottom - top + 24)

        // 按钮始终留在文档流中占位；transform 只改变视觉位置。
        packed.value = {
          height: packedHeight,
          positions: Object.fromEntries(rectangles.map((rect) => {
            const button = buttons.get(rect.id)!
            return [rect.id, {
              x: rect.left - left + (width - (right - left)) / 2 - button.offsetLeft,
              y: rect.top - top + (packedHeight - (bottom - top)) / 2 - button.offsetTop,
            }]
          })),
        }
      })
    layout.start()
  }

  useResizeObserver(container, ([entry]) => {
    const width = Math.floor(entry.contentRect.width)
    if (width !== observedWidth) {
      observedWidth = width
      void arrange()
    }
  })
  watch(items, arrange)
  onMounted(async () => {
    try {
      const [module] = await Promise.all([import('d3-cloud'), document.fonts.ready])
      if (disposed)
        return
      createCloud = module.default
      void arrange()
    }
    catch {
      // 离线或资源加载失败时保留服务端渲染的标签，仍可浏览和筛选。
    }
  })
  onBeforeUnmount(() => {
    disposed = true
    revision++
    layout?.stop()
  })

  return { items, packed }
}
