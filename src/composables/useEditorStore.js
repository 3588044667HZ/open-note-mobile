import { reactive } from 'vue'

const store = reactive({
  activeFormat: null,
  activeTab: 'text',
  markStatus: {
    textColor: false,
    textHighlight: false,
    textUnderLine: false,
    textWavyLine: false,
  },
  editor: null,

  bind(ed) {
    this.editor = ed
  },

  applyFormat(className, category) {
    const ed = this.editor
    if (!ed) return

    if (category === 'text' || category === 'highlight') {
      if (className === 'color_default') {
        ed.chain().focus()
          .unsetFormat((c) => c.startsWith('color_') || c.startsWith('highlight_'))
          .run()
      } else {
        ed.chain().focus().setFormat({ class: className }).run()
      }
    } else {
      const parts = className.split('_')
      const type = category === 'wavy' ? 'wavy' : 'solid'
      const color = parts.slice(2).join('_')
      ed.chain().focus().toggleColoredUnderline({ type, color }).run()
    }
    this.activeFormat = className
    this.activeTab = category
  },

  updateMarkStatus() {
    const ed = this.editor
    if (!ed) return
    const marks = ed.state.selection.$from.marks()
    this.markStatus.textColor = !!marks.find((m) => m.type.name === 'textStyle' && m.attrs.class)
    this.markStatus.textHighlight = false
    this.markStatus.textUnderLine = false
    this.markStatus.textWavyLine = false
    marks.forEach((m) => {
      if (m.type.name === 'coloredUnderline') {
        if (m.attrs.type === 'wavy') this.markStatus.textWavyLine = true
        else this.markStatus.textUnderLine = true
      }
    })
  },
})

export function useEditorStore() {
  return store
}
