"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, ShoppingCart, Share2, Star, CalendarIcon, Users, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { services } from "@/data/services"
import ProcessView from "@/components/process-view"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { getMailConfig } from "@/lib/mail-config-service"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import parse from 'html-react-parser'
import { de } from "date-fns/locale"
import { analytics } from "@/lib/analytics"
import { parseQuillHTML } from "@/lib/html-parser"

export default function ServiceGrid() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showProcessView, setShowProcessView] = useState(false)
  const [date, setDate] = useState<Date>()
  const [contactEmail, setContactEmail] = useState<string>('techhub@realcore.de')

  useEffect(() => {
    const loadMailConfig = async () => {
      try {
        const mailConfig = await getMailConfig();
        setContactEmail(mailConfig.defaultTarget || 'techhub@realcore.de');
      } catch (error) {
        console.error('Error loading mail config:', error);
      }
    };
    loadMailConfig();
  }, []);

  const toggleServiceSelection = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
      analytics.serviceClick(service?.title || serviceId, `deselect-${service?.category}`)
    } else {
      setSelectedServices([...selectedServices, serviceId])
      analytics.serviceClick(service?.title || serviceId, `select-${service?.category}`)
    }
  }

  const shareService = (service: any) => {
    analytics.serviceClick(service.title, `share-${service.category}`)
    // In einer echten Anwendung würde hier die Share-API verwendet werden
    toast({
      title: "Angebot geteilt",
      description: `Der Link zum Angebot "${service.title}" wurde kopiert.`,
    })
  }

  const scheduleConsultation = (service: any) => {
    if (!date) {
      toast({
        title: "Bitte wählen Sie ein Datum",
        description: "Wählen Sie ein Datum für Ihre Beratung aus.",
        variant: "destructive",
      })
      return
    }

    analytics.serviceClick(service.title, `consultation-${service.category}`)
    toast({
      title: "Beratungstermin geplant",
      description: `Ihr Beratungstermin für "${service.title}" am ${format(date, "dd.MM.yyyy")} wurde angefragt.`,
    })
  }

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = services.find((s) => s.id === id)
    return sum + (service?.price || 0)
  }, 0)

  // Füge Empfehlungen basierend auf ausgewählten Services hinzu
  const getRecommendations = () => {
    if (selectedServices.length === 0) return []

    // Finde Services, die oft mit den ausgewählten Services zusammen gebucht werden
    const recommendedIds = services
      .filter((service) => !selectedServices.includes(service.id))
      .filter((service) => {
        // Prüfe, ob dieser Service von einem ausgewählten Service abhängt
        return selectedServices.some((selectedId) => {
          const selectedService = services.find((s) => s.id === selectedId)
          return selectedService?.dependencies?.includes(service.id)
        })
      })
      .slice(0, 3)
      .map((service) => service.id)

    return recommendedIds
  }

  const recommendedServices = getRecommendations()

  return (
    <div>
      {selectedServices.length > 0 && (
        <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <span className="font-medium">{selectedServices.length} Angebote ausgewählt</span>
            <span className="mx-2">|</span>
            <span className="font-bold">Gesamtpreis: {totalPrice.toLocaleString("de-DE")} €</span>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={() => setSelectedServices([])}>
              Zurücksetzen
            </Button>
            <Button onClick={() => {
              analytics.serviceCompare(selectedServices)
              setShowProcessView(true)
            }} className="bg-green-600 hover:bg-green-700">
              Prozessansicht
            </Button>
          </div>
        </div>
      )}

      {recommendedServices.length > 0 && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-3">Empfohlene Ergänzungen:</h3>
          <div className="flex flex-wrap gap-2">
            {recommendedServices.map((id) => {
              const service = services.find((s) => s.id === id)
              return (
                <Badge
                  key={id}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-100 py-1.5 px-3"
                  onClick={() => toggleServiceSelection(id)}
                >
                  {service?.title} (+{service?.price.toLocaleString("de-DE")} €)
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`overflow-hidden transition-all ${selectedServices.includes(service.id) ? "ring-2 ring-green-500" : ""}`}
          >
            <CardHeader className="p-0">
              <div className="relative h-48">
                <Image src={service.image || "/placeholder.svg"} alt={service.title} fill className="object-cover" />
                {selectedServices.includes(service.id) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <Check size={16} />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {service.rating && (
                    <div className="bg-white bg-opacity-90 text-yellow-500 px-2 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                      {service.rating}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 opacity-70"></div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{service.category}</Badge>
                <span className="font-bold text-lg">{service.price.toLocaleString("de-DE")} €</span>
              </div>
              <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
              <CardDescription className="line-clamp-3">{parseQuillHTML(service.description)}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => analytics.dialogOpen('service-details', service.id)}>Details</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{service.title}</DialogTitle>
                    <DialogDescription>Festpreis: {service.price.toLocaleString("de-DE")} €</DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="included">Leistungsumfang</TabsTrigger>
                      <TabsTrigger value="process">Ablauf</TabsTrigger>
                      <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
                      <TabsTrigger value="booking">Beratung buchen</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="relative h-60 w-full rounded-lg overflow-hidden">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Beschreibung</h3>
                        <p>{service.description}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Technologien</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Dauer</h3>
                        <p>{service.duration}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="included">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Im Festpreis enthalten:</h3>
                        <ul className="space-y-2">
                          {service.included.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <Check size={18} className="text-green-500 mr-2 mt-1 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {service.notIncluded && service.notIncluded.length > 0 && (
                          <>
                            <h3 className="font-medium text-lg mt-6">Nicht enthalten:</h3>
                            <ul className="space-y-2">
                              {service.notIncluded.map((item, index) => (
                                <li key={index} className="flex items-start text-gray-600">
                                  <span className="mr-2">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="process">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Projektablauf:</h3>
                        <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                          {service.process.map((step, index) => (
                            <li key={index} className="ml-6">
                              <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                                {index + 1}
                              </span>
                              <h3 className="font-semibold">{step.title}</h3>
                              <div className="text-gray-600">
                                {parse(step.description)}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-3xl font-bold text-green-600">{service.rating || "4.8"}</div>
                            <div className="flex text-yellow-500 justify-center">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <div className="text-sm text-gray-600 mt-1">12 Bewertungen</div>
                          </div>
                          <div className="flex-1">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">5 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[85%]"></div>
                                </div>
                                <div className="text-sm w-8">85%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">4 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[10%]"></div>
                                </div>
                                <div className="text-sm w-8">10%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">3 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[5%]"></div>
                                </div>
                                <div className="text-sm w-8">5%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">2 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[0%]"></div>
                                </div>
                                <div className="text-sm w-8">0%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">1 Stern</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[0%]"></div>
                                </div>
                                <div className="text-sm w-8">0%</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border-b pb-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">Max Mustermann</div>
                              <div className="text-sm text-gray-500">vor 2 Wochen</div>
                            </div>
                            <div className="flex text-yellow-500 mb-2">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <p className="text-gray-700">
                              Hervorragende Beratung und Umsetzung. Das Team hat unsere Anforderungen perfekt verstanden
                              und eine maßgeschneiderte Lösung geliefert.
                            </p>
                          </div>
                          <div className="border-b pb-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">Anna Schmidt</div>
                              <div className="text-sm text-gray-500">vor 1 Monat</div>
                            </div>
                            <div className="flex text-yellow-500 mb-2">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <p className="text-gray-700">
                              Wir sind sehr zufrieden mit dem Ergebnis. Die Zusammenarbeit war professionell und die
                              Kommunikation transparent.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="booking" className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-lg mb-4">Beratungstermin vereinbaren</h3>
                        <p className="text-gray-600 mb-4">
                          Vereinbaren Sie einen kostenlosen 30-minütigen Beratungstermin mit einem unserer Experten, um
                          mehr über dieses Angebot zu erfahren.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Wählen Sie ein Datum</h4>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP", { locale: de }) : <span>Datum auswählen</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={de} />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Verfügbare Zeiten</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                09:00 - 09:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                10:00 - 10:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                11:00 - 11:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                14:00 - 14:30
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          onClick={() => scheduleConsultation(service)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Beratungstermin vereinbaren
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium text-lg mb-2">Oder kontaktieren Sie uns direkt</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="flex-1">
                            <Phone className="mr-2 h-4 w-4" />
                            +49 123 456789
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Mail className="mr-2 h-4 w-4" />
                            techhub@realcore.de
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between mt-6">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => toggleServiceSelection(service.id)}>
                        {selectedServices.includes(service.id) ? "Abwählen" : "Auswählen"}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => shareService(service)}>Link kopieren</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareService(service)}>Per E-Mail teilen</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Anfragen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleServiceSelection(service.id)}>
                  {selectedServices.includes(service.id) ? "Abwählen" : "Auswählen"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showProcessView && (
        <Dialog open={showProcessView} onOpenChange={setShowProcessView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prozessansicht</DialogTitle>
              <DialogDescription>Optimale Reihenfolge Ihrer ausgewählten Beratungsangebote</DialogDescription>
            </DialogHeader>

            <ProcessView selectedServiceIds={selectedServices} services={services} />

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="font-bold text-lg">Gesamtpreis: {totalPrice.toLocaleString("de-DE")} €</div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "PDF generiert",
                      description: "Das Angebot wurde als PDF heruntergeladen.",
                    })
                  }}
                >
                  Als PDF speichern
                </Button>
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Anfrage senden
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
