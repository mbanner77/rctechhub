// Client-side OnePager PDF generator for offerings (Starter Packages / Services)
// Uses dynamic imports for html2canvas and jsPDF to avoid SSR issues

export type OnePagerService = {
  id: string
  title: string
  description: string
  price: number
  category?: string
  technologyCategory?: string
  processCategory?: string
  technologies?: string[]
  image?: string
  rating?: number
  duration?: string
  included?: string[]
  notIncluded?: string[]
  process?: { title: string; description: string }[]
}

// Multi-service OnePager (for custom package builder)
export type CustomPackageItem = {
  name: string
  price: number
  category?: string
}

export type CustomPackageOnePager = {
  title: string
  description?: string
  items: CustomPackageItem[]
  totalPrice: number
  badges?: string[]
}

export async function generateCustomPackageOnePagerPDF(pkg: CustomPackageOnePager) {
  if (!isBrowser()) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf') as unknown as Promise<{ jsPDF: any }>,
  ])

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.width = '794px'
  container.style.background = 'white'
  container.style.fontFamily = "Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"

  const itemsHtml = (pkg.items || [])
    .map((it, idx) => `
      <div style="display:flex; justify-content:space-between; gap:12px; font-size:13px; padding:8px 0; border-bottom:1px solid #f3f4f6;">
        <div style="display:flex; gap:8px; align-items:center;">
          <div style="background:#ecfdf5; color:#065f46; font-weight:700; font-size:11px; width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:9999px;">${idx+1}</div>
          <div>
            <div style="font-weight:600; color:#111827;">${escapeHtml(it.name)}</div>
            ${it.category ? `<div style='font-size:11px; color:#6b7280;'>${escapeHtml(it.category)}</div>` : ''}
          </div>
        </div>
        <div style="font-weight:700; color:#065f46;">${formatEUR(it.price)}</div>
      </div>
    `)
    .join('') || `<div style='color:#9ca3af; font-size:12px;'>Keine Services ausgewählt</div>`

  const badgesHtml = (pkg.badges || []).map(b => pill(b)).join('')

  container.innerHTML = `
    <div id="onepager-root" style="box-sizing:border-box; width:794px; min-height:1123px; padding:28px; display:flex; flex-direction:column; gap:14px;">
      <header style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #e5e7eb; padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="/images/rc-logo.png" onerror="this.style.display='none'" alt="Logo" style="height:28px; width:auto;" />
          <div style="font-size:12px; color:#6b7280;">Beratungspaket OnePager</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#6b7280;">Erstellt am</div>
          <div style="font-size:12px; font-weight:600;">${new Date().toLocaleDateString('de-DE')}</div>
        </div>
      </header>

      <h1 style="margin:4px 0 4px 0; font-size:24px; font-weight:800; color:#111827;">${escapeHtml(pkg.title)}</h1>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">${badgesHtml}</div>
      ${pkg.description ? `<div style='font-size:14px; color:#374151;'>${escapeHtml(pkg.description)}</div>` : ''}

      <div style="display:flex; gap:14px;">
        <div style="flex:1; background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:16px;">
          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; font-weight:700; letter-spacing:.04em; margin-bottom:8px;">Enthaltene Leistungen</div>
          ${itemsHtml}
        </div>

        <div style="width:260px; background:#ecfdf5; border:1px solid #d1fae5; border-radius:8px; padding:16px; height:fit-content;">
          <div style="font-size:12px; color:#065f46; text-transform:uppercase; font-weight:700; letter-spacing:.04em;">Gesamtpreis</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800; color:#065f46;">${formatEUR(pkg.totalPrice)}</div>
          <div style="font-size:12px; color:#047857;">zzgl. MwSt.</div>
        </div>
      </div>

      <footer style="margin-top:auto; border-top:1px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between; color:#6b7280; font-size:10px;">
        <div>realCore TechHub · www.realcore.group</div>
        <div>Kontakt: techhub@realcore.de</div>
      </footer>
    </div>
  `

  document.body.appendChild(container)

  const canvas = await html2canvas(container as HTMLElement, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: 794,
    height: 1123,
    windowWidth: 794,
    windowHeight: 1123,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
  document.body.removeChild(container)

  const fileName = toFileName(`OnePager_${pkg.title}.pdf`)
  pdf.save(fileName)
}

// Helper to ensure code only runs in the browser
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

export async function generateServiceOnePagerPDF(service: OnePagerService) {
  if (!isBrowser()) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf') as unknown as Promise<{ jsPDF: any }>,
  ])

  // Create offscreen container with styled A4 layout
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.width = '794px' // A4 width at 96 DPI approx
  container.style.background = 'white'
  container.style.fontFamily = "Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"

  container.innerHTML = `
    <div style="box-sizing:border-box; width:794px; min-height:1123px; padding:32px; display:flex; flex-direction:column; gap:16px;">
      <header style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #e5e7eb; padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="/images/rc-logo.png" onerror="this.style.display='none'" alt="Logo" style="height:28px; width:auto;" />
          <div style="font-size:12px; color:#6b7280;">Beratungspaket OnePager</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#6b7280;">Erstellt am</div>
          <div style="font-size:12px; font-weight:600;">${new Date().toLocaleDateString('de-DE')}</div>
        </div>
      </header>

      <div style="display:flex; gap:16px;">
        <div style="flex:1;">
          <h1 style="margin:0 0 8px 0; font-size:26px; font-weight:800; color:#111827;">${escapeHtml(service.title)}</h1>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
            ${service.category ? pill(service.category) : ''}
            ${service.technologyCategory ? pill(service.technologyCategory) : ''}
            ${service.processCategory ? pill(service.processCategory) : ''}
          </div>
          <div style="font-size:14px; color:#374151; line-height:1.6;">
            ${escapeHtml(collapseWhitespace(stripHtml(service.description || '')))}
          </div>
        </div>
        <div style="width:260px; height:180px; border-radius:8px; overflow:hidden; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">
          ${service.image ? `<img src="${service.image}" alt="Cover" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/placeholder.svg'"/>` : `<div style='color:#9ca3af;font-size:12px;'>Kein Bild</div>`}
        </div>
      </div>

      <div data-op-block style="display:flex; gap:14px;">
        <div data-op-block style="flex:1; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:16px;">
          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; font-weight:700; letter-spacing:.04em;">Leistungen & Technologien</div>
          ${(service.technologies && service.technologies.length) ? `<div data-op-block style='margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;'>${(service.technologies || []).map(t => tag(t)).join('')}</div>` : ''}
          ${(service.included && service.included.length) ? `<ul data-op-block style='margin-top:10px; padding-left:16px; color:#374151; font-size:13px; line-height:1.5;'>${service.included.slice(0,8).map(i => `<li data-op-item style='margin-bottom:6px;'>${escapeHtml(i)}</li>`).join('')}${service.included.length>8?`<li data-op-item style='color:#6b7280;'>… weitere Punkte</li>`:''}</ul>` : ''}
          ${(service.notIncluded && service.notIncluded.length) ? `<div data-op-block style='margin-top:8px; font-size:12px; color:#6b7280;'>Nicht enthalten:</div><ul data-op-block style='margin-top:6px; padding-left:16px; font-size:12px; color:#6b7280;'>${service.notIncluded.slice(0,5).map(i => `<li data-op-item style='margin-bottom:4px;'>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}
        </div>
        <div data-op-block style="width:260px; background:#ecfdf5; border:1px solid #d1fae5; border-radius:8px; padding:16px;">
          <div style="font-size:12px; color:#065f46; text-transform:uppercase; font-weight:700; letter-spacing:.04em;">Festpreis</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800; color:#065f46;">${formatEUR(service.price)}</div>
          <div style="font-size:12px; color:#047857;">zzgl. MwSt.</div>
          ${service.duration ? `<div style='margin-top:8px; font-size:12px; color:#065f46;'>⏱ ${escapeHtml(service.duration)}</div>` : ''}
          ${typeof service.rating === 'number' ? `<div style="margin-top:12px; font-size:12px; color:#065f46;">⭐ ${service.rating.toFixed(1)} / 5</div>` : ''}
        </div>
      </div>

      ${(service.process && service.process.length) ? `
      <div data-op-block data-op-section="process" style='background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:14px;'>
        <div style="font-size:12px; color:#6b7280; text-transform:uppercase; font-weight:700; letter-spacing:.04em; margin-bottom:8px;">Ablauf</div>
        <ol style='margin:0; padding-left:0; list-style:none; display:flex; flex-direction:column; gap:10px;'>
          ${service.process.slice(0,6).map((step, idx) => `
            <li data-op-item style='display:flex; gap:10px; align-items:flex-start;'>
              <div style="background:#dcfce7; color:#065f46; font-weight:700; font-size:11px; width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:9999px;">${idx+1}</div>
              <div style='flex:1;'>
                <div style='font-weight:600; color:#111827;'>${escapeHtml(step.title || `Schritt ${idx+1}`)}</div>
                <div style='font-size:13px; color:#374151;'>${escapeHtml(collapseWhitespace(stripHtml(step.description || '')))}</div>
              </div>
            </li>
          `).join('')}
          ${service.process.length>6?`<li style='color:#6b7280; font-size:12px; margin-left:32px;'>… weitere Schritte</li>`:''}
        </ol>
      </div>` : ''}

      <footer style="margin-top:auto; border-top:1px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between; color:#6b7280; font-size:10px;">
        <div>realCore TechHub · www.realcore.group</div>
        <div>Kontakt: techhub@realcore.de</div>
      </footer>
    </div>
  `

  document.body.appendChild(container)

  // Collect smart breakpoints from DOM before rendering
  const rootEl = container.querySelector('#onepager-root') as HTMLElement
  const pageHeightCss = 1123
  const safeOffsetsCss: number[] = [0]
  try {
    const blocks = Array.from(rootEl.querySelectorAll('[data-op-block], [data-op-item]')) as HTMLElement[]
    for (const el of blocks) {
      const y = el.offsetTop - rootEl.offsetTop
      if (y > 0) safeOffsetsCss.push(y)
      const yBottom = y + el.offsetHeight
      safeOffsetsCss.push(yBottom)
    }
    safeOffsetsCss.push(rootEl.scrollHeight)
    // Deduplicate and sort
    safeOffsetsCss.sort((a,b)=>a-b)
  } catch {}

  // Render to canvas at high scale for sharpness (full natural height)
  const canvas = await html2canvas(container as HTMLElement, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: 794,
    windowWidth: 794,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth() // 595pt
  const pageHeight = pdf.internal.pageSize.getHeight() // 842pt

  // Compute page break positions using safe breakpoints
  const cssToCanvas = (v: number) => Math.round(v * (canvas.width / 794))
  const targetCss = pageHeightCss
  const pageEndsCss: number[] = []
  let startCss = 0
  const margin = 24

  // If a process section exists, force page 1 to end right before it
  const processEl = rootEl.querySelector('[data-op-section="process"]') as HTMLElement | null
  if (processEl) {
    const processTop = processEl.offsetTop - rootEl.offsetTop
    const firstEnd = Math.max(0, processTop - margin)
    // End page 1 before the process block (but at a safe offset if possible)
    let firstPageEnd = 0
    for (const off of safeOffsetsCss) {
      if (off <= firstEnd) firstPageEnd = off
      else break
    }
    if (firstPageEnd === 0) firstPageEnd = firstEnd
    pageEndsCss.push(firstPageEnd)
    startCss = Math.max(firstPageEnd, processTop)
  }

  while (startCss < (rootEl.scrollHeight - 1)) {
    const target = startCss + targetCss
    // find last safe <= target - margin
    let candidate = startCss
    for (const off of safeOffsetsCss) {
      if (off <= target - margin) candidate = off
      else break
    }
    if (candidate <= startCss) {
      candidate = Math.min(startCss + targetCss, rootEl.scrollHeight)
    }
    pageEndsCss.push(candidate)
    startCss = candidate
  }

  // Slice canvas at computed CSS offsets (ensure advancing positions)
  const filteredEnds: number[] = []
  {
    let last = 0
    for (const end of pageEndsCss) {
      if (end > last + 4) { // require minimal progress
        filteredEnds.push(end)
        last = end
      }
    }
    if (filteredEnds.length === 0) {
      filteredEnds.push(rootEl.scrollHeight)
    }
  }

  let prevCss = 0
  for (let i = 0; i < filteredEnds.length; i++) {
    const endCss = filteredEnds[i]
    const sliceCss = Math.max(0, endCss - prevCss)
    const slicePx = Math.max(1, cssToCanvas(sliceCss))
    const startPx = cssToCanvas(prevCss)

    const pageCanvas = document.createElement('canvas')
    const pageContext = pageCanvas.getContext('2d')!
    pageCanvas.width = canvas.width
    pageCanvas.height = slicePx
    pageContext.drawImage(canvas, 0, startPx, canvas.width, slicePx, 0, 0, canvas.width, slicePx)
    const imgData = pageCanvas.toDataURL('image/png')

    const imgWidthPt = pageWidth
    const imgHeightPt = (slicePx / canvas.width) * pageWidth

    if (i === 0) pdf.addImage(imgData, 'PNG', 0, 0, imgWidthPt, imgHeightPt, undefined, 'FAST')
    else { pdf.addPage('a4', 'portrait'); pdf.addImage(imgData, 'PNG', 0, 0, imgWidthPt, imgHeightPt, undefined, 'FAST') }

    prevCss = endCss
  }

  // Clean up
  document.body.removeChild(container)

  const fileName = toFileName(`OnePager_${service.title}.pdf`)
  pdf.save(fileName)
}

// Utilities
function pill(text: string) {
  return `<span style="font-size:11px; padding:6px 10px; border:1px solid #e5e7eb; border-radius:9999px; background:#f9fafb; color:#374151;">${escapeHtml(text)}</span>`
}

function tag(text: string) {
  return `<span style="font-size:11px; padding:6px 10px; border-radius:6px; background:#eef2ff; color:#3730a3;">${escapeHtml(text)}</span>`
}

function formatEUR(value: number) {
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${value.toLocaleString('de-DE')} €`
  }
}

function toFileName(name: string) {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '')
}

function stripHtml(html: string) {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Collapse multi-space and NBSP; remove leading spaces at line starts
function collapseWhitespace(text: string) {
  return (text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/^\s+/gm, '')
    .trim()
}
