'use client'

import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider"
import { DebugImagePaths } from "@/components/debug-image-paths"
import { Toaster } from "@/components/ui/toaster"

const debugImagePaths = [
  "/images/realcore-logo.png",
  "/images/btp-assessment.png",
  "/images/cap-implementation.png",
  "/images/integration-suite.png",
  "/images/fiori-development.png",
  "/images/btp-security.png",
]
 
export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ThemeProvider attribute="class" enableSystem>
        {children}
        {process.env.NODE_ENV === "development" && <DebugImagePaths paths={debugImagePaths} />}
      </ThemeProvider>
      <Toaster />
    </>
  )
}