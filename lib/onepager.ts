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

export type CurrencyCode = "EUR" | "CHF"

export async function generateCustomPackageOnePagerPDF(pkg: CustomPackageOnePager, currency: CurrencyCode = "EUR") {
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
        <div style="font-weight:700; color:#065f46;">${formatCurrencyForPDF(it.price, currency)}</div>
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
          <div style="margin-top:8px; font-size:28px; font-weight:800; color:#065f46;">${formatCurrencyForPDF(pkg.totalPrice, currency)}</div>
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

  // Distribute first page: insert a spacer before the process block so that
  // page 1 content uses the available height and "Ablauf" starts on page 2.
  try {
    const rootElTmp = container.querySelector('#onepager-root') as HTMLElement
    const processElTmp = rootElTmp?.querySelector('[data-op-section="process"]') as HTMLElement | null
    if (rootElTmp && processElTmp) {
      const pageHeightCssTmp = 1123
      const desiredFirstPageEnd = pageHeightCssTmp - 24 // fill page almost entirely
      const currentTop = processElTmp.offsetTop - rootElTmp.offsetTop
      const gap = Math.max(0, desiredFirstPageEnd - currentTop)
      if (gap > 10) {
        const spacer = document.createElement('div')
        spacer.setAttribute('data-op-block', '')
        spacer.setAttribute('data-op-spacer', '')
        spacer.style.height = `${gap}px`
        spacer.style.display = 'block'
        spacer.style.background = 'transparent'
        processElTmp.parentElement?.insertBefore(spacer, processElTmp)
      }
    }
  } catch {}
  console.log('[OnePager] container appended')

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

export async function generateServiceOnePagerPDF(service: OnePagerService, currency: CurrencyCode = "EUR") {
  if (!isBrowser()) return
  try {
    console.log('[OnePager] start generateServiceOnePagerPDF', service?.id || service?.title)
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

    // Precompute safe image HTML to avoid exceptions during template evaluation
    // Dynamic, branded inline SVG placeholder (no external requests, fills the box nicely)
    const catName = service.category || 'Beratungspaket'
    const cat = (service.category || '').toLowerCase()
    const theme = (() => {
      if (/(ai|assistant|ml|llm)/.test(cat)) return { start: '#6d28d9', end: '#4f46e5', accent1: '#c4b5fd', accent2: '#a78bfa', ink: '#1e1b4b', badgeA: '#ede9fe', badgeB: '#ddd6fe', text: '#312e81', kind: 'ai' as const }
      if (/(analytics|data|report)/.test(cat)) return { start: '#0284c7', end: '#0ea5e9', accent1: '#bae6fd', accent2: '#7dd3fc', ink: '#0c4a6e', badgeA: '#e0f2fe', badgeB: '#bae6fd', text: '#075985', kind: 'analytics' as const }
      if (/(integration|prozess|process|connect)/.test(cat)) return { start: '#0d9488', end: '#14b8a6', accent1: '#99f6e4', accent2: '#5eead4', ink: '#134e4a', badgeA: '#ccfbf1', badgeB: '#99f6e4', text: '#115e59', kind: 'integration' as const }
      if (/(sap|btp)/.test(cat)) return { start: '#16a34a', end: '#10b981', accent1: '#bbf7d0', accent2: '#86efac', ink: '#065f46', badgeA: '#ecfdf5', badgeB: '#d1fae5', text: '#065f46', kind: 'sap' as const }
      return { start: '#16a34a', end: '#10b981', accent1: '#bbf7d0', accent2: '#86efac', ink: '#065f46', badgeA: '#ecfdf5', badgeB: '#d1fae5', text: '#065f46', kind: 'default' as const }
    })()
    const icon = (() => {
      switch (theme.kind) {
        case 'ai':
          return `<g>
            <circle cx="28" cy="28" r="7" fill="${theme.accent1}"/>
            <circle cx="40" cy="36" r="5" fill="${theme.accent2}"/>
            <circle cx="36" cy="22" r="4" fill="${theme.accent2}"/>
            <path d="M24 44 C24 34, 40 36, 40 26" stroke="${theme.ink}" stroke-width="2" fill="none"/>
          </g>`
        case 'analytics':
          return `<g>
            <rect x="20" y="28" width="6" height="16" rx="2" fill="${theme.accent1}"/>
            <rect x="30" y="22" width="6" height="22" rx="2" fill="${theme.accent2}"/>
            <rect x="40" y="32" width="6" height="12" rx="2" fill="${theme.accent1}"/>
          </g>`
        case 'integration':
          return `<g>
            <path d="M24 30 a6 6 0 1 1 0 12 h-2" stroke="${theme.accent2}" stroke-width="3" fill="none"/>
            <path d="M40 30 a6 6 0 1 0 0 12 h2" stroke="${theme.accent1}" stroke-width="3" fill="none"/>
          </g>`
        default:
          return `<g>
            <path d="M32 20 L46 44 L18 44 Z" fill="${theme.ink}"/>
            <circle cx="32" cy="32" r="5" fill="${theme.accent2}"/>
          </g>`
      }
    })()

    let safeImageHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" width="260" height="180" role="img" aria-label="${escapeHtml(catName)}">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${theme.start}"/>
            <stop offset="100%" stop-color="${theme.end}"/>
          </linearGradient>
          <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0 L0 0 0 14" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
          </pattern>
          <linearGradient id="badge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${theme.badgeA}"/>
            <stop offset="100%" stop-color="${theme.badgeB}"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="260" height="180" fill="url(#bg)"/>
        <rect x="0" y="0" width="260" height="180" fill="url(#grid)"/>
        <g opacity="0.22">
          <circle cx="218" cy="-8" r="60" fill="${theme.accent2}"/>
          <circle cx="-8" cy="158" r="70" fill="${theme.accent1}"/>
        </g>
        <g transform="translate(24,24)">
          <circle cx="32" cy="32" r="28" fill="#ffffff" opacity="0.92"/>
          ${icon}
        </g>
        <g transform="translate(74,24)">
          <rect x="0" y="0" rx="6" ry="6" width="150" height="22" fill="url(#badge)" opacity="0.96"/>
          <text x="8" y="15" font-family="Inter, Arial, sans-serif" font-size="11" fill="${theme.text}">${escapeHtml(catName)} • realcore</text>
        </g>
        <rect x="74" y="54" rx="3" ry="3" width="116" height="10" fill="#ffffff" opacity="0.85"/>
      </svg>
    `
    try {
      const url = service.image || ''
      const isSameOrigin = url && (url.startsWith('/') || new URL(url, window.location.origin).origin === window.location.origin)
      if (url) {
        const src = isSameOrigin ? url : `/api/image-proxy?url=${encodeURIComponent(url)}`
        const cross = isSameOrigin ? '' : 'crossorigin="anonymous"'
        safeImageHtml = `<img src="${src}" ${cross} alt="Cover" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'"/>`
      }
    } catch {}

    container.innerHTML = `
    <div id="onepager-root" style="box-sizing:border-box; width:794px; min-height:1123px; padding:32px; display:flex; flex-direction:column; gap:16px;">
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
        <div style="width:260px; height:180px; border-radius:8px; overflow:hidden; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">${safeImageHtml}</div>
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
          <div style="margin-top:8px; font-size:28px; font-weight:800; color:#065f46;">${formatCurrencyForPDF(service.price, currency)}</div>
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
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth() // 595pt
  const pageHeight = pdf.internal.pageSize.getHeight() // 842pt

  let canvas: HTMLCanvasElement | null = null
  try {
    const fullHeight = rootEl.scrollHeight
    const renderPromise = html2canvas(container as HTMLElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      imageTimeout: 4000,
      logging: false,
      width: 794,
      height: fullHeight,
      windowWidth: 794,
      windowHeight: fullHeight,
    })
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('OnePager: render timeout')), 9000))
    canvas = (await Promise.race([renderPromise as unknown as Promise<HTMLCanvasElement>, timeoutPromise])) as HTMLCanvasElement
  } catch (e) {
    console.error('[OnePager] html2canvas failed', e)
  }

  // Compute page break positions using safe breakpoints
  if (!canvas) {
    document.body.removeChild(container)
    throw new Error('OnePager: html2canvas failed')
  }

  const cssToCanvas = (v: number) => Math.round(v * (canvas!.width / 794))
  // Leave some breathing room to avoid cutting close to footer
  const targetCss = pageHeightCss - 120
  const pageEndsCss: number[] = []
  let startCss = 0
  const margin = 80

  // If a process section exists, force page 1 to end exactly at its top,
  // so that the "Ablauf" block begins at the top of page 2 with no gap.
  const processEl = rootEl.querySelector('[data-op-section="process"]') as HTMLElement | null
  if (processEl) {
    const processTop = processEl.offsetTop - rootEl.offsetTop
    const firstPageEnd = Math.max(0, processTop)
    pageEndsCss.push(firstPageEnd)
    startCss = firstPageEnd
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
  // Always keep the first end (processTop) so page 2 is created, then filter tiny slices.
  const filteredEnds: number[] = []
  {
    let last = 0
    const minSlice = 520 // px in CSS units
    for (let idx = 0; idx < pageEndsCss.length; idx++) {
      const end = pageEndsCss[idx]
      if (idx === 0) {
        filteredEnds.push(end)
        last = end
        continue
      }
      const slice = end - last
      if (slice >= minSlice) {
        filteredEnds.push(end)
        last = end
      } else {
        // try to find an earlier safe offset that makes the previous slice big enough
        let adjusted = last
        for (let i = safeOffsetsCss.length - 1; i >= 0; i--) {
          const off = safeOffsetsCss[i]
          if (off > last + minSlice && off <= end - 20) { adjusted = off; break }
        }
        if (adjusted !== last) {
          filteredEnds.push(adjusted)
          last = adjusted
        }
      }
    }
    // Ensure the last page reaches the full height
    if (last < rootEl.scrollHeight) filteredEnds.push(rootEl.scrollHeight)
  }

  let prevCss = 0
  for (let i = 0; i < filteredEnds.length; i++) {
    const endCss = filteredEnds[i]
    const sliceCss = Math.max(0, endCss - prevCss)
    const slicePx = Math.max(1, cssToCanvas(sliceCss))
    const startPx = cssToCanvas(prevCss)

    const pageCanvas = document.createElement('canvas')
    const pageContext = pageCanvas.getContext('2d')!
    pageCanvas.width = canvas!.width
    pageCanvas.height = slicePx
    pageContext.drawImage(canvas!, 0, startPx, canvas!.width, slicePx, 0, 0, canvas!.width, slicePx)
    const imgData = pageCanvas.toDataURL('image/png')

    const imgWidthPt = pageWidth
    const imgHeightPt = (slicePx / canvas.width) * pageWidth

    if (i === 0) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthPt, imgHeightPt, undefined, 'FAST')
    } else {
      // Add two blank lines at top of subsequent pages (approx 48pt)
      const topPadding = 48
      pdf.addPage('a4', 'portrait')
      pdf.addImage(imgData, 'PNG', 0, topPadding, imgWidthPt, imgHeightPt, undefined, 'FAST')
    }

    prevCss = endCss
  }

  // Clean up
  document.body.removeChild(container)

  const fileName = toFileName(`OnePager_${service.title}.pdf`)
  console.log('[OnePager] success pdf.save', fileName)
  pdf.save(fileName)
  return
} catch (e) {
  console.error('[OnePager] generation error', e)
  throw e
}

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

// New: PDF currency formatting supporting EUR and CHF with locales
function formatCurrencyForPDF(value: number, currency: CurrencyCode): string {
  try {
    if (currency === "CHF") {
      // Use de-CH formatting and append CHF per UI style
      const num = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(value)
      return `${num} CHF`
    }
    // Default EUR with de-DE and trailing Euro sign (to match UI style)
    const num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value)
    return `${num} €`
  } catch {
    const num = (Number(value) || 0).toLocaleString(currency === 'CHF' ? 'de-CH' : 'de-DE')
    return currency === 'CHF' ? `${num} CHF` : `${num} €`
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
