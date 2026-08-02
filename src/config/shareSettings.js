import * as api from '../api'

const STORAGE_KEY = 'share_settings'

function getCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function setCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export async function getShareSettings() {
  try {
    const res = await api.getShareSettings()
    setCache(res.data)
    return res.data
  } catch {
    return getCache() || { logoText: 'Shared via OPEN Notes', watermark: 'Memo' }
  }
}

export function getShareSettingsCached() {
  return getCache() || { logoText: 'Shared via OPEN Notes', watermark: 'Memo' }
}

export async function saveShareSettings(partial) {
  setCache({ ...getShareSettingsCached(), ...partial })
  try {
    const res = await api.updateShareSettings(partial)
    setCache(res.data)
    return res.data
  } catch {
    return getCache()
  }
}
