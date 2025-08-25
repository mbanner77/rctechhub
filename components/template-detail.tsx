"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, Code, CheckCircle2, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SafeImage } from "@/components/ui/safe-image"
import { normalizeImagePath } from "@/lib/image-utils"

export default function TemplateDetail({ templateData }: { templateData: any }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    setIsDownloading(true)

    // Simuliere Download
    setTimeout(() => {
      setIsDownloading(false)
      toast({
        title: "Download erfolgreich",
        description: `${templateData.title} wurde erfolgreich heruntergeladen.`,
      })
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-1/3 h-64">
          <SafeImage
            src={normalizeImagePath(templateData.image)}
            alt={templateData.title}
            fill
            className="object-cover rounded-lg"
            fallbackText="template"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-normal">
                {templateData.category}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                v{templateData.version}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{templateData.title}</h1>
            <p className="text-gray-600 mt-2">{templateData.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {templateData.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Autor:</span> {templateData.author}
            </div>
            <div>
              <span className="font-semibold">Letzte Aktualisierung:</span> {templateData.lastUpdated}
            </div>
            <div>
              <span className="font-semibold">Downloads:</span> {templateData.downloads}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleDownload} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Wird heruntergeladen..." : "Download"}
            </Button>
            {templateData.previewUrl && (
              <Button variant="outline" onClick={() => window.open(templateData.previewUrl, "_blank")}>
                <Eye className="mr-2 h-4 w-4" />
                Live-Vorschau
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="documentation">Dokumentation</TabsTrigger>
          <TabsTrigger value="code">Code-Beispiele</TabsTrigger>
          <TabsTrigger value="related">Verwandte Templates</TabsTrigger>
        </TabsList>

        {/* Übersicht Tab */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Beschreibung</h2>
            <p className="text-gray-700">{templateData.detailedDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                Features
              </h3>
              <ul className="space-y-2">
                {templateData.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Info className="mr-2 h-5 w-5 text-blue-600" />
                Technische Spezifikationen
              </h3>
              <ul className="space-y-2">
                {templateData.technicalSpecs.map((spec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 h-4 w-4 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Anforderungen</h3>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {templateData.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 h-4 w-4 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dokumentation Tab */}
        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{templateData.documentation}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code-Beispiele Tab */}
        <TabsContent value="code" className="mt-6 space-y-6">
          {templateData.codeSnippets.map((snippet: any, index: number) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Code className="mr-2 h-5 w-5" />
                {snippet.title}
              </h3>
              <Card>
                <CardContent className="p-0">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          ))}
        </TabsContent>

        {/* Verwandte Templates Tab */}
        <TabsContent value="related" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateData.relatedTemplates.map((template: any) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <SafeImage
                    src={normalizeImagePath(template.image)}
                    alt={template.title}
                    fill
                    className="object-cover"
                    fallbackText="template"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">{template.title}</h3>
                  <p className="text-gray-600 text-sm">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
