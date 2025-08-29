import "./globals.css"
import "quill/dist/quill.snow.css";
import "@/styles/rich-text-editor.css";
import { ReactNode, Suspense } from "react";
import type { Metadata } from "next"

import { Providers } from "@/components/providers"
import { GlobalClickTracker } from "@/components/analytics/global-click-tracker"
import { RouteTracker } from "@/components/analytics/route-tracker"
import ClientSideScrollRestorer from '@/components/client-side-scroll-restorer'
import { aeonik } from './fonts'

export const metadata: Metadata = {
  title: "RealCore Tech Hub",
  description: "Ihr Beratungsbaukasten für SAP, Open Source & Microsoft - alles aus einer Hand",
    generator: 'v0.dev'
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
        <RouteTracker />
      </body>
      <Suspense>
        <ClientSideScrollRestorer/>
      </Suspense>
    </html>
  )
}
