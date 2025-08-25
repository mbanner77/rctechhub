import type { TemplateCategory } from "@/types/template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface TemplateCategoryCardProps {
  category: TemplateCategory
}

export function TemplateCategoryCard({ category }: TemplateCategoryCardProps) {
  return (
    <Link href={`/templates?category=${category.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{category.name}</CardTitle>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary/10">
              {category.count} Templates
            </Badge>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
