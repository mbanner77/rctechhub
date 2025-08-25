"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/landing")
    }, 50)

    return () => clearTimeout(timeout)
  }, [router])

  return null
}
