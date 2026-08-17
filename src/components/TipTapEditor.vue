<template>
  <div class="tt-editor">
    <div v-if="editor" class="tt-toolbar">
      <button class="tt-btn" :class="{ active: editor.isActive('bold') }"
              @click="editor.chain().focus().toggleBold().run()" title="Bold"><b>B</b></button>
      <button class="tt-btn" :class="{ active: editor.isActive('italic') }"
              @click="editor.chain().focus().toggleItalic().run()" title="Italic"><i>I</i></button>
      <button class="tt-btn" :class="{ active: editor.isActive('underline') }"
              @click="editor.chain().focus().toggleUnderline().run()" title="Underline"><u>U</u></button>
      <button class="tt-btn" :class="{ active: editor.isActive('strike') }"
              @click="editor.chain().focus().toggleStrike().run()" title="Strikethrough"><s>S</s></button>
      <span class="tt-spacer"></span>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 1 }) }"
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 2 }) }"
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 3 }) }"
              @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <span class="tt-spacer"></span>
      <button class="tt-btn" :class="{ active: editor.isActive('bulletList') }"
              @click="editor.chain().focus().toggleBulletList().run()" title="Bullet list">ul</button>
      <button class="tt-btn" :class="{ active: editor.isActive('orderedList') }"
              @click="editor.chain().focus().toggleOrderedList().run()" title="Ordered list">ol</button>
      <button class="tt-btn" :class="{ active: editor.isActive('blockquote') }"
              @click="editor.chain().focus().toggleBlockquote().run()" title="Quote">&ldquo;</button>
      <button class="tt-btn" :class="{ active: editor.isActive('codeBlock') }"
              @click="editor.chain().focus().toggleCodeBlock().run()" title="Code block">&lt;/&gt;</button>
      <button class="tt-btn" :class="{ active: editor.isActive('link') }" @click="setLink" title="Link">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
          <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" stroke-width="1.2"/>
          <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z" stroke-width="1.2"/>
        </svg>
      </button>
      <button class="tt-btn" @click="editor.chain().focus().setHorizontalRule().run()" title="Divider">-</button>
      <span class="tt-spacer"></span>

      <div class="tt-color-group">
        <button class="tt-btn color-trigger" :class="{ active: colorOpen }" @click="colorOpen = !colorOpen">
          <span class="color-swatch" :style="currentSwatchStyle"></span>A
        </button>
      </div>

      <span class="tt-spacer"></span>
      <label class="tt-btn tt-img-btn" title="Insert image">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--type-toolbar-color)" stroke-width="1.3">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
          <circle cx="5" cy="6" r="1.3"/>
          <path d="M1.5 12l4-4 3 2 2.5-2.5L14.5 11" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input type="file" accept="image/*" class="tt-file-input" @change="onFileSelected" />
      </label>

      <button class="tt-btn mode-toggle" :class="{ active: mode === 'preview' }"
              @click="mode = mode === 'edit' ? 'preview' : 'edit'">
        {{ mode === 'edit' ? 'Preview' : 'Edit' }}
      </button>
    </div>

    <div class="tt-body">
      <div v-show="mode !== 'preview'" class="tt-edit-pane">
        <editor-content :editor="editor" />
      </div>
      <div v-show="mode !== 'edit'" class="tt-preview-pane">
        <div class="markdown-content" v-html="renderedHTML"></div>
      </div>
    </div>

    <div v-if="uploading" class="tt-upload-overlay">
      <div class="sm-spinner"></div>
      <span>Uploading image...</span>
    </div>

    <Teleport to="body">
      <div v-if="colorOpen" class="color-sheet-overlay" @click="colorOpen = false">
        <div class="color-sheet" @click.stop>
          <div class="color-sheet-handle"></div>
          <div class="color-sheet-header">
            <span class="sheet-title">Text Format</span>
            <button class="sheet-close" @click="colorOpen = false">&times;</button>
          </div>
          <div class="color-tabs">
            <button v-for="tab in COLOR_TABS" :key="tab"
                    class="color-tab" :class="{ active: store.activeTab === tab }"
                    @click="store.activeTab = tab">{{ COLOR_TAB_LABELS[tab] }}</button>
          </div>
          <div class="color-options">
            <button v-for="item in colorOptions" :key="item.class"
                    class="color-option"
                    :class="{ active: store.activeFormat === item.class }"
                    :style="item.style"
                    @click="store.applyFormat(item.class, store.activeTab)">{{ item.label }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount, onMounted } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyleWithClass } from '../extensions/textStyle'
import { ColoredUnderline } from '../extensions/underline'
import { FormatCommands } from '../extensions/formatCommands'
import { useEditorStore } from '../composables/useEditorStore'
import { applyColorTokens, COLOR_CATEGORIES, COLOR_TABS, COLOR_TAB_LABELS } from '../config/colorTokens'
import {
  generateAttachId, thumbUrl, registerAttachmentSlot, uploadPending,
  storePendingFile, enqueuePendingUpload, retryPendingUploads,
} from '../config/attachmentUpload'
import { marked } from 'marked'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Start writing...' },
})

const emit = defineEmits(['update:modelValue'])

const mode = ref('edit')
const colorOpen = ref(false)
const uploading = ref(false)
const store = useEditorStore()

const initialContent = props.modelValue?.includes('<')
  ? props.modelValue
  : marked.parse(props.modelValue || '')

const editor = useEditor({
  content: initialContent,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
    TextStyleWithClass,
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
    Image,
    ColoredUnderline,
    FormatCommands,
  ],
  editorProps: {
    attributes: {
      class: 'tt-content',
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    if (html !== props.modelValue) {
      emit('update:modelValue', html)
    }
  },
  onSelectionUpdate: () => {
    store.updateMarkStatus()
  },
  onCreate: ({ editor }) => {
    store.bind(editor)
    store.updateMarkStatus()
  },
})

const renderedHTML = computed(() => {
  try { return marked.parse(props.modelValue || '') } catch { return '' }
})

watch(() => props.modelValue, (html) => {
  const ed = editor.value
  if (ed && html !== ed.getHTML()) {
    ed.commands.setContent(html || '', { emitUpdate: false })
  }
})

const colorOptions = computed(() => {
  return COLOR_CATEGORIES[store.activeTab] || []
})

const currentSwatchStyle = computed(() => {
  const fmt = store.activeFormat
  if (!fmt) return {}
  if (store.activeTab === 'text') {
    const item = COLOR_CATEGORIES.text.find((i) => i.class === fmt)
    return item ? { color: item.style?.color || 'inherit' } : {}
  }
  if (store.activeTab === 'highlight') {
    const item = COLOR_CATEGORIES.highlight.find((i) => i.class === fmt)
    return item ? { backgroundColor: item.style?.background || 'inherit' } : {}
  }
  return { textDecoration: 'underline' }
})

function setLink() {
  if (!editor.value) return
  const prevUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', prevUrl || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

async function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  const attachId = generateAttachId()
  try {
    // ① 注册槽位（失败不阻塞插图：content URL 是确定性 thumb 地址）
    try {
      await registerAttachmentSlot(attachId, file, null)
    } catch {}

    // ② 立即插入压缩图地址（不依赖注册回执）
    editor.value?.chain().focus().setImage({ src: thumbUrl(attachId), alt: file.name }).run()

    // ③ 补传文件内容；失败则存入待传队列
    try {
      await uploadPending(attachId, file)
    } catch {
      await storePendingFile(attachId, file)
      enqueuePendingUpload(attachId, file.name, file.type)
    }
  } catch {
    // silently fail
  } finally {
    uploading.value = false
    if (e.target) e.target.value = ''
  }
}

onMounted(() => {
  applyColorTokens()
  retryPendingUploads()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

defineExpose({
  focus: () => editor.value?.commands.focus(),
})
</script>

<style scoped>
.tt-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.tt-toolbar {
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tt-btn {
  height: 28px;
  min-width: 28px;
  padding: 0 6px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--type-toolbar-color);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  white-space: nowrap;
}
.tt-btn:active { background: var(--type-toolbar-divider); }
.tt-btn.active { background: rgba(0, 106, 255, 0.1); color: var(--color-primary); }

.mode-toggle { margin-left: auto; }
.mode-toggle.active { background: var(--color-primary); color: #fff; }

.tt-spacer {
  width: 1px;
  height: 16px;
  background: var(--type-toolbar-divider);
  margin: 0 3px;
  flex-shrink: 0;
}

.tt-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.tt-edit-pane {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tt-preview-pane {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 var(--type-padding-horizontal);
}

.tt-color-group {
  position: relative;
}

.color-trigger {
  position: relative;
}

.color-swatch {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 2px;
  border-radius: 1px;
}

.color-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.color-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--color-white);
  border-radius: 18px 18px 0 0;
  padding: 8px 16px calc(16px + var(--safe-area-bottom));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  animation: sheet-up 0.25s ease;
}

@keyframes sheet-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.color-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  margin: 0 auto 10px;
}

.color-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 10px;
}

.sheet-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.sheet-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 18px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-close:active { background: var(--type-toolbar-divider); }

.color-tabs {
  display: flex;
  gap: 0;
  background: var(--color-bg);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 14px;
}

.color-tab {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.color-tab.active {
  background: var(--color-white);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.color-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding-bottom: 4px;
}

.color-option {
  height: 52px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 2px solid transparent;
  transition: border-color 0.15s, transform 0.15s;
  color: var(--color-text);
}

.color-option:active {
  transform: scale(0.95);
}

.color-option.active {
  border-color: var(--color-primary);
  background: rgba(0, 106, 255, 0.05);
}

.tt-img-btn {
  position: relative;
  overflow: hidden;
}

.tt-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.tt-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  color: #fff;
  font-size: 13px;
}

.sm-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

:deep(.tt-content) {
  padding: 0 var(--type-padding-horizontal);
  font-family: var(--type-font-family);
  font-size: var(--type-content-size);
  line-height: var(--type-content-line-height);
  letter-spacing: var(--type-letter-spacing);
  color: var(--type-text-color);
  outline: none;
  min-height: 100%;
}

:deep(.tt-content h1) { font-size: 1.5em; font-weight: var(--type-font-bold); margin: 0.5em 0 0.2em; line-height: var(--type-title-line-height); }
:deep(.tt-content h2) { font-size: 1.3em; font-weight: var(--type-font-bold); margin: 0.5em 0 0.2em; line-height: var(--type-title-line-height); }
:deep(.tt-content h3) { font-size: 1.15em; font-weight: var(--type-font-bold); margin: 0.4em 0 0.2em; line-height: var(--type-title-line-height); }
:deep(.tt-content p) { margin: 0; }
:deep(.tt-content b), :deep(.tt-content strong) { font-weight: var(--type-font-bold); }
:deep(.tt-content ul) { padding-left: 1.5em; margin: 0.2em 0; }
:deep(.tt-content ol) { padding-left: 1.5em; margin: 0.2em 0; }
:deep(.tt-content li) { margin: 0.1em 0; }
:deep(.tt-content blockquote) {
  border-left: 3px solid var(--color-primary);
  padding: 0.1em 0.8em;
  margin: 0.4em 0;
  color: var(--type-blockquote-color);
  background: var(--type-blockquote-bg);
  border-radius: 0 4px 4px 0;
}
:deep(.tt-content code) { background: var(--type-code-bg); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.88em; font-family: 'SF Mono', 'Consolas', monospace; }
:deep(.tt-content pre) { background: var(--type-pre-bg); padding: 12px 14px; border-radius: 8px; overflow-x: auto; margin: 0.4em 0; }
:deep(.tt-content pre code) { background: none; padding: 0; }
:deep(.tt-content hr) { border: none; border-top: 1px solid var(--type-hr-color); margin: 1em 0; }
:deep(.tt-content a.editor-link) { color: var(--color-primary); }
:deep(.tt-content img) { max-width: 100%; height: auto; border-radius: 6px; }

:deep(.tt-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--type-placeholder-color);
  pointer-events: none;
  height: 0;
}

.markdown-content {
  color: var(--type-text-color);
  font-family: var(--type-font-family);
  font-size: var(--type-content-size);
  line-height: var(--type-content-line-height);
  letter-spacing: var(--type-letter-spacing);
  word-break: break-word;
}
.markdown-content :deep(h1) { font-size: 1.6em; font-weight: var(--type-font-bold); margin: 0.4em 0; border-bottom: 1px solid var(--type-hr-color); padding-bottom: 0.2em; }
.markdown-content :deep(h2) { font-size: 1.35em; font-weight: var(--type-font-bold); margin: 0.4em 0; }
.markdown-content :deep(h3) { font-size: 1.15em; font-weight: var(--type-font-bold); margin: 0.3em 0; }
.markdown-content :deep(p) { margin: 0; }
.markdown-content :deep(ul), .markdown-content :deep(ol) { padding-left: 1.5em; margin: 0.2em 0; }
.markdown-content :deep(blockquote) { border-left: 3px solid var(--color-primary); padding: 0.1em 0.6em; margin: 0.4em 0; color: var(--type-blockquote-color); background: var(--type-blockquote-bg); border-radius: 0 4px 4px 0; }
.markdown-content :deep(code) { background: var(--type-code-bg); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.88em; font-family: 'SF Mono', 'Consolas', monospace; }
.markdown-content :deep(pre) { background: var(--type-pre-bg); padding: 12px 14px; border-radius: 8px; overflow-x: auto; }
.markdown-content :deep(pre code) { background: none; padding: 0; }
.markdown-content :deep(hr) { border: none; border-top: 1px solid var(--type-hr-color); margin: 1em 0; }
.markdown-content :deep(a) { color: var(--color-primary); }
.markdown-content :deep(table) { border-collapse: collapse; width: 100%; }
.markdown-content :deep(th), .markdown-content :deep(td) { border: 1px solid var(--type-table-border-color); padding: 6px 10px; font-size: 0.9em; }
.markdown-content :deep(th) { background: var(--type-pre-bg); font-weight: 600; }
</style>
