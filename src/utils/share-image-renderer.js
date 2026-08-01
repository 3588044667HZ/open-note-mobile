const ShareColors = {
  white:  { contentBg:"#FFFFFF", backcloth:"#FAFAFA", textColor:"#1A1A1A", titleColor:"#000000", timeColor:"#999999", borderColor:"#0000001F" },
  yellow: { contentBg:"#FEF7E2", backcloth:"#EFE8D4", textColor:"#96826C", titleColor:"#96826C", timeColor:"#5F4A33", borderColor:"#5F4A3322" },
  cyan:   { contentBg:"#EFF7F0", backcloth:"#E1E8E2", textColor:"#747D76", titleColor:"#747D76", timeColor:"#515D54", borderColor:"#3B505022" },
  blue:   { contentBg:"#EAF4F3", backcloth:"#DCE5E4", textColor:"#607474", titleColor:"#607474", timeColor:"#3B5050", borderColor:"#3B505022" },
  green:  { contentBg:"#EAF3F8", backcloth:"#DCE4E9", textColor:"#5A656C", titleColor:"#5A656C", timeColor:"#4E5960", borderColor:"#4E596022" },
  red:    { contentBg:"#F8F1E9", backcloth:"#E9E3DB", textColor:"#9F7660", titleColor:"#9F7660", timeColor:"#795C4C", borderColor:"#795C4C22" },
  grey:   { contentBg:"#F4F4F4", backcloth:"#E5E5E5", textColor:"#5F5F5F", titleColor:"#5F5F5F", timeColor:"#474747", borderColor:"#47474722" },
  black:  { contentBg:"#000000", backcloth:"#2E2E2E", textColor:"#FFFFFF", titleColor:"#FFFFFF", timeColor:"#8CFFFFFF", borderColor:"#FFFFFF33" }
}

function getSkinColorsFromCSS() {
  const styles = getComputedStyle(document.documentElement)
  return {
    contentBg:  styles.getPropertyValue('--skin-content-bg').trim() || '#FFFFFF',
    backcloth:  styles.getPropertyValue('--skin-backcloth').trim() || '#FAFAFA',
    textColor:  styles.getPropertyValue('--skin-text-color').trim() || '#1A1A1A',
    titleColor: styles.getPropertyValue('--skin-title-color').trim() || '#000000',
    timeColor:  styles.getPropertyValue('--skin-time-color').trim() || '#999999',
    borderColor: '#0000001F'
  }
}

const RENDER_ID = '__share_render_layer'

async function renderToImage(container, colors, opts = {}) {
  const { title = 'Untitled', watermark = 'Memo', logoText = 'Shared via OPEN Notes',
          width = 750, scale = 2 } = opts

  const contentEl = container.querySelector('[data-share-content]') || container
  const html = contentEl.innerHTML

  const layer = buildLayer(title, html, colors, { watermark, logoText, width })
  document.body.appendChild(layer)
  await delay(200)

  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(layer, {
    scale, useCORS: true, backgroundColor: null, logging: false, width
  })
  document.body.removeChild(layer)

  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Conversion failed')), 'image/png', 1.0)
  )
}

function buildLayer(title, html, c, opts) {
  const div = document.createElement('div')
  div.id = RENDER_ID
  div.style.cssText = `position:absolute;left:-9999px;top:0;z-index:-1;width:${opts.width}px;`
  div.innerHTML = `<div style="background:${c.backcloth};padding:24px;">
    <div style="background:${c.contentBg};border-radius:12px;
          color:${c.textColor};font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;
          border:1px solid ${c.borderColor};">
      <h2 style="color:${c.titleColor};font-size:24px;font-weight:650;line-height:1.1;
          margin:0;padding:16px 24px 14px;border-bottom:1px solid ${c.borderColor};">${escapeHtml(title)}</h2>
      <div style="font-size:16px;line-height:1.7;letter-spacing:0;word-break:break-word;padding:0 24px;">${html}</div>
      <div style="height:1px;background:${c.borderColor};margin:32px 0 16px;"></div>
      <div style="text-align:center;font-size:12px;color:${c.timeColor};">
        <div>${opts.logoText}</div>
        <div style="opacity:0.7;margin-top:4px;">${opts.watermark}</div>
      </div>
    </div>
  </div>`
  div.querySelectorAll('img').forEach(img => { img.style.maxWidth = '100%'; img.style.height = 'auto' })
  return div
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return str.replace(/[&<>"']/g, c => map[c])
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function downloadImage(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `note_${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function shareImage(blob, title) {
  if (!navigator.share) { downloadImage(blob); return }
  const file = new File([blob], `note_${Date.now()}.png`, { type: 'image/png' })
  try {
    await navigator.share({ title: title || 'Share note', files: [file] })
  } catch (e) {
    if (e.name !== 'AbortError') downloadImage(blob)
  }
}

export { ShareColors, getSkinColorsFromCSS, renderToImage, downloadImage, shareImage }
