"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Preserve hash deep-links for hackathon
      const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : ''
      if (hash === '#hackathon' || hash === '#hackaton') {
        // Force full navigation to avoid potential chunk loading issues
        if (typeof window !== 'undefined') {
          window.location.replace('/home#hackathon')
        } else {
          router.replace('/home#hackathon')
        }
        return
      }
      router.push("/landing")
    }, 50)

    return () => clearTimeout(timeout)
  }, [router])

  return null
}
