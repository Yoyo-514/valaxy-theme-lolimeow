import { defineComponent, h, ref, toRef } from 'vue'
import { useModalFocusTrap } from '../../../theme/shared/browser'

const Dialog = defineComponent({
  props: { open: Boolean, label: String },
  emits: ['close'],
  setup(props, { emit, slots }) {
    const container = ref<HTMLElement>()
    useModalFocusTrap({
      container,
      open: toRef(props, 'open'),
      lockBodyScroll: true,
      onClose: () => emit('close'),
    })
    return () => props.open
      ? h('section', {
          'ref': container,
          'role': 'dialog',
          'aria-label': props.label,
          'tabindex': -1,
          'style': { position: 'fixed', inset: '20%', background: 'white', border: '1px solid', zIndex: 10 },
        }, slots.default?.())
      : null
  },
})

export const OverlayFixture = defineComponent({
  setup() {
    const first = ref(false)
    const second = ref(false)
    return () => h('div', { style: { minHeight: '2400px' } }, [
      h('button', { style: { position: 'fixed', bottom: '10px', left: '10px' }, onClick: () => { first.value = true } }, 'Open first modal'),
      h(Dialog, { open: first.value, label: 'First', onClose: () => { first.value = false } }, {
        default: () => [
          h('button', { onClick: () => { second.value = true } }, 'Open second modal'),
          h('button', { disabled: true }, 'Disabled'),
          h('button', { style: { display: 'none' } }, 'Hidden'),
        ],
      }),
      h(Dialog, { open: second.value, label: 'Second', onClose: () => { second.value = false } }, {
        default: () => [
          h('button', { onClick: () => { first.value = false } }, 'Remove first modal'),
          h('button', { tabindex: 2 }, 'Priority focus'),
        ],
      }),
    ])
  },
})
