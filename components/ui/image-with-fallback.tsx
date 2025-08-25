"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined
  fallbackSrc?: string
}

/**
 * Enhanced Image component that handles images properly without showing placeholders behind them
 * when a custom image is uploaded.
 */
export function ImageWithFallback({ 
  src, 
  fallbackSrc = "/placeholder.svg", 
  alt,
  className,
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  
  // Use the fallbackSrc only if there was an error loading the original source
  // or if no source is provided
  const imageSrc = error || !src ? fallbackSrc : src

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt || ""}
      className={className}
      onError={() => setError(true)}
      style={{
        ...props.style,
        // Making sure that when images are present, they fully cover their container 
        // and no background shows through
        objectFit: props.style?.objectFit || "cover",
      }}
    />
  )
}
