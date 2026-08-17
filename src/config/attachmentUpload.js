import { registerAttachment, uploadAttachmentFile } from '../api'

const PENDING_KEY = 'attachment_pending_uploads'

export function generateAttachId() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function thumbUrl(attachId) {
  return `/api/attachments/${attachId}/download?size=thumb`
}

export function originalUrl(attachId) {
  return `/api/attachments/${attachId}/download`
}

function getPendingQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')
  } catch {
    return []
  }
}

function savePendingQueue(queue) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue))
  } catch {}
}

export function getPendingUploads() {
  return getPendingQueue()
}

export function enqueuePendingUpload(attachId, fileName, fileType) {
  const queue = getPendingQueue()
  if (!queue.some((item) => item.attachId === attachId)) {
    queue.push({ attachId, fileName, fileType })
    savePendingQueue(queue)
  }
}

export function dequeuePendingUpload(attachId) {
  savePendingQueue(getPendingQueue().filter((item) => item.attachId !== attachId))
}

export async function registerAttachmentSlot(attachId, file, noteId) {
  return registerAttachment({
    attachId,
    noteId: noteId || null,
    type: 0,
    fileName: file.name,
    size: file.size,
    md5: '',
  })
}

export async function uploadPending(attachId, file) {
  const res = await uploadAttachmentFile(attachId, file)
  dequeuePendingUpload(attachId)
  return res
}

export async function retryPendingUploads() {
  const queue = getPendingQueue()
  for (const item of queue) {
    const file = await readStoredFile(item)
    if (!file) continue
    try {
      await uploadPending(item.attachId, file)
    } catch {
      // 单条失败不影响后续重试
    }
  }
}

async function readStoredFile(item) {
  try {
    const raw = localStorage.getItem(`att_pending_${item.attachId}`)
    if (!raw) return null
    const blob = base64ToBlob(raw, item.fileType || 'image/jpeg')
    return new File([blob], item.fileName || 'image.jpg', { type: item.fileType || 'image/jpeg' })
  } catch {
    return null
  }
}

export function storePendingFile(attachId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const base64 = String(reader.result).split(',')[1]
        localStorage.setItem(`att_pending_${attachId}`, base64)
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function clearStoredFile(attachId) {
  try {
    localStorage.removeItem(`att_pending_${attachId}`)
  } catch {}
}

function base64ToBlob(b64, mime) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
