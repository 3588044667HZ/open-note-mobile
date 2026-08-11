import { ref, reactive } from 'vue'

let editor = null

const activeFormat = ref(null)
const activeTab = ref('text')
const markStatus = reactive({
  textColor: false,
  textHighlight: false,
  textUnderLine: false,
  textWavyLine: false,
})

function bind(ed) {
  editor = ed
}

function applyFormat(className, category) {
  if (!editor) return

  if (category === 'text' || category === 'highlight') {
    if (className === 'color_default') {
      editor.chain().focus()
        .unsetFormat((c) => c.startsWith('color_') || c.startsWith('highlight_'))
        .run()
    } else {
      editor.chain().focus().setFormat({ class: className }).run()
    }
  } else {
    const m = className.match(/underline_(?:solid|wavy)_(?:color_)?(.+)$/)
    const type = category === 'wavy' ? 'wavy' : 'solid'
    const color = m ? m[1] : 'default'
    editor.chain().focus().toggleColoredUnderline({ type, color }).run()
  }
  activeFormat.value = className
  activeTab.value = category
}

function updateMarkStatus() {
  if (!editor) return
  const marks = editor.state.selection.$from.marks()
  markStatus.textColor = !!marks.find((m) => m.type.name === 'textStyle' && m.attrs.class)
  markStatus.textHighlight = false
  markStatus.textUnderLine = false
  markStatus.textWavyLine = false
  marks.forEach((m) => {
    if (m.type.name === 'coloredUnderline') {
      if (m.attrs.type === 'wavy') markStatus.textWavyLine = true
      else markStatus.textUnderLine = true
    }
  })
}

export function useEditorStore() {
  return reactive({
    activeFormat,
    activeTab,
    markStatus,
    bind,
    applyFormat,
    updateMarkStatus,
  })
}
