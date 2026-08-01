import { ref } from 'vue'

const SKINS = {
  white: '#FFFFFF',
  yellow: '#FEF7E2',
  cyan: '#EFF7F0',
  blue: '#EAF4F3',
  green: '#EAF3F8',
  red: '#F8F1E9',
  grey: '#F4F4F4',
  black: '#000000',
}

export { SKINS }
export const SKIN_ORDER = ['white', 'yellow', 'cyan', 'blue', 'green', 'red', 'grey', 'black']
export const SKIN_LABELS = {
  white: 'White',
  yellow: 'Eye Protect',
  cyan: 'Cyan',
  blue: 'Blue',
  green: 'Green',
  red: 'Red',
  grey: 'Grey',
  black: 'Dark',
}

const STORAGE_KEY = 'skin_preference'
const DARK_MODE_KEY = 'dark_mode_manual'

const currentSkin = ref(loadSkin())

function loadSkin() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SKINS[saved]) return saved
  } catch {}
  if (isSystemDarkMode()) return 'black'
  return 'white'
}

function isSystemDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
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

function toggleDarkMode() {
  const isDark = currentSkin.value === 'black'
  const target = isDark ? 'white' : 'black'
  applySkin(target)
}

watchSystemDarkMode()

function watchSystemDarkMode() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const isManualSet = localStorage.getItem(DARK_MODE_KEY) === '1'
    if (isManualSet) return
    applySkin(e.matches ? 'black' : 'white')
  })
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
    toggleDarkMode,
    isSystemDarkMode,
  }
}
