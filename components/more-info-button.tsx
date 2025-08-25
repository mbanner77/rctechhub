"use client"

import { ArrowRight } from "lucide-react"

interface MoreInfoButtonProps {
  title: string
  category: string
  onLearnMore: (title: string, category: string) => void
}

export default function MoreInfoButton({ title, category, onLearnMore }: MoreInfoButtonProps) {
  const handleClick = () => {
    if (typeof onLearnMore === "function") {
      onLearnMore(title, category)
    } else {
      console.error("onLearnMore prop is not a function or not provided")
      // Optionally provide a fallback behavior
    }
  }

  return (
    <button className="text-green-600 hover:text-green-700 flex items-center" onClick={handleClick}>
      Mehr erfahren <ArrowRight className="ml-1 h-4 w-4" />
    </button>
  )
}
