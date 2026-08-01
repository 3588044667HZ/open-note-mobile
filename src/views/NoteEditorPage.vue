<template>
  <div class="page editor-page" :style="{ backgroundColor: skinCloth }">
    <div class="color-accent" :style="{ backgroundColor: colorHex(form.color) }"></div>

    <div class="editor-header">
      <button class="back-btn" @click="handleBack">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 4.5L7 10l5.5 5.5" stroke="#006aff" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-meta">
        <select v-model="form.notebookId" class="meta-select">
          <option :value="null">No notebook</option>
          <option v-for="nb in store.notebooks" :key="nb.id" :value="nb.id">{{ nb.name }}</option>
        </select>
        <div class="color-dots">
          <button v-for="c in colors" :key="c.value" class="cd" :class="{ active: form.color === c.value }"
                  :style="{ backgroundColor: c.hex }" @click="form.color = c.value; dirty = true"></button>
        </div>
      </div>
      <div class="header-actions">
        <SkinPicker class="skin-picker-inline" @select="selectSkin" @toggleEye="toggleEyeProtection" @toggleDark="toggleDarkMode"/>
        <button class="action-btn share-btn" @click="handleShareImage" title="Share as image">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
               class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                  d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
            <path fill-rule="evenodd"
                  d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
          </svg>
        </button>
        <button class="action-btn save-btn" @click="handleSave" :class="{ dirty: dirty }" title="Save">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path
                d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
          </svg>
        </button>
        <button class="action-btn" @click="handlePin" :title="form.isPinned ? 'Unpin' : 'Pin'">
          <svg width="16" height="16" viewBox="0 0 16 16" :fill="form.isPinned ? '#006aff' : 'none'"
               :stroke="form.isPinned ? '#006aff' : 'var(--color-icon)'" stroke-width="1.3">
            <path d="M10 2.5L13 5M3 12l2.5-5.5L1 4l2.5-1L7.5 6l5-1.5L14 6l-4 4-3.5 5.5L3 12z" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="action-btn" @click="handleDelete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-icon)" stroke-width="1.3">
            <path d="M3.5 4.5h9M5.5 4.5V3a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1.5" stroke-linecap="round"/>
            <rect x="4" y="4.5" width="8" height="8.5" rx="1"/>
          </svg>
        </button>
      </div>
    </div>

    <input v-model="form.title" type="text" class="title-input" placeholder="Title" maxlength="100"
           @input="dirty = true"/>

    <TipTapEditor v-model="form.content" class="editor-body" @update:model-value="dirty = true"/>

    <div v-if="hasConflict" class="conflict-banner">
      Note was modified on another device. Pull to refresh.
    </div>

    <div class="editor-footer">
      <span class="char-hint" v-if="note">{{ form.content.length }}/10000</span>
      <span v-if="dirty" class="unsaved">Unsaved</span>
      <span class="time-label">{{ timeLabel }}</span>
    </div>

    <div ref="shareSource" style="display:none;" data-share-content></div>

    <ShareImageModal
        :visible="showShareModal"
        :loading="shareLoading"
        :error="shareError"
        :blob="shareBlob"
        :title="form.title"
        @close="showShareModal = false"
        @retry="handleShareImage"
    />
  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useNoteStore} from '../stores/note'
import {getNote} from '../api'
import TipTapEditor from '../components/TipTapEditor.vue'
import SkinPicker from '../components/SkinPicker.vue'
import ShareImageModal from '../components/ShareImageModal.vue'
import {useSkin} from '../composables/useSkin'
import {getSkinColorsFromCSS, renderToImage} from '../utils/share-image-renderer'
import {marked} from 'marked'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const store = useNoteStore()
const { currentSkin, selectSkin, toggleEyeProtection, toggleDarkMode, SKINS } = useSkin()

const skinCloth = computed(() => SKINS[currentSkin.value] || '#FAFAFA')

const shareSource = ref(null)
const showShareModal = ref(false)
const shareLoading = ref(false)
const shareError = ref('')
const shareBlob = ref(null)

const note = ref(null)
const dirty = ref(false)
let saveTimer = null
let hasConflict = ref(false)
let lastSavedVersion = null

const colors = [
  {value: 'blue', hex: '#4A90D9'},
  {value: 'green', hex: '#7EC050'},
  {value: 'yellow', hex: '#F5C842'},
  {value: 'orange', hex: '#F5A623'},
  {value: 'red', hex: '#E05050'},
  {value: 'gray', hex: '#9B9B9B'},
]

const colorHexMap = {
  blue: '#4A90D9',
  green: '#7EC050',
  yellow: '#F5C842',
  orange: '#F5A623',
  red: '#E05050',
  gray: '#9B9B9B'
}

function colorHex(c) {
  return colorHexMap[c] || '#4A90D9'
}

const form = reactive({title: '', content: '', notebookId: null, color: 'blue', isPinned: false})

const timeLabel = computed(() => {
  if (!note.value?.updatedAt) return ''
  return dayjs(note.value.updatedAt).format('YYYY/MM/DD HH:mm')
})

async function loadNote() {
  const id = route.params.id
  if (!id) return
  if (store.notes.length > 0) {
    note.value = store.notes.find(n => n.id === id) || null
  }
  if (!note.value) {
    try {
      const res = await getNote(id)
      note.value = res.data
    } catch {
    }
  }
  if (note.value) {
    form.title = note.value.title || ''
    form.content = note.value.content || ''
    form.notebookId = note.value.notebookId || null
    form.color = note.value.color || 'blue'
    form.isPinned = note.value.isPinned || false
    lastSavedVersion = note.value.updatedAt || null
  }
}

watch(() => route.params.id, () => {
  loadNote()
  dirty.value = false
  hasConflict.value = false
})

watch(dirty, (val) => {
  if (val) {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(autoSave, 2000)
  }
})

async function autoSave(force = false) {
  if (!note.value) {
    if (!form.title.trim() && !form.content.trim()) return
    const data = {
      title: form.title.trim(),
      content: form.content,
      notebookId: form.notebookId,
      color: form.color,
      isPinned: form.isPinned
    }
    const created = await store.addNote(data)
    note.value = created
    lastSavedVersion = created.updatedAt
    dirty.value = false
    router.replace({name: 'editor', params: {id: created.id}})
    return
  }
  if (!force && !dirty.value) return
  hasConflict.value = false
  const data = {
    title: form.title.trim(),
    content: form.content,
    notebookId: form.notebookId,
    color: form.color,
    isPinned: form.isPinned
  }
  try {
    const updated = await store.editNote(note.value.id, data)
    lastSavedVersion = updated.updatedAt
    dirty.value = false
  } catch (e) {
    if (e?.response?.status === 409) {
      hasConflict.value = true
    }
  }
}

async function handlePin() {
  if (!note.value) return
  const updated = await store.togglePin(note.value.id)
  form.isPinned = updated.isPinned
}

async function handleSave() {
  clearTimeout(saveTimer)
  await autoSave(true)
}

async function handleDelete() {
  if (!note.value) return
  await store.removeNote(note.value.id)
  router.replace('/home')
}

async function handleShareImage() {
  if (!form.title.trim() && !form.content.trim()) return
  showShareModal.value = true
  shareLoading.value = true
  shareError.value = ''
  shareBlob.value = null

  try {
    const html = form.content ? marked.parse(form.content) : ''
    const container = document.createElement('div')
    container.innerHTML = html
    const colors = getSkinColorsFromCSS()
    shareBlob.value = await renderToImage(container, colors, {
      title: form.title.trim() || 'Untitled',
      watermark: 'Memo',
      logoText: 'Shared via OPEN Notes',
      width: 750,
      scale: 2,
    })
  } catch (e) {
    shareError.value = 'Failed to generate image. Please try again.'
  } finally {
    shareLoading.value = false
  }
}

async function handleBack() {
  clearTimeout(saveTimer)
  await autoSave(true)
  router.replace('/home')
}

onMounted(async () => {
  if (store.notebooks.length === 0) await store.fetchNotebooks()
  if (store.notes.length === 0) await store.fetchNotes()
  await loadNote()
})

onUnmounted(() => {
  clearTimeout(saveTimer)
})
</script>

<style scoped>
.editor-page {
  background: var(--skin-backcloth);
  transition: background-color 0.4s ease;
}

.skin-picker-inline {
  margin-right: 8px;
}

.color-accent {
  height: 3px;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.editor-header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border);
  gap: 8px;
  flex-shrink: 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.meta-select {
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12px;
  background: var(--color-card);
  color: var(--color-text-secondary);
  max-width: 120px;
}

.color-dots {
  display: flex;
  gap: 4px;
}

.cd {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.cd.active {
  border-color: var(--color-primary);
  transform: scale(1.15);
  box-shadow: 0 0 0 2px rgba(0, 106, 255, 0.2);
}

.header-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.action-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.action-btn:active {
  background: var(--type-toolbar-divider);
}

.share-btn {
  color: var(--color-icon);
  transition: color 0.2s;
}

.save-btn { color: var(--color-icon); transition: color 0.2s; }
.save-btn.dirty {
  color: var(--color-primary);
}

.title-input {
  min-height: 52px;
  padding: var(--type-title-padding-top) var(--type-padding-horizontal) var(--type-title-padding-bottom);
  font-family: var(--type-font-family);
  font-size: var(--type-title-size);
  font-weight: var(--type-font-title-weight);
  line-height: var(--type-title-line-height);
  color: var(--type-text-color);
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  flex-shrink: 0;
}

.title-input::placeholder {
  color: var(--type-placeholder-color);
}

.editor-body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.conflict-banner {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--color-danger);
  background: rgba(224, 80, 80, 0.06);
  border-top: 1px solid rgba(224, 80, 80, 0.15);
  flex-shrink: 0;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  font-size: 12px;
}

.char-hint {
  color: var(--color-text-tertiary);
}

.unsaved {
  color: var(--color-warning);
  font-weight: 600;
}

.time-label {
  color: var(--color-text-tertiary);
}
</style>
