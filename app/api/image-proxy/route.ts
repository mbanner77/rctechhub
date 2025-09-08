import { NextRequest, NextResponse } from 'next/server'

// Simple same-origin image proxy for html2canvas
// Usage: /api/image-proxy?url=<remoteImageUrl>
// Notes:
// - Restricts to http/https protocols
// - Forwards content-type and cache headers
// - Adds CORS headers for client-side usage (though html2canvas benefits from same-origin)
// - Do not proxy local/private addresses

function isValidRemoteUrl(u: string) {
  try {
    const url = new URL(u)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    // Basic blocklist for private networks
    const host = url.hostname
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local') ||
      host === '0.0.0.0'
    ) return false
    return true
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('url') || ''
  if (!src || !isValidRemoteUrl(src)) {
    return NextResponse.json({ error: 'Invalid or missing url' }, { status: 400 })
  }

  try {
    const upstream = await fetch(src, {
      // Avoid caching issues upstream but allow CDN caching on our side
      headers: {
        'User-Agent': 'realcore-techhub-image-proxy/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      // Next.js fetch on server; no need for mode: 'no-cors'
      // Revalidate upstream every 24h at most
      cache: 'no-store',
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    const res = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Allow reuse in browser for a while; adjust as needed
        'Cache-Control': 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=86400',
        // Helpful CORS headers (though same-origin is used by our html)
        'Access-Control-Allow-Origin': '*',
      },
    })
    return res
  } catch (e) {
    console.error('[image-proxy] error', e)
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
