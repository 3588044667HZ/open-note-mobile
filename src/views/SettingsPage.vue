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
        <div class="section-title">Appearance</div>
        <div class="settings-card">
          <div class="setting-row">
            <div class="setting-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path v-if="currentSkin === 'black'" d="M8 1a7 7 0 000 14A5 5 0 018 1z" fill="rgba(0,0,0,0.55)"/>
                <path v-else d="M13.5 8.5A5 5 0 017.5 2.5a5 5 0 106 6z" stroke="rgba(0,0,0,0.45)" stroke-width="1.3" stroke-linecap="round"/>
                <circle v-if="currentSkin === 'black'" cx="8" cy="8" r="2" fill="#FFD700"/>
              </svg>
            </div>
            <span class="setting-label">Dark Mode</span>
            <button class="toggle-switch" :class="{ active: currentSkin === 'black' }" @click="handleToggleDark">
              <span class="toggle-knob"></span>
            </button>
          </div>
          <div class="setting-row">
            <div class="setting-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" :stroke="currentSkin === 'yellow' ? '#96826C' : 'rgba(0,0,0,0.45)'" stroke-width="1.3"/>
                <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" :stroke="currentSkin === 'yellow' ? '#96826C' : 'rgba(0,0,0,0.45)'" stroke-width="1.3"/>
              </svg>
            </div>
            <span class="setting-label">Eye Protection</span>
            <button class="toggle-switch" :class="{ active: currentSkin === 'yellow' }" @click="toggleEyeProtection">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      </div>

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
        <div class="section-title">Share Image Footer</div>
        <div class="settings-card">
          <div class="setting-row">
            <span class="setting-label-sm">署名</span>
            <input v-model="shareForm.logoText" type="text" class="share-input" maxlength="30" @blur="handleShareSave" />
          </div>
          <div class="setting-row">
            <span class="setting-label-sm">水印</span>
            <input v-model="shareForm.watermark" type="text" class="share-input" maxlength="20" @blur="handleShareSave" />
          </div>
          <div class="setting-row setting-row-actions">
            <span class="share-sync-status" :class="shareSyncStatus">{{ shareSyncLabel }}</span>
            <button class="share-sync-btn" @click="handleShareSync" :disabled="shareSyncing">
              <svg v-if="shareSyncing" width="14" height="14" viewBox="0 0 16 16" class="animate-spin">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 10"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
              </svg>
              {{ shareSyncing ? 'Syncing...' : 'Sync to Server' }}
            </button>
          </div>
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
import { ref, nextTick, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNoteStore } from '../stores/note'
import { useSkin } from '../composables/useSkin'
import { getShareSettings, saveShareSettings } from '../config/shareSettings'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const store = useNoteStore()
const { currentSkin, toggleEyeProtection, toggleDarkMode } = useSkin()
const showAddNB = ref(false)
const newNBName = ref('')
const nbInputRef = ref(null)
const shareForm = reactive({ logoText: '', watermark: '' })
const shareSyncing = ref(false)
const shareSyncStatus = ref('idle')

const shareSyncLabelMap = { idle: '', syncing: 'Syncing...', done: 'Synced', fail: 'Network error' }

const shareSyncLabel = computed(() => shareSyncLabelMap[shareSyncStatus.value] || '')

onMounted(async () => {
  const settings = await getShareSettings()
  shareForm.logoText = settings.logoText
  shareForm.watermark = settings.watermark
})

function formatDate(d) {
  if (!d) return '---'
  return dayjs(d).format('YYYY/MM/DD')
}

function handleToggleDark() {
  toggleDarkMode()
}

async function handleShareSave() {
  const result = await saveShareSettings({ logoText: shareForm.logoText, watermark: shareForm.watermark })
  shareSyncStatus.value = result ? 'done' : 'fail'
  if (!result) setTimeout(() => { shareSyncStatus.value = 'idle' }, 2000)
}

async function handleShareSync() {
  shareSyncing.value = true
  shareSyncStatus.value = 'syncing'
  try {
    await saveShareSettings({ logoText: shareForm.logoText, watermark: shareForm.watermark })
    shareSyncStatus.value = 'done'
  } catch {
    shareSyncStatus.value = 'fail'
  } finally {
    shareSyncing.value = false
    setTimeout(() => { shareSyncStatus.value = 'idle' }, 2000)
  }
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
  color: var(--color-text);
  flex: 1;
}

.setting-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-switch {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: rgba(0, 0, 0, 0.12);
  position: relative;
  transition: background 0.25s ease;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease;
}

.toggle-switch.active .toggle-knob {
  transform: translateX(18px);
}

.setting-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.setting-label-sm {
  font-size: 13px;
  color: var(--color-text-secondary);
  width: 48px;
  flex-shrink: 0;
}

.share-input {
  flex: 1;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  color: var(--color-text);
  background: transparent;
}

.setting-row-actions {
  justify-content: flex-end;
}

.share-sync-status {
  font-size: 12px;
  margin-right: 8px;
}
.share-sync-status.done { color: var(--color-green); }
.share-sync-status.fail { color: var(--color-danger); }

.share-sync-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background: rgba(0, 106, 255, 0.08);
  transition: opacity 0.15s;
  white-space: nowrap;
}

.share-sync-btn:disabled {
  opacity: 0.6;
}

.share-sync-btn:active:not(:disabled) {
  background: rgba(0, 106, 255, 0.15);
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
