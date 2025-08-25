"use client"

import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined
  fallbackText?: string
  fallbackClassName?: string
}

export function SafeImage({ src, alt, fallbackText, fallbackClassName, className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    setImgSrc(src)
    setError(false)
  }, [src])

  const handleError = () => {
    setError(true)
    // Fallback zu einem Platzhalter
    if (props.width && props.height) {
      setImgSrc(`/placeholder.svg?height=${props.height}&width=${props.width}&query=${alt}`)
    } else {
      setImgSrc("/abstract-colorful-swirls.png")
    }
  }

  if (!imgSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${fallbackClassName || className}`}
        style={{ width: props.width, height: props.height }}
      >
        {fallbackText || alt || "Bild nicht verfügbar"}
      </div>
    )
  }

  return (
    <Image src={imgSrc || "/placeholder.svg"} alt={alt || ""} className={className} onError={handleError} {...props} />
  )
}
