<template>
  <div class="note-list-page">
    <div class="list-header">
      <div class="header-left">
        <div class="app-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect x="5" y="4" width="22" height="24" rx="3" fill="currentColor" opacity="0.15"/>
            <rect x="6.5" y="5.5" width="19" height="21" rx="2" stroke="currentColor" stroke-width="2"/>
            <line x1="11" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="11" y1="17" x2="21" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="11" y1="22" x2="16" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="app-name">Notes</span>
      </div>
      <span class="note-count" v-if="!store.loading">{{ store.filteredNotes.length }} notes</span>
    </div>

    <div class="search-bar" @click="showSearch = true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
        <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="rgba(0,0,0,0.35)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span>Search notes...</span>
    </div>

    <div v-if="showSearch" class="search-overlay">
      <div class="search-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
          <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="rgba(0,0,0,0.35)" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <input v-model="store.searchKeyword" ref="searchInputRef" type="text" placeholder="Search notes..." class="search-input" />
        <button class="cancel-btn" @click="closeSearch">Cancel</button>
      </div>
    </div>

    <div class="filter-row">
      <select v-model="store.currentNotebookId" class="filter-select">
        <option :value="null">All Notes</option>
        <option v-for="nb in store.notebooks" :key="nb.id" :value="nb.id">{{ nb.name }}</option>
      </select>
      <select v-model="store.sortBy" class="filter-select-sm">
        <option value="updatedAt">Recently</option>
        <option value="createdAt">Created</option>
      </select>
    </div>

    <div v-if="store.loading" class="empty-state">
      <div class="loading-spinner"></div>
      <span>Loading...</span>
    </div>

    <div v-else-if="store.filteredNotes.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="7" y="6" width="34" height="36" rx="4" stroke="rgba(0,0,0,0.08)" stroke-width="1.5"/>
        <line x1="15" y1="18" x2="33" y2="18" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="25" x2="33" y2="25" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="32" x2="24" y2="32" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span class="empty-text">No notes yet</span>
      <span class="empty-hint">Tap + to create your first note</span>
    </div>

    <div v-else class="note-grid">
      <div
        v-for="note in store.filteredNotes"
        :key="note.id"
        class="note-card"
        :class="{ pinned: note.isPinned }"
        @click="openNote(note)"
      >
        <div class="card-color-bar" :style="{ backgroundColor: colorHex(note.color) }"></div>
        <div class="card-body">
          <div class="card-header">
            <h3 class="card-title">{{ note.title || 'Untitled' }}</h3>
            <span v-if="note.isPinned" class="pin-badge">Pinned</span>
          </div>
          <p class="card-preview">{{ stripMD(note.content)?.slice(0, 120) || 'No content' }}</p>
          <div class="card-footer">
            <span class="card-time">{{ formatTime(note.updatedAt) }}</span>
            <span class="card-notebook" v-if="note.notebookId">{{ notebookName(note.notebookId) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '../stores/note'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const router = useRouter()
const store = useNoteStore()
const showSearch = ref(false)
const searchInputRef = ref(null)

const colorMap = {
  blue: '#4A90D9', green: '#7EC050', yellow: '#F5C842',
  orange: '#F5A623', red: '#E05050', gray: '#9B9B9B',
}
function colorHex(c) { return colorMap[c] || '#4A90D9' }

function stripMD(content) {
  if (!content) return ''
  return content.replace(/^#{1,6}\s+/gm, '').replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1').replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1').replace(/\[(.+?)]\(.+?\)/g, '$1')
    .replace(/^>\s+/gm, '').replace(/^- /gm, '').replace(/^\d+\. /gm, '')
    .replace(/```[\s\S]*?```/g, '').replace(/^---\s*$/gm, '')
    .replace(/\n+/g, ' ').trim()
}

function formatTime(time) {
  if (!time) return ''
  return dayjs(time).fromNow()
}

function notebookName(id) {
  return store.notebooks.find(nb => nb.id === id)?.name || ''
}

function openNote(note) {
  router.push({ name: 'editor', params: { id: note.id } })
}

function closeSearch() {
  store.searchKeyword = ''
  showSearch.value = false
}

watch(showSearch, (v) => {
  if (v) nextTick(() => searchInputRef.value?.focus())
})

onMounted(async () => {
  if (store.notebooks.length === 0) {
    await store.fetchNotebooks()
  }
  if (store.notes.length === 0) {
    await store.fetchNotes()
  }
})
</script>

<style scoped>
.note-list-page {
  padding: 0 16px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-logo {
  color: var(--color-primary);
  display: flex;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
  color: #000;
}

.note-count {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-white);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.3);
  font-size: 15px;
  cursor: pointer;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-white);
  z-index: 200;
  padding: 0 16px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--header-height);
}

.search-input {
  flex: 1;
  height: 36px;
  border: none;
  font-size: 16px;
  color: #000;
  background: transparent;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.cancel-btn {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 600;
  padding: 6px 8px;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-select, .filter-select-sm {
  height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  background: var(--color-white);
  color: var(--color-text-secondary);
}

.filter-select { flex: 1; }
.filter-select-sm { width: 100px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-text {
  font-size: 17px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.25);
}

.empty-hint {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.note-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-card {
  display: flex;
  background: var(--color-white);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}

.note-card:active {
  transform: scale(0.98);
}

.card-color-bar {
  width: 4px;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  padding: 14px;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.pin-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(0, 106, 255, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.card-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-tertiary);
}
</style>
