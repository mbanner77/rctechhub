"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ArrowRight, Code, Database, Network, Cpu, Smartphone, Layers, Shield } from "lucide-react"
import Image from "next/image"
import BTPArchitectureTemplateDetail from "./btp-architecture-template-detail"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import BTPServiceDetailDialog from "./btp-service-detail-dialog"
import { btpServices } from "@/data/btp-services"
import { architectureTemplates } from "@/data/architecture-templates"

export default function BTPArchitectureTemplates() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const categories = Array.from(new Set(architectureTemplates.map((template) => template.category))).sort()

  const filteredTemplates = architectureTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const selectedServiceData = selectedService ? btpServices.find((s) => s.id === selectedService) : null

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Application Development":
        return <Code className="h-5 w-5 text-purple-600" />
      case "Integration":
        return <Network className="h-5 w-5 text-green-600" />
      case "Data & Analytics":
        return <Database className="h-5 w-5 text-blue-600" />
      case "DevOps":
        return <Cpu className="h-5 w-5 text-orange-600" />
      case "Mobile":
        return <Smartphone className="h-5 w-5 text-pink-600" />
      case "Intelligent Technologies":
        return <Layers className="h-5 w-5 text-indigo-600" />
      case "Security":
        return <Shield className="h-5 w-5 text-red-600" />
      case "User Experience":
        return <Layers className="h-5 w-5 text-yellow-600" />
      default:
        return <Code className="h-5 w-5 text-gray-600" />
    }
  }

  if (selectedTemplate) {
    return (
      <BTPArchitectureTemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onSelectService={(serviceId) => setSelectedService(serviceId)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Architekturvorlagen</h2>
        <p className="text-gray-600">
          Entdecken Sie vorgefertigte Architekturvorlagen für verschiedene Anwendungsfälle mit SAP BTP Services.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Architekturvorlagen durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Alle Kategorien" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="relative h-40 bg-gray-100">
              <Image
                src={template.diagram || `/placeholder.svg?height=200&width=400&query=architecture diagram`}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCategoryIcon(template.category)}
                  <span>{template.category}</span>
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
                {template.services.length > 3 && <Badge variant="secondary">+{template.services.length - 3}</Badge>}
              </div>
              <Button variant="default" className="w-full flex justify-between items-center">
                Details anzeigen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Architekturvorlagen gefunden.</p>
        </div>
      )}

      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedServiceData && (
            <BTPServiceDetailDialog
              service={selectedServiceData}
              onClose={() => setSelectedService(null)}
              isOpen={!!selectedService}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
