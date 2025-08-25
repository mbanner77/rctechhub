"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Download, FileText, Code, Clock, Tag, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Template {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  tags: string[]
  downloadUrl: string
  complexity: "Einfach" | "Mittel" | "Komplex"
  timeToImplement: string
  targetAudience: string[]
  features: string[]
  technicalDetails: {
    technologies: string[]
    prerequisites: string[]
    setupInstructions: string
  }
  codeSnippet?: string
}

interface TemplateDetailDialogProps {
  template: Template
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDetailDialog({ template, open, onOpenChange }: TemplateDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl font-bold">{template.title}</DialogTitle>
            <Badge variant="outline" className="ml-2">
              {template.category}
            </Badge>
          </div>
          <DialogDescription className="text-lg text-muted-foreground">{template.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2 mb-6">
              <TabsList className="w-fit flex">
                <TabsTrigger value="overview" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                  <FileText className="h-4 w-4" />
                  <span>Übersicht</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                  <Code className="h-4 w-4" />
                  <span>Tech. Details</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                <CheckCircle className="h-4 w-4" />
                <span>Features</span>
              </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={template.imageUrl || "/placeholder.svg"}
                    alt={template.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" /> Implementierungszeit
                      </h4>
                      <p>{template.timeToImplement}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4" /> Komplexität
                      </h4>
                      <p>{template.complexity}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" /> Zielgruppe
                      </h4>
                      <ul className="list-disc list-inside">
                        {template.targetAudience.map((audience, idx) => (
                          <li key={idx}>{audience}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Beschreibung</h3>
                  <p className="mb-6">{template.description}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Technologien</h3>
                  <ul className="space-y-2">
                    {template.technicalDetails.technologies.map((tech, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Voraussetzungen</h3>
                  <ul className="space-y-2">
                    {template.technicalDetails.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Setup-Anleitung</h3>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
                  {template.technicalDetails.setupInstructions}
                </div>
              </div>

              {template.codeSnippet && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Code-Beispiel</h3>
                  <pre className="p-4 bg-black text-white rounded-lg overflow-x-auto">
                    <code>{template.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <ul className="space-y-3">
                {template.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Template herunterladen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
