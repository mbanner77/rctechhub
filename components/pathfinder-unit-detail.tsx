import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Mail, Users, Calendar, FileText, CheckCircle2, AlertCircle, Lightbulb, Layers, BookOpen, Briefcase, ExternalLink, LayoutGrid, MapPin, Clock, Share2, GraduationCap, Award, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analytics } from "@/lib/analytics"

interface PathfinderUnit {
  id: string
  title: string
  shortDescription?: string
  description: string
  slogan?: string
  quote?: string
  color: string
  image: string
  heroImage?: string
  backgroundPattern?: string
  gradient: string
  buttonClass: string
  technologies: string[]
  icon: string
  iconImage?: string
  benefits: Array<{
    title: string
    description: string
    outcome?: string | null
    colorClass: string
  }>
  challenges: Array<{
    title: string
    description: string
  }>
  workshops: any[]
  steps: any[]
  expertiseAreas: Array<{
    name: string
    description: string
    colorClass: string
  }>
  keyTechnologies: Array<{
    name: string
    category: string
    icon: string
    bgClass: string
  }>
  category?: string
  caseStudies?: any[]
}

interface PathfinderUnitDetailProps {
  unit: PathfinderUnit
  prevUnit?: PathfinderUnit | null
  nextUnit?: PathfinderUnit | null
  onNavigate: (direction: 'prev' | 'next') => void
  onUnitSelect: (unitId: string) => void
  allUnits?: PathfinderUnit[]
}

export default function PathfinderUnitDetail({
  unit,
  prevUnit,
  nextUnit,
  onNavigate,
  onUnitSelect,
  allUnits = []
}: PathfinderUnitDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => onNavigate('prev')}
          disabled={!prevUnit}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {prevUnit ? `Zurück zu ${prevUnit.title}` : 'Vorherige Unit'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onNavigate('next')}
          disabled={!nextUnit}
          className="flex items-center gap-2"
        >
          {nextUnit ? `Weiter zu ${nextUnit.title}` : 'Nächste Unit'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 mb-8 flex justify-center">
            <TabsList className="w-fit mx-auto">
              <TabsTrigger value="overview" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Übersicht</TabsTrigger>
              <TabsTrigger value="approach" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Vorgehen</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-12">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Unit Übersicht</h2>
              <p className="text-gray-600">{unit.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="approach" className="space-y-12">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Vorgehen und Methodologie</h2>
              <p className="text-gray-600">Detaillierte Methodologie wird in Kürze verfügbar sein.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Bereit für den nächsten Schritt?</h2>
          <p className="text-gray-600">Lassen Sie uns gemeinsam Ihre {unit.title} Herausforderungen angehen.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className={`bg-gradient-to-r ${unit.gradient} text-white hover:opacity-90`}
            onClick={() => analytics.serviceClick('contact-consultation', `pathfinder-cta-${unit.id}`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Kostenlose Beratung
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => analytics.serviceClick('whitepaper-download', `pathfinder-cta-${unit.id}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Whitepaper herunterladen
          </Button>
        </div>
      </div>
    </div>
  )
}
