"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Download, FileText, List, Clock } from "lucide-react"
import type { BestPractice } from "@/types/landing-page"
import Image from "next/image"

interface BestPracticeDetailDialogProps {
  bestPractice: BestPractice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BestPracticeDetailDialog({ bestPractice, open, onOpenChange }: BestPracticeDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("description")

  if (!bestPractice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{bestPractice.title}</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {bestPractice.shortDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2 mb-6 flex justify-center">
              <TabsList className="w-fit mx-auto">
                <TabsTrigger value="description" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Beschreibung</span>
                </TabsTrigger>
                <TabsTrigger value="benefits" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Vorteile</span>
                </TabsTrigger>
                <TabsTrigger value="implementation" className="flex items-center gap-1 whitespace-nowrap">
                  <List className="h-4 w-4" />
                  <span>Implementierung</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="description" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={bestPractice.imageUrl || "/placeholder.svg?height=200&width=300&query=best practice"}
                      alt={bestPractice.title}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" /> Zeitaufwand
                    </h4>
                    <p>{bestPractice.implementationTime || "Abhängig vom Projektumfang"}</p>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4">Übersicht</h3>
                  <div className="prose max-w-none">
                    {bestPractice.longDescription?.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Vorteile</h3>
              <ul className="space-y-3">
                {bestPractice.benefits?.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Implementierungsschritte</h3>
              <ol className="space-y-4">
                {bestPractice.implementationSteps?.map((step, idx) => (
                  <li key={idx} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Best Practice herunterladen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
