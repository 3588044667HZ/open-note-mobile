const COLOR_TOKENS_LIGHT = {
  '--color-red': 'rgba(213,73,51,1)',
  '--color-orange': 'rgba(225,132,19,1)',
  '--color-yellow': 'rgba(219,154,0,1)',
  '--color-green': 'rgba(44,136,72,1)',
  '--color-blue': 'rgba(50,88,197,1)',
  '--color-gray': 'rgba(0,0,0,0.26)',
  '--highlight-yellow': 'rgba(247,198,0,0.3)',
  '--highlight-red': 'rgba(213,73,51,0.3)',
  '--highlight-blue': 'rgba(50,88,197,0.3)',
  '--highlight-green': 'rgba(44,136,72,0.3)',
}

const COLOR_TOKENS_DARK = {
  '--color-red': 'rgba(255,173,190,1)',
  '--color-orange': 'rgba(255,198,98,1)',
  '--color-yellow': 'rgba(255,219,88,1)',
  '--color-green': 'rgba(129,201,149,1)',
  '--color-blue': 'rgba(138,180,248,1)',
  '--color-gray': 'rgba(255,255,255,0.26)',
  '--highlight-yellow': 'rgba(247,198,0,0.2)',
  '--highlight-red': 'rgba(213,73,51,0.2)',
  '--highlight-blue': 'rgba(50,88,197,0.2)',
  '--highlight-green': 'rgba(44,136,72,0.2)',
}

function isDarkMode() {
  return document.documentElement.getAttribute('data-skin') === 'black'
}

export function applyColorTokens() {
  const tokens = isDarkMode() ? COLOR_TOKENS_DARK : COLOR_TOKENS_LIGHT
  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

export const COLOR_CATEGORIES = {
  text: [
    { class: 'color_default', label: 'Default', style: { color: 'inherit', border: '1px solid #ccc' } },
    { class: 'color_red', label: 'Red', style: { color: 'var(--color-red)' } },
    { class: 'color_orange', label: 'Orange', style: { color: 'var(--color-orange)' } },
    { class: 'color_yellow', label: 'Yellow', style: { color: 'var(--color-yellow)' } },
    { class: 'color_green', label: 'Green', style: { color: 'var(--color-green)' } },
    { class: 'color_blue', label: 'Blue', style: { color: 'var(--color-blue)' } },
    { class: 'color_gray', label: 'Gray', style: { color: 'var(--color-gray)' } },
  ],
  highlight: [
    { class: 'color_default', label: 'None', style: { background: 'inherit', border: '1px solid #ccc' } },
    { class: 'highlight_yellow', label: 'Y', style: { background: 'var(--highlight-yellow)' } },
    { class: 'highlight_red', label: 'R', style: { background: 'var(--highlight-red)' } },
    { class: 'highlight_blue', label: 'B', style: { background: 'var(--highlight-blue)' } },
    { class: 'highlight_green', label: 'G', style: { background: 'var(--highlight-green)' } },
  ],
  underline: [
    { class: 'underline_solid_default', label: 'Default', style: { textDecoration: 'underline', textDecorationColor: 'inherit' } },
    { class: 'underline_solid_color_red', label: 'Red', style: { textDecoration: 'underline', textDecorationColor: 'var(--color-red)' } },
    { class: 'underline_solid_color_orange', label: 'Orange', style: { textDecoration: 'underline', textDecorationColor: 'var(--color-orange)' } },
    { class: 'underline_solid_color_green', label: 'Green', style: { textDecoration: 'underline', textDecorationColor: 'var(--color-green)' } },
    { class: 'underline_solid_color_blue', label: 'Blue', style: { textDecoration: 'underline', textDecorationColor: 'var(--color-blue)' } },
    { class: 'underline_solid_color_gray', label: 'Gray', style: { textDecoration: 'underline', textDecorationColor: 'var(--color-gray)' } },
  ],
  wavy: [
    { class: 'underline_wavy_default', label: 'Default', style: {} },
    { class: 'underline_wavy_color_red', label: 'Red', style: {} },
    { class: 'underline_wavy_color_orange', label: 'Orange', style: {} },
    { class: 'underline_wavy_color_green', label: 'Green', style: {} },
    { class: 'underline_wavy_color_blue', label: 'Blue', style: {} },
    { class: 'underline_wavy_color_gray', label: 'Gray', style: {} },
  ],
}

export const COLOR_TABS = ['text', 'highlight', 'underline', 'wavy']
export const COLOR_TAB_LABELS = { text: 'Text', highlight: 'Highlight', underline: 'Underline', wavy: 'Wavy' }
