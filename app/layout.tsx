import "./globals.css"
import "quill/dist/quill.snow.css";
import "@/styles/rich-text-editor.css";
import { ReactNode, Suspense } from "react";
import type { Metadata } from "next"

import { Providers } from "@/components/providers"
import { GlobalClickTracker } from "@/components/analytics/global-click-tracker"
import { RouteTracker } from "@/components/analytics/route-tracker"
import { EngagementTracker } from "@/components/analytics/engagement-tracker"
import { WebVitalsTracker } from "@/components/analytics/web-vitals-tracker"
import { FormTracker } from "@/components/analytics/form-tracker"
import ClientSideScrollRestorer from '@/components/client-side-scroll-restorer'
import { aeonik } from './fonts'

export const metadata: Metadata = {
  title: "RealCore Tech Hub",
  description: "Ihr Beratungsbaukasten für SAP, Open Source & Microsoft - alles aus einer Hand",
    generator: 'v0.dev',
    // Use the public site URL if available for absolute OG/Twitter URLs
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "RealCore Tech Hub",
      description: "Ihr Beratungsbaukasten für SAP, Open Source & Microsoft - alles aus einer Hand",
      url: '/',
      siteName: "RealCore Tech Hub",
      images: [
        {
          url: "/images/share-preview.png",
          width: 3090,
          height: 2256,
          alt: "RealCore Tech Hub Vorschau"
        }
      ],
      locale: 'de_DE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "RealCore Tech Hub",
      description: "Ihr Beratungsbaukasten für SAP, Open Source & Microsoft - alles aus einer Hand",
      images: ["/images/share-preview.png"],
      creator: '@realcoregroup'
    },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Diese Pfade werden im Debug-Modus überprüft
  return (
    <html lang="de" className={aeonik.variable}>
      <body className={aeonik.className}>
        <Providers>
          {children}
        </Providers>
        <GlobalClickTracker />
        <Suspense fallback={null}>
          <RouteTracker />
        </Suspense>
        <Suspense fallback={null}>
          <EngagementTracker />
        </Suspense>
        <Suspense fallback={null}>
          <WebVitalsTracker />
        </Suspense>
        <Suspense fallback={null}>
          <FormTracker />
        </Suspense>
      </body>
      <Suspense>
        <ClientSideScrollRestorer/>
      </Suspense>
    </html>
  )
}

