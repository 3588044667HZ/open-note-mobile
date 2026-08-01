<template>
  <Teleport to="body">
    <div v-if="visible" class="share-modal-overlay" @click.self="close">
      <div class="share-modal">
        <div class="share-modal-header">
          <span class="sm-title">Share as Image</span>
          <button class="sm-close" @click="close">&times;</button>
        </div>

        <div v-if="loading" class="sm-loading">
          <div class="sm-spinner"></div>
          <p>Generating image...</p>
        </div>

        <div v-else-if="error" class="sm-error">
          <p>{{ error }}</p>
          <button class="sm-btn sm-btn-primary" @click="$emit('retry')">Retry</button>
        </div>

        <template v-else-if="previewUrl">
          <div class="sm-preview">
            <img :src="previewUrl" alt="Preview" />
          </div>
          <div class="sm-actions">
            <button class="sm-btn sm-btn-primary" @click="handleSave">Save</button>
            <button class="sm-btn" @click="handleShare">Share</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { downloadImage, shareImage } from '../utils/share-image-renderer'

const props = defineProps({
  visible: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  blob: { type: Object, default: null },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close', 'retry'])

const previewUrl = computed(() => {
  if (!props.blob) return null
  return URL.createObjectURL(props.blob)
})

function close() {
  emit('close')
}

function handleSave() {
  if (!props.blob) return
  downloadImage(props.blob, `note_${Date.now()}.png`)
}

async function handleShare() {
  if (!props.blob) return
  await shareImage(props.blob, props.title)
}
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.share-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.share-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.sm-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.sm-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 18px;
  color: var(--color-icon);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sm-close:active { background: rgba(0, 0, 0, 0.06); }

.sm-loading {
  padding: 48px 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.sm-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sm-error {
  padding: 32px 24px;
  text-align: center;
  color: var(--color-danger);
  font-size: 14px;
}

.sm-preview {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.03);
}

.sm-preview img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sm-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.sm-btn {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.15s;
}

.sm-btn:active { background: rgba(0, 0, 0, 0.04); }

.sm-btn-primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.sm-btn-primary:active { opacity: 0.85; }
</style>
