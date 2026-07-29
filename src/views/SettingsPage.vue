<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 4.5L7 10l5.5 5.5" stroke="#006aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="title">Settings</span>
    </div>

    <div class="page-body" style="padding: 16px;">
      <div class="settings-section">
        <div class="section-title">Account</div>
        <div class="settings-card">
          <div class="setting-row">
            <span class="setting-label">Username</span>
            <span class="setting-value">{{ authStore.user?.username || '---' }}</span>
          </div>
          <div class="setting-row">
            <span class="setting-label">Joined</span>
            <span class="setting-value">{{ formatDate(authStore.user?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">Notebooks</div>
        <div class="settings-card">
          <div v-if="showAddNB" class="setting-row">
            <input v-model="newNBName" type="text" placeholder="Notebook name" class="nb-input" @keydown.enter="handleAddNotebook" ref="nbInputRef" />
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button class="btn-cancel" @click="showAddNB = false; newNBName = ''">Cancel</button>
              <button class="btn-add" @click="handleAddNotebook">Add</button>
            </div>
          </div>
          <div v-for="nb in store.notebooks" :key="nb.id" class="setting-row">
            <div class="nb-color" :style="{ backgroundColor: nb.color || '#9B9B9B' }"></div>
            <span class="setting-label">{{ nb.name }}</span>
            <button class="btn-delete-sm" @click="handleDeleteNotebook(nb.id)">Delete</button>
          </div>
          <button v-if="!showAddNB" class="add-nb-btn" @click="showAddNB = true">+ Add Notebook</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">About</div>
        <div class="settings-card">
          <div class="setting-row">
            <span class="setting-label">Version</span>
            <span class="setting-value">1.0.0</span>
          </div>
          <div class="setting-row">
            <span class="setting-label">API</span>
            <span class="setting-value">http://localhost:5000</span>
          </div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">Sign Out</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNoteStore } from '../stores/note'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const store = useNoteStore()
const showAddNB = ref(false)
const newNBName = ref('')
const nbInputRef = ref(null)

function formatDate(d) {
  if (!d) return '---'
  return dayjs(d).format('YYYY/MM/DD')
}

async function handleAddNotebook() {
  if (!newNBName.value.trim()) return
  await store.addNotebook({ name: newNBName.value.trim() })
  newNBName.value = ''
  showAddNB.value = false
}

async function handleDeleteNotebook(id) {
  await store.removeNotebook(id)
}

async function handleLogout() {
  await authStore.logout()
  router.replace('/')
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-left: 4px;
}

.settings-card {
  background: var(--color-white);
  border-radius: 12px;
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  gap: 10px;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 15px;
  color: #000;
  flex: 1;
}

.setting-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.nb-color {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
}

.nb-input {
  flex: 1;
  height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
}

.btn-cancel {
  padding: 6px 12px; border-radius: 6px; font-size: 13px;
  background: rgba(0,0,0,0.06); color: var(--color-text-secondary);
}

.btn-add {
  padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
  background: var(--color-primary); color: #fff;
}

.btn-delete-sm {
  padding: 4px 10px; border-radius: 6px; font-size: 11px;
  color: var(--color-danger); background: rgba(224,80,80,0.1);
}

.add-nb-btn {
  width: 100%; padding: 14px 16px; font-size: 15px;
  color: var(--color-primary); font-weight: 600; text-align: left;
}

.logout-btn {
  width: 100%; height: 48px; border-radius: 12px;
  font-size: 16px; font-weight: 600;
  background: rgba(224, 80, 80, 0.1); color: var(--color-danger);
}
.logout-btn:active { background: rgba(224, 80, 80, 0.18); }
</style>
