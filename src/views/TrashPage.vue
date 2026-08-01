<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 4.5L7 10l5.5 5.5" stroke="#006aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="title">Recently Deleted</span>
    </div>

    <div class="page-body" style="padding: 16px;">
      <p class="trash-tip">Notes stay here for 30 days, then are permanently deleted.</p>
      <div v-if="loading" class="empty-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>
      <div v-else-if="store.trashNotes.length === 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M10 12h20M15 12V9a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0125 9v3" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="11.5" y="12" width="17" height="17.5" rx="2" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
        </svg>
        <span class="empty-text">No deleted notes</span>
      </div>
      <div v-else class="trash-list">
        <div v-for="note in store.trashNotes" :key="note.id" class="trash-item">
          <div class="trash-item-info">
            <span class="trash-item-title">{{ note.title || 'Untitled' }}</span>
            <span class="trash-item-content">{{ note.content?.slice(0, 80) }}</span>
          </div>
          <div class="trash-item-actions">
            <button class="btn-recover" @click="handleRecover(note.id)">Recover</button>
            <button class="btn-delete" @click="handlePermanentDelete(note.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '../stores/note'

const router = useRouter()
const store = useNoteStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await store.fetchTrashNotes()
  loading.value = false
})

async function handleRecover(id) {
  await store.recoverNoteFromTrash(id)
}

async function handlePermanentDelete(id) {
  await store.permanentlyDelete(id)
}
</script>

<style scoped>
.trash-tip {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}

.empty-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 24px; height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.trash-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trash-item {
  display: flex;
  align-items: center;
  background: var(--color-white);
  border-radius: 12px;
  padding: 14px;
  gap: 12px;
}

.trash-item-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trash-item-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.trash-item-content {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-recover {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(0, 106, 255, 0.1);
  color: var(--color-primary);
}
.btn-recover:active { background: rgba(0, 106, 255, 0.18); }

.btn-delete {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(224, 80, 80, 0.1);
  color: var(--color-danger);
}
.btn-delete:active { background: rgba(224, 80, 80, 0.18); }
</style>
