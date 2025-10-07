"use client"

import type React from "react"

import { useState } from "react"
import { useAllSchulungen } from "@/hooks/use-schulungen"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"
import type { Schulung } from "@/types/schulung"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Euro, Download, Search, ChevronLeft, CheckCircle2, Star, ArrowRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

// We will load live data using useAllSchulungen()

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  company: string
  notes: string
}

interface TrainingCatalogDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function TrainingCatalogDialog({ isOpen, onClose }: TrainingCatalogDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Partial<Schulung> & { dates?: string[] } | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    notes: "",
  })

  const { schulungen, loading, error } = useAllSchulungen()
  const courses: Schulung[] = schulungen || []
  const { config } = useSiteConfig()

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle course selection
  const showCourseDetails = (course: any) => {
    setSelectedCourse(course)
  }

  // Handle course registration
  const startRegistration = () => {
    setIsRegistering(true)
  }

  // Close course details
  const closeCourseDetails = () => {
    setSelectedCourse(null)
    setIsRegistering(false)
    setRegistrationSuccess(false)
  }

  // Complete registration
  const completeRegistration = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    setTimeout(() => {
      setRegistrationSuccess(true)
      setRegistrationData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        notes: "",
      })
    }, 1000)
  }

  // Handle registration data changes
  const handleRegistrationDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRegistrationData((prev: RegistrationData) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle catalog download
  const downloadCatalog = () => {
    console.log("Katalog wird heruntergeladen...")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0 border bg-white">
        {!selectedCourse ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl tracking-tight">Schulungskatalog</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Entdecken Sie unser umfangreiches Angebot an Schulungen und Workshops rund um die SAP Business
                Technology Platform.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-8"
                    placeholder="Nach Schulungen suchen..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2 text-[#2F7D1A] border-[#BEE9B4] hover:bg-[#E9F8E4]" onClick={downloadCatalog}>
                  <Download className="h-4 w-4" />
                  Katalog herunterladen
                </Button>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-4 w-full overflow-x-auto bg-muted/40 rounded-lg p-1">
                  <TabsTrigger value="all">Alle Kurse</TabsTrigger>
                  <TabsTrigger value="grundlagen">Grundlagen</TabsTrigger>
                  <TabsTrigger value="entwicklung">Entwicklung</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCourses.map((course) => (
                      <Card
                        key={course.id}
                        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border ${course.price === 0 ? "border-[#BEE9B4]" : "border-gray-200"}`}
                      >
                        <div className="relative h-44 bg-gray-100">
                          {course.price === 0 && (
                            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#66C63A]/95 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                              <Star className="h-3.5 w-3.5" /> Empfohlen
                            </div>
                          )}
                          <Image
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                        </div>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold tracking-tight leading-snug">{course.title}</h3>
                            <div className="inline-flex items-center rounded-full bg-[#E9F8E4] px-2.5 py-0.5 text-xs font-medium text-[#2B6B16] ring-1 ring-[#BEE9B4]">
                              <Euro className="h-3.5 w-3.5 mr-1" />
                              {course.price === 0 ? "Kostenlos" : formatCurrency(Number(course.price || 0), config.currency)}
                            </div>
                          </div>

                          <div className="flex items-center mb-2">
                            <Badge variant="outline" className="bg-[#E9F8E4] mr-2 border-[#BEE9B4] text-[#2B6B16]">
                              {course.category}
                            </Badge>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                          <div className="grid grid-cols-1 gap-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {course.duration || (course.days ? `${course.days} Tage` : course.hours ? `${course.hours} Stunden` : "Auf Anfrage")}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-5 pb-5 pt-0 flex justify-between">
                          <Button size="sm" variant="outline" className="gap-1 text-[#2F7D1A] border-[#BEE9B4] hover:bg-[#E9F8E4]" onClick={() => showCourseDetails(course)}>
                            Details <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#66C63A] hover:bg-[#58B533] text-white"
                            onClick={() => {
                              showCourseDetails(course as any)
                              startRegistration()
                            }}
                          >
                            Anfragen
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {(!loading && filteredCourses.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Keine Schulungen gefunden. Bitte passen Sie Ihre Suchkriterien an.
                      </p>
                    </div>
                  )}
                  {loading && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Lade Schulungen…</p>
                    </div>
                  )}
                  {error && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Fehler beim Laden der Schulungen.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Other tabs would have similar content */}
                <TabsContent value="grundlagen">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Wählen Sie die Kategorie "Alle Kurse" um alle verfügbaren Kurse zu sehen.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="entwicklung">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Wählen Sie die Kategorie "Alle Kurse" um alle verfügbaren Kurse zu sehen.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="integration">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Wählen Sie die Kategorie "Alle Kurse" um alle verfügbaren Kurse zu sehen.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div>
            {isRegistering ? (
              <div>
                {!registrationSuccess ? (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight mb-6">Anfrage für: {selectedCourse.title}</h2>

                    <form onSubmit={completeRegistration}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="firstName">Vorname *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={registrationData.firstName}
                            onChange={handleRegistrationDataChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nachname *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={registrationData.lastName}
                            onChange={handleRegistrationDataChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={registrationData.email}
                            onChange={handleRegistrationDataChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Unternehmen</Label>
                          <Input
                            id="company"
                            name="company"
                            value={registrationData.company}
                            onChange={handleRegistrationDataChange}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <Label htmlFor="notes">Anmerkungen</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={registrationData.notes}
                          onChange={handleRegistrationDataChange}
                          placeholder="Haben Sie besondere Anfragen oder Anmerkungen?"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-md mb-6 border">
                        <h3 className="font-semibold mb-2">Kursdetails</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">Kurs:</span>
                            <span className="font-medium ml-2">{selectedCourse.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Format:</span>
                            <span className="font-medium ml-2">{selectedCourse.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Dauer:</span>
                            <span className="font-medium ml-2">{selectedCourse.duration || (selectedCourse.days ? `${selectedCourse.days} Tage` : selectedCourse.hours ? `${selectedCourse.hours} Stunden` : "Auf Anfrage")}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Preis:</span>
                            <span className="font-medium ml-2">
                              {selectedCourse.price === 0 ? "Kostenlos" : formatCurrency(Number(selectedCourse.price || 0), config.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" className="text-[#2F7D1A] border-[#BEE9B4] hover:bg-[#E9F8E4]" onClick={closeCourseDetails}>
                          Abbrechen
                        </Button>
                        <Button type="submit" className="bg-[#66C63A] hover:bg-[#58B533] text-white">Anfrage absenden</Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Anfrage erfolgreich!</h2>
                    <p className="text-gray-600 mb-6">
                      Vielen Dank für Ihre Anfrage zum Kurs "{selectedCourse.title}". Wir melden uns zeitnah mit weiteren Details bei Ihnen.
                    </p>
                    <Button onClick={closeCourseDetails}>Zurück zum Schulungskatalog</Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center gap-2 mb-4 sticky top-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-3 px-1 z-10 border-b">
                  <Button variant="ghost" size="sm" onClick={closeCourseDetails} className="inline-flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Zurück zur Übersicht
                  </Button>
                  {!registrationSuccess && (
                    <Button size="sm" className="bg-[#66C63A] hover:bg-[#58B533] text-white" onClick={startRegistration}>
                      Jetzt anfragen
                    </Button>
                  )}
                </div>

                <div className="relative h-72 mb-8 bg-gray-200 overflow-hidden rounded-xl">
                  <Image
                    src={selectedCourse.image || "/placeholder.svg"}
                    alt={selectedCourse.title || "Kursbild"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                      {selectedCourse.category}
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <h2 className="text-3xl font-semibold tracking-tight drop-shadow-sm">{selectedCourse.title}</h2>
                      <div className="inline-flex items-center rounded-full bg-[#66C63A] text-white px-3 py-1 text-sm font-medium shadow">
                        <Euro className="h-4 w-4 mr-1" />
                        {selectedCourse.price === 0 ? "Kostenlos" : formatCurrency(Number(selectedCourse.price || 0), config.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Kursbeschreibung</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                  </div>

                  <div className="md:col-span-2">
                    <Card className="border-gray-200 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Kursdetails</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Dauer:</span>
                            <span className="font-medium">{selectedCourse.duration || (selectedCourse.days ? `${selectedCourse.days} Tage` : selectedCourse.hours ? `${selectedCourse.hours} Stunden` : "Auf Anfrage")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Format:</span>
                            <span className="font-medium">{selectedCourse.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Preis:</span>
                            <span className="font-medium">
                              {selectedCourse.price === 0 ? "Kostenlos" : formatCurrency(Number(selectedCourse.price || 0), config.currency)}
                            </span>
                          </div>
                          {/* Datum-Angaben entfernt */}
                        </div>
                        {/* Datum-Listen entfernt */}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-1 md:row-span-2 md:order-last">
                    <Card className="sticky top-16 border-gray-200 shadow-md">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Preis</span>
                          <span className="text-xl font-semibold">{selectedCourse.price === 0 ? "Kostenlos" : formatCurrency(Number(selectedCourse.price || 0), config.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Dauer</span>
                          <span className="font-medium">{selectedCourse.duration || (selectedCourse.days ? `${selectedCourse.days} Tage` : selectedCourse.hours ? `${selectedCourse.hours} Stunden` : "Auf Anfrage")}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Format</span>
                          <span className="font-medium">{selectedCourse.category}</span>
                        </div>
                        <Button className="w-full" onClick={startRegistration}>Jetzt anfragen</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button size="lg" onClick={startRegistration} className="px-8 bg-[#66C63A] hover:bg-[#58B533] text-white">
                    Jetzt für diesen Kurs anfragen
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
