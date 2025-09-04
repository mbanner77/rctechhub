"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileText, Search, Euro, Clock, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { defaultKnowledgeHubContent } from "@/data/default-data";
import { db, sanitizeKnowledgeHubContent } from "@/lib/db";
import { getClientKnowledgeHubContent } from "@/lib/client-data-service";
import { mockSchulungen } from "@/app/api/shared/mock-data/schulungen";
import { analytics } from "@/lib/analytics"
import { useDownloadCounter } from "@/hooks/useDownloadCounter"
import { fetchDownloadCounts, updateContentWithDownloadCounts } from "@/lib/download-helpers"
import { MinimalContactDialog } from "./minimal-contact-dialog"

type ContentItemProps = {
  item: any,
  onDownload: (item: any) => void
  onPreview: (item: any) => void
  onContact: (item: any) => void
}

const ContentItem = ({ item, onDownload, onPreview, onContact }: ContentItemProps) => {
  // Track if download is in progress
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload(item);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={item.image || `/placeholder.svg?height=200&width=400&query=${item.type}`}
          alt={item.title}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(item.tags || []).slice(0, 3).map((tag: string) => (
            <Link key={tag} href={`/home?tag=${encodeURIComponent(tag)}#hackathon`}>
              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          {item.downloads || 0} Downloads
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onPreview(item)}>
          <Eye className="mr-2 h-4 w-4" />
          {item.type === "template" ? "Details" : "Lesen"}
        </Button>
        {item.pdfDocument ? (
          <Button
            size="sm"
            variant="default"
            onClick={() => onContact(item)}
          >
            Anfragen
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={() => onContact(item)}
          >
            Anfragen
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function KnowledgeHubGallery() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Initialize activeTab from URL on first render to avoid initial flash of default tab
  const initialTab = (() => {
    const tab = (searchParams?.get('tab') || '').toLowerCase()
    return (tab === 'templates' || tab === 'best-practices' || tab === 'schulungen') ? tab : 'templates'
  })()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactItem, setContactItem] = useState<any | null>(null)
  const [allTemplates, setAllTemplates] = useState<any[]>([])  // Store all templates
  const [allBestPractices, setAllBestPractices] = useState<any[]>([])  // Store all best practices
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([])
  const [filteredBestPractices, setFilteredBestPractices] = useState<any[]>([])
  const [allSchulungen, setAllSchulungen] = useState<any[]>([])  // Store all trainings
  const [filteredSchulungen, setFilteredSchulungen] = useState<any[]>([])  // Store filtered trainings for display
  const { incrementDownloadCount } = useDownloadCounter()

  const populateInitialContent = async (content: any[]) => {
    // Get the latest download counts from the API
    try {
      const downloadCounts = await fetchDownloadCounts();
      console.log("[KNOWLEDGE-HUB-GALLERY] Download counts fetched:", downloadCounts);

      // Update content with latest download counts
      content = updateContentWithDownloadCounts(content, downloadCounts);
    } catch (error) {
      console.error("[KNOWLEDGE-HUB-GALLERY] Error fetching download counts:", error);
    }

    const initialTemplates = content.filter((contentItem) => contentItem.type === "template")
    const initialBestPractices = content.filter((contentItem) => contentItem.type === "best-practice")
    
    console.log("[KNOWLEDGE-HUB-GALLERY] Filtered templates:", initialTemplates.length, initialTemplates);
    console.log("[KNOWLEDGE-HUB-GALLERY] Filtered best practices:", initialBestPractices.length, initialBestPractices);
    
    // Store all templates and best practices for search filtering
    setAllTemplates(initialTemplates)
    setAllBestPractices(initialBestPractices)
    setFilteredTemplates(initialTemplates)
    setFilteredBestPractices(initialBestPractices)

    // Apply search filtering if there's a search term
    if (searchTerm !== "") {
      // Since this runs asynchronously, we need to manually apply the search
      const filteredTemplates = initialTemplates.filter(
        (template) =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredTemplates(filteredTemplates)

      const filteredBestPractices = initialBestPractices.filter(
        (bp) =>
          bp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bp.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredBestPractices(filteredBestPractices)
    }
  }

  useEffect(() => {
    // Keep activeTab in sync with URL (works on first load and client-side nav)
    const tab = (searchParams?.get('tab') || '').toLowerCase()
    if (tab === 'templates' || tab === 'best-practices' || tab === 'schulungen') {
      setActiveTab(tab)
    } else {
      // If no or invalid tab param, ensure state stays at default
      // do not push URL change here to avoid unexpected history entries
    }

    const loadKnowledgeHubContent = async () => {
      setIsLoading(true);
      try {
        console.log("[KNOWLEDGE-HUB-GALLERY] Loading Knowledge Hub content...");

        // Load trainings from API or fallback to mock data
        try {
          console.log("[KNOWLEDGE-HUB-GALLERY] Loading trainings from API...");
          const response = await fetch('/api/schulungen');
          if (response.ok) {
            const data = await response.json();
            // Check if we received actual data
            if (Array.isArray(data) && data.length > 0) {
              console.log("[KNOWLEDGE-HUB-GALLERY] Trainings loaded from API:", data.length, data);
              setAllSchulungen(data);
              setFilteredSchulungen(data);
            } else {
              console.log("[KNOWLEDGE-HUB-GALLERY] API returned empty trainings array, using mock data");
              setAllSchulungen(mockSchulungen);
              setFilteredSchulungen(mockSchulungen);
            }
          } else {
            console.log("[KNOWLEDGE-HUB-GALLERY] Error loading trainings from API, using mock data");
            setAllSchulungen(mockSchulungen);
            setFilteredSchulungen(mockSchulungen);
          }
        } catch (error) {
          console.log("[KNOWLEDGE-HUB-GALLERY] Error fetching trainings:", error);
          setAllSchulungen(mockSchulungen);
          setFilteredSchulungen(mockSchulungen);
        }

        // Versuche zuerst, die Daten vom Server zu laden
        try {
          const serverKnowledgeHubContent = await getClientKnowledgeHubContent();
          console.log(
            "[KNOWLEDGE-HUB-GALLERY] Knowledge Hub Inhalte vom Server geladen:",
            serverKnowledgeHubContent.length
          );
          console.log("serverKnowledgeHubContent", serverKnowledgeHubContent)
          
          if (Array.isArray(serverKnowledgeHubContent) && serverKnowledgeHubContent.length > 0) {
            populateInitialContent(serverKnowledgeHubContent);
            return; // Server-Daten erfolgreich geladen, beende hier
          }
        } catch (serverError) {
          console.error(
            "[KNOWLEDGE-HUB-GALLERY] Fehler beim Laden vom Server, versuche lokale Datenbank:",
            serverError
          );
        }

        // Wenn Server-Laden fehlschlägt, versuche lokale Datenbank
        const dbKnowledgeHubContent = await db.knowledgeHubContent.toArray();

        if (Array.isArray(dbKnowledgeHubContent) && dbKnowledgeHubContent.length > 0) {
          console.log(
            "[KNOWLEDGE-HUB-GALLERY] Knowledge Hub Inhalte aus der lokalen Datenbank geladen:",
            dbKnowledgeHubContent.length
          );
          populateInitialContent(dbKnowledgeHubContent);
        } else {
          console.log(
            "[KNOWLEDGE-HUB-GALLERY] Keine Knowledge Hub Inhalte in der Datenbank gefunden, verwende Standarddaten"
          );
          const sanitizedKnowledgeHubContent = defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent);
          populateInitialContent(sanitizedKnowledgeHubContent);

          // Initialisiere die Datenbank mit Standarddaten
          try {
            await db.knowledgeHubContent.clear();
            await db.knowledgeHubContent.bulkPut(sanitizedKnowledgeHubContent);
            console.log("[KNOWLEDGE-HUB-GALLERY] Datenbank mit Standarddaten initialisiert");
          } catch (dbError) {
            console.error(
              "[KNOWLEDGE-HUB-GALLERY] Fehler beim Initialisieren der Datenbank:",
              dbError
            );
          }
        }
      } catch (err) {
        console.error("[KNOWLEDGE-HUB-GALLERY] Fehler beim Laden der Knowledge Hub Inhalte:", err);
        populateInitialContent(defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent));
      } finally {
        setIsLoading(false);
      }
    };

    loadKnowledgeHubContent();
  }, [searchParams]);

  useEffect(() => {
    // Debug log for filtered trainings whenever they change
    console.log("[KNOWLEDGE-HUB-GALLERY] Filtered trainings changed:", filteredSchulungen.length, filteredSchulungen);
  }, [filteredSchulungen]);

  useEffect(() => {
    // Debug log for all trainings whenever they change
    console.log("[KNOWLEDGE-HUB-GALLERY] All trainings changed:", allSchulungen.length, allSchulungen);
  }, [allSchulungen]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)

    // Filter from the original complete arrays, not the already filtered ones
    const newFilteredTemplates = allTemplates.filter(
      (template) =>
        template.title.toLowerCase().includes(term.toLowerCase()) ||
        template.description.toLowerCase().includes(term.toLowerCase()) ||
        template.tags?.some((tag: string) => tag.toLowerCase().includes(term.toLowerCase())),
    )
    setFilteredTemplates(newFilteredTemplates)

    const newFilteredBestPractices = allBestPractices.filter(
      (bp) =>
        bp.title.toLowerCase().includes(term.toLowerCase()) ||
        bp.description.toLowerCase().includes(term.toLowerCase()) ||
        bp.tags?.some((tag: string) => tag.toLowerCase().includes(term.toLowerCase())),
    )
    setFilteredBestPractices(newFilteredBestPractices)

    // Also filter trainings
    const newFilteredSchulungen = allSchulungen.filter(
      (schulung: any) =>
        schulung.title.toLowerCase().includes(term.toLowerCase()) ||
        schulung.category.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredSchulungen(newFilteredSchulungen)
  }

  // Handle preview
  const handlePreview = (item: any) => {
    analytics.serviceClick(item.title, `preview-${item.type || 'content'}`)
    setSelectedItem(item)
    setIsPreviewOpen(true)
  }

  // Handle contact
  const handleContact = (item: any) => {
    analytics.serviceClick(item.title, `contact-${item.type || 'content'}`)
    setContactItem(item)
    setIsContactDialogOpen(true)
  }

  // Handle download
  const handleDownload = async (item: any) => {
    if (item.pdfDocument) {
      const response: any = await fetch(item.pdfDocument?.fileUrl, { method: "GET", cache: "no-store" });
      if (response.ok) {
        const blob = await response.blob();
        blob.arrayBuffer().then((buffer: any) => {
          const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = item.pdfDocument?.fileName || "download.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }
    }
    console.log("[KNOWLEDGE-HUB-GALLERY] Downloading item:", item.title, item.pdfDocument?.fileUrl)
    analytics.templateDownload(item.title)

    // Increment download count using our new API
    try {
      const newCount = await incrementDownloadCount(item.id);
      if (newCount !== null) {
        // Update the item's download count in our state - both in all arrays and filtered arrays
        if (item.type === "template") {
          setAllTemplates(prevTemplates =>
            prevTemplates.map(template =>
              template.id === item.id ? { ...template, downloads: newCount } : template
            )
          );
          setFilteredTemplates(prevTemplates =>
            prevTemplates.map(template =>
              template.id === item.id ? { ...template, downloads: newCount } : template
            )
          );
        } else if (item.type === "best-practice") {
          setAllBestPractices(prevBestPractices =>
            prevBestPractices.map(bp =>
              bp.id === item.id ? { ...bp, downloads: newCount } : bp
            )
          );
          setFilteredBestPractices(prevBestPractices =>
            prevBestPractices.map(bp =>
              bp.id === item.id ? { ...bp, downloads: newCount } : bp
            )
          );
        }

        // Update the selected item if it's currently being viewed
        if (selectedItem && selectedItem.id === item.id) {
          setSelectedItem({ ...selectedItem, downloads: newCount });
        }
      }
    } catch (error) {
      console.error("[KNOWLEDGE-HUB-GALLERY] Error incrementing download count:", error);
    }

    // Create a temporary link element to trigger the download if URL is provided
    if (item.downloadUrl) {
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.setAttribute('download', item.title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Download gestartet",
      description: `${item.title} wird heruntergeladen...`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Suchen..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="templates"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          // Update the URL's tab param, keep hash to ensure section stays in view
          try {
            const current = new URL(window.location.href)
            current.searchParams.set('tab', value)
            // Preserve hash (e.g., #templates) and avoid scrolling
            router.replace(`${current.pathname}?${current.searchParams.toString()}${current.hash}`, { scroll: false })
          } catch (e) {
            // noop
          }
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="schulungen">Schulungen</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <ContentItem key={template.id} item={template} onDownload={handleDownload} onPreview={handlePreview} onContact={handleContact} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Keine Templates gefunden, die Ihren Filterkriterien entsprechen.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBestPractices.length > 0 ? (
              filteredBestPractices.map((bp) => (
                <ContentItem key={bp.id} item={bp} onDownload={handleDownload} onPreview={handlePreview} onContact={handleContact} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Keine Best Practices gefunden, die Ihren Filterkriterien entsprechen.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Schulungen Tab */}
        <TabsContent value="schulungen" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Verfügbare Schulungen: {filteredSchulungen.length}</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-[#2F7D1A] border-[#BEE9B4] hover:bg-[#E9F8E4]"
              onClick={() => {
                // Force refresh schulungen from API
                fetch('/api/schulungen')
                  .then(res => res.json())
                  .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                      console.log("[KNOWLEDGE-HUB-GALLERY] Refreshed trainings:", data.length, data);
                      setAllSchulungen(data);
                      setFilteredSchulungen(data);
                      toast({
                        title: "Schulungen aktualisiert",
                        description: `${data.length} Schulungen geladen`
                      });
                    } else {
                      console.log("[KNOWLEDGE-HUB-GALLERY] No trainings found on refresh");
                      toast({
                        title: "Keine Schulungen gefunden",
                        description: "Es konnten keine Schulungen geladen werden."
                      });
                    }
                  })
                  .catch(err => {
                    console.error("[KNOWLEDGE-HUB-GALLERY] Error refreshing trainings:", err);
                    toast({
                      title: "Fehler beim Laden",
                      description: "Schulungen konnten nicht aktualisiert werden."
                    });
                  });
              }}
            >
              Aktualisieren
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchulungen.length > 0 ? (
              filteredSchulungen.map((schulung: any) => (
                <Card key={schulung.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-[#BEE9B4]">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="rounded-full bg-[#E9F8E4] p-3 mr-3">
                        <FileText className="h-6 w-6 text-[#2B6B16]" />
                      </div>
                      <h3 className="text-lg font-bold">{schulung.title}</h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Kategorie:</span>
                        <Badge variant="outline" className="bg-[#E9F8E4] border-[#BEE9B4] text-[#2B6B16]">{schulung.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Dauer:</span>
                        <span>
                          {typeof schulung.days === 'number' && schulung.days > 0
                            ? `${schulung.days} ${schulung.days === 1 ? 'Tag' : 'Tage'}`
                            : (typeof schulung.hours === 'number' && schulung.hours > 0
                                ? `${Math.max(1, Math.ceil(schulung.hours / 8))} ${Math.max(1, Math.ceil(schulung.hours / 8)) === 1 ? 'Tag' : 'Tage'}`
                                : (schulung.duration || ''))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Preis:</span>
                        <span className="font-bold inline-flex items-center rounded-full bg-[#E9F8E4] px-2 py-0.5 text-xs text-[#2B6B16] ring-1 ring-[#BEE9B4]">{schulung.price > 0 ? `${schulung.price} €` : "Kostenlos"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#2F7D1A] border-[#BEE9B4] hover:bg-[#E9F8E4]"
                      onClick={() =>
                        handlePreview({
                          title: schulung.title,
                          description: schulung.description || `${schulung.title} - ${schulung.category}`,
                          type: 'schulung',
                          category: schulung.category,
                          price: schulung.price,
                          days: schulung.days,
                          hours: schulung.hours,
                          duration: schulung.duration,
                          scope: schulung.scope,
                          procedure: schulung.procedure,
                          tags: [
                            schulung.category,
                            `Dauer: ${typeof schulung.days === 'number' && schulung.days > 0
                              ? `${schulung.days} ${schulung.days === 1 ? 'Tag' : 'Tage'}`
                              : (typeof schulung.hours === 'number' && schulung.hours > 0
                                  ? `${Math.max(1, Math.ceil(schulung.hours / 8))} ${Math.max(1, Math.ceil(schulung.hours / 8)) === 1 ? 'Tag' : 'Tage'}`
                                  : (schulung.duration || ''))}`,
                            schulung.price > 0 ? 'Kostenpflichtig' : 'Kostenlos',
                          ],
                          image: schulung.image,
                          pdfDocument: schulung.pdfDocument,
                        })
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#66C63A] hover:bg-[#58B533] text-white"
                      onClick={() => handleContact(schulung)}
                    >
                      Anfragen
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Keine Schulungen gefunden, die Ihren Filterkriterien entsprechen.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="md:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl p-0 border shadow-2xl">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">{selectedItem.title}</DialogTitle>
                  {selectedItem.type !== 'schulung' && (
                    <DialogDescription className="text-muted-foreground">{selectedItem.description}</DialogDescription>
                  )}
                </div>
                {selectedItem.type === 'schulung' && (
                  <Button size="sm" className="shrink-0" onClick={() => handleContact(selectedItem)}>
                    Anfragen
                  </Button>
                )}
              </div>
            </div>

            {/* Hero for Schulungen */}
            {selectedItem.type === 'schulung' && selectedItem.image && (
              <div className="relative h-64 md:h-72 bg-gray-100 overflow-hidden rounded-none">
                <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white flex flex-wrap items-end justify-between gap-3">
                  <div className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                    {selectedItem.category}
                  </div>
                  <div className="inline-flex items-center rounded-full bg-[#66C63A] px-3 py-1 text-sm font-medium text-white shadow">
                    <Euro className="h-4 w-4 mr-1" />
                    {typeof selectedItem.price === 'number' && selectedItem.price > 0
                      ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedItem.price)
                      : 'Kostenlos'}
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 space-y-6">
              {/* Tags or Kurzinfo */}
              <div>
                <h3 className="text-base font-semibold mb-2">{selectedItem.type === 'schulung' ? 'Kursinformationen' : 'Tags'}</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedItem.tags || []).map((tag: string) => (
                    <Link key={tag} href={`/home?tag=${encodeURIComponent(tag)}#hackathon`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Beschreibung */}
              <div>
                <h3 className="text-base font-semibold mb-2">Beschreibung</h3>
                {selectedItem.type === 'schulung' ? (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.description || '' }} />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                )}
              </div>

              {/* Details for Schulungen */}
              {selectedItem.type === 'schulung' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    {/* Umfang */}
                    {selectedItem.scope && (
                      <div className="pt-4 border rounded-md p-4">
                        <h3 className="text-base font-semibold mb-2">Leistungsumfang</h3>
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.scope }} />
                      </div>
                    )}
                    {/* Ablauf */}
                    {selectedItem.procedure && (
                      <div className="pt-4 border rounded-md p-4">
                        <h3 className="text-base font-semibold mb-2">Ablauf</h3>
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.procedure }} />
                      </div>
                    )}
                  </div>
                  {/* Sticky Summary Card */}
                  <div className="md:col-span-1">
                    <div className="sticky top-16 border rounded-lg p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Preis</span>
                        <span className="font-semibold">
                          {typeof selectedItem.price === 'number' && selectedItem.price > 0
                            ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedItem.price)
                            : 'Kostenlos'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 inline-flex items-center"><Clock className="h-4 w-4 mr-1" />Dauer</span>
                        <span className="font-medium">
                          {typeof selectedItem.days === 'number' && selectedItem.days > 0
                            ? `${selectedItem.days} ${selectedItem.days === 1 ? 'Tag' : 'Tage'}`
                            : (typeof selectedItem.hours === 'number' && selectedItem.hours > 0
                                ? `${Math.max(1, Math.ceil(selectedItem.hours / 8))} ${Math.max(1, Math.ceil(selectedItem.hours / 8)) === 1 ? 'Tag' : 'Tage'}`
                                : (selectedItem.duration || ''))}
                        </span>
                      </div>
                      <Button className="w-full mt-2 bg-[#66C63A] hover:bg-[#58B533] text-white" onClick={() => handleContact(selectedItem)}>Anfragen</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Downloads/CTA Row */}
              <div className={((selectedItem.pdfDocument?.fileUrl && selectedItem.pdfDocument.fileUrl.trim()) || (selectedItem.downloadUrl && selectedItem.downloadUrl.trim())) ? "" : "hidden"}>
                <div className="flex justify-between items-center gap-4 pt-2">
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>{selectedItem.downloads || 0} Downloads</span>
                  </div>
                  <Button onClick={() => handleContact(selectedItem)}>Anfragen</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Contact Dialog */}
      <MinimalContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        title={`Anfrage zu: ${contactItem?.title || 'Knowledge Hub Content'}`}
        description="Füllen Sie das Formular aus, und wir melden uns zeitnah bei Ihnen."
        context={contactItem?.title}
        emailType="Knowledge-Hub"
      />
    </div >
  )
}
