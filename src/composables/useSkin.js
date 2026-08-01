import { ref, watch } from 'vue'

const SKINS = {
  white: '#FFFFFF',
  yellow: '#FEF7E2',
  cyan: '#EFF7F0',
  blue: '#EAF4F3',
  green: '#EAF3F8',
  red: '#F8F1E9',
  grey: '#F4F4F4',
}

export { SKINS }
export const SKIN_ORDER = ['white', 'yellow', 'cyan', 'blue', 'green', 'red', 'grey']
export const SKIN_LABELS = {
  white: 'White',
  yellow: 'Eye Protect',
  cyan: 'Cyan',
  blue: 'Blue',
  green: 'Green',
  red: 'Red',
  grey: 'Grey',
}

const STORAGE_KEY = 'skin_preference'

const currentSkin = ref(loadSkin())

function loadSkin() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SKINS[saved]) return saved
  } catch {}
  return 'white'
}

function applySkin(id) {
  document.documentElement.setAttribute('data-skin', id)
  currentSkin.value = id
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
}

function selectSkin(id) {
  if (!SKINS[id]) return
  applySkin(id)
}

function toggleEyeProtection() {
  const target = currentSkin.value === 'yellow' ? 'white' : 'yellow'
  applySkin(target)
}

export function useSkin() {
  applySkin(currentSkin.value)

  return {
    currentSkin,
    SKINS,
    SKIN_ORDER,
    SKIN_LABELS,
    selectSkin,
    toggleEyeProtection,
  }
}
