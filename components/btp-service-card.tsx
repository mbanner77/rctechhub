import type React from "react"
import Image from "next/image"

interface BTPServiceCardProps {
  service:
    | {
        name: string
        description: string
        imageUrl?: string
      }
    | undefined
}

const fallbackImageUrl = "/placeholder.svg"

const BTPServiceCard: React.FC<BTPServiceCardProps> = ({ service }) => {
  if (!service) {
    return null
  }

  const imageUrl = service.imageUrl

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackImageUrl
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={service.name}
        width={32}
        height={32}
        className="object-contain"
        onError={handleImageError}
      />
      <div>
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="text-gray-600">{service.description}</p>
      </div>
    </div>
  )
}

export default BTPServiceCard
