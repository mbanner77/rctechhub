"use client"

import type { Template } from "@/types/template"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Star, Eye } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface TemplateCardProps {
  template: Template
  onViewDetails: (template: Template) => void
  onDownload: (template: Template) => void
}

export function TemplateCard({ template, onViewDetails, onDownload }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="h-full transition-all hover:shadow-md hover:border-primary/50 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={template.imageUrl || "/placeholder.svg"}
          alt={template.title}
          fill
          className={`object-cover transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {template.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl line-clamp-1">{template.title}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-1 mb-2">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="bg-primary/5">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="bg-primary/5">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="h-4 w-4 mr-1 text-amber-500" />
          <span className="mr-3">{template.rating}</span>
          <Download className="h-4 w-4 mr-1" />
          <span>{template.downloads}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(template)}>
          <Eye className="h-4 w-4 mr-2" />
          Details
        </Button>
        <Button variant="default" size="sm" className="flex-1" onClick={() => onDownload(template)}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
