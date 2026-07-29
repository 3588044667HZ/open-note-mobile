<template>
  <div class="tt-editor">
    <div class="tt-toolbar">
      <button class="tt-btn" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()" title="Bold"><b>B</b></button>
      <button class="tt-btn" :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()" title="Italic"><i>I</i></button>
      <button class="tt-btn" :class="{ active: editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()" title="Underline"><u>U</u></button>
      <button class="tt-btn" :class="{ active: editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()" title="Strikethrough"><s>S</s></button>
      <span class="tt-spacer"></span>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button class="tt-btn" :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <span class="tt-spacer"></span>
      <button class="tt-btn" :class="{ active: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()" title="Bullet list">ul</button>
      <button class="tt-btn" :class="{ active: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()" title="Ordered list">ol</button>
      <button class="tt-btn" :class="{ active: editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()" title="Quote">&ldquo;</button>
      <button class="tt-btn" @click="setLink" title="Link">A</button>
      <span class="tt-spacer"></span>
      <button class="tt-btn mode-toggle" :class="{ active: mode === 'preview' }" @click="mode = mode === 'edit' ? 'preview' : 'edit'">
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
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TurndownService from 'turndown'
import { marked } from 'marked'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Start writing...' },
})

const emit = defineEmits(['update:modelValue'])

const mode = ref('edit')
const turndown = new TurndownService({ headingStyle: 'atx', hr: '---', bulletListMarker: '-' })

const editor = useEditor({
  content: markdownToHTML(props.modelValue),
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
  ],
  editorProps: {
    attributes: {
      class: 'tt-content',
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    const md = htmlToMarkdown(html)
    if (md !== props.modelValue) {
      emit('update:modelValue', md)
    }
  },
})

const renderedHTML = computed(() => {
  try { return marked.parse(props.modelValue || '') } catch { return '' }
})

watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const currentMD = htmlToMarkdown(editor.value.getHTML())
  if (val !== currentMD) {
    editor.value.commands.setContent(markdownToHTML(val), false)
  }
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

function markdownToHTML(md) {
  if (!md) return ''
  try { return marked.parse(md) } catch { return md }
}

function htmlToMarkdown(html) {
  if (!html || html === '<p></p>') return ''
  try { return turndown.turndown(html) } catch { return html }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
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
  color: rgba(0, 0, 0, 0.45);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}
.tt-btn:active { background: rgba(0, 0, 0, 0.08); }
.tt-btn.active { background: rgba(0, 106, 255, 0.1); color: var(--color-primary); }

.mode-toggle { margin-left: auto; }
.mode-toggle.active { background: var(--color-primary); color: #fff; }

.tt-spacer {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.08);
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
  padding: 16px;
}

:deep(.tt-content) {
  padding: 16px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text);
  outline: none;
  min-height: 100%;
}

:deep(.tt-content h1) { font-size: 1.5em; font-weight: 700; margin: 0.5em 0 0.2em; line-height: 1.3; }
:deep(.tt-content h2) { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.2em; line-height: 1.3; }
:deep(.tt-content h3) { font-size: 1.15em; font-weight: 700; margin: 0.4em 0 0.2em; line-height: 1.3; }
:deep(.tt-content p) { margin: 0.3em 0; }
:deep(.tt-content ul) { padding-left: 1.5em; margin: 0.2em 0; }
:deep(.tt-content ol) { padding-left: 1.5em; margin: 0.2em 0; }
:deep(.tt-content li) { margin: 0.1em 0; }
:deep(.tt-content blockquote) {
  border-left: 3px solid var(--color-primary);
  padding: 0.1em 0.8em;
  margin: 0.4em 0;
  color: rgba(0,0,0,0.55);
  background: rgba(0,106,255,0.03);
  border-radius: 0 4px 4px 0;
}
:deep(.tt-content code) { background: rgba(0,0,0,0.05); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.88em; font-family: 'SF Mono', 'Consolas', monospace; }
:deep(.tt-content pre) { background: rgba(0,0,0,0.03); padding: 12px 14px; border-radius: 8px; overflow-x: auto; margin: 0.4em 0; }
:deep(.tt-content pre code) { background: none; padding: 0; }
:deep(.tt-content hr) { border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 1em 0; }
:deep(.tt-content a.editor-link) { color: var(--color-primary); }

:deep(.tt-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: rgba(0, 0, 0, 0.2);
  pointer-events: none;
  height: 0;
}

.markdown-content {
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.75;
  word-break: break-word;
}
.markdown-content :deep(h1) { font-size: 1.6em; font-weight: 700; margin: 0.4em 0; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 0.2em; }
.markdown-content :deep(h2) { font-size: 1.35em; font-weight: 700; margin: 0.4em 0; }
.markdown-content :deep(h3) { font-size: 1.15em; font-weight: 700; margin: 0.3em 0; }
.markdown-content :deep(p) { margin: 0.3em 0; }
.markdown-content :deep(ul), .markdown-content :deep(ol) { padding-left: 1.5em; margin: 0.2em 0; }
.markdown-content :deep(blockquote) { border-left: 3px solid var(--color-primary); padding: 0.1em 0.6em; margin: 0.4em 0; color: rgba(0,0,0,0.55); background: rgba(0,106,255,0.03); border-radius: 0 4px 4px 0; }
.markdown-content :deep(code) { background: rgba(0,0,0,0.05); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.88em; font-family: 'SF Mono', 'Consolas', monospace; }
.markdown-content :deep(pre) { background: rgba(0,0,0,0.03); padding: 12px 14px; border-radius: 8px; overflow-x: auto; }
.markdown-content :deep(pre code) { background: none; padding: 0; }
.markdown-content :deep(hr) { border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 1em 0; }
.markdown-content :deep(a) { color: var(--color-primary); }
.markdown-content :deep(table) { border-collapse: collapse; width: 100%; }
.markdown-content :deep(th), .markdown-content :deep(td) { border: 1px solid rgba(0,0,0,0.08); padding: 6px 10px; font-size: 0.9em; }
.markdown-content :deep(th) { background: rgba(0,0,0,0.03); font-weight: 600; }
</style>
