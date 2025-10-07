"use client";

import "@/styles/token-input.css";
import { useState, useEffect, useRef } from "react";
import TokenInput from "react-customize-token-input";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PdfUploadField } from "./general-components/pdf-upload-item";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { defaultKnowledgeHubContent } from "@/data/default-data";
import { AlertCircle, Save, Trash, Plus, Download, Upload, Loader2, BookOpen, FileText, BookMarked, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SchulungenManager from "@/components/admin/schulungen-manager";
import { db, sanitizeKnowledgeHubContent } from "@/lib/db";
import {
  getClientKnowledgeHubContent,
  saveClientKnowledgeHubContent,
} from "@/lib/client-data-service";
import { Schulung } from "@/types/schulung";

type ContentItemProps = {
  contentItem: any;
  onContentChange: (id: string, field: string, value: any) => void;
  onContentDelete: (id: string) => void;
};

const ContentItemEditor = ({ contentItem, onContentChange, onContentDelete }: ContentItemProps) => (
  <Card key={contentItem.id}>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">
          {contentItem.type === "template" ? "Template" : "Best Practice"} bearbeiten
        </CardTitle>
        <Button variant="destructive" size="sm" onClick={() => onContentDelete(contentItem.id)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`title-${contentItem.id}`}>Titel</Label>
          <Input
            id={`title-${contentItem.id}`}
            value={contentItem.title}
            onChange={(e) => onContentChange(contentItem.id, "title", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`subtitle-${contentItem.id}`}>Subtitel</Label>
          <Input
            id={`subtitle-${contentItem.id}`}
            value={contentItem.subtitle}
            onChange={(e) => onContentChange(contentItem.id, "subtitle", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`description-${contentItem.id}`}>Beschreibung</Label>
          <Textarea
            id={`description-${contentItem.id}`}
            value={contentItem.description}
            onChange={(e) => onContentChange(contentItem.id, "description", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`category-${contentItem.id}`}>Kategorie</Label>
          <Select
            value={contentItem.category}
            onValueChange={(value) => onContentChange(contentItem.id, "category", value)}>
            <SelectTrigger id={`category-${contentItem.id}`}>
              <SelectValue placeholder="Kategorie auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="architecture">Architektur</SelectItem>
              <SelectItem value="development">Entwicklung</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
              <SelectItem value="security">Sicherheit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`image-${contentItem.id}`}>Bild-URL</Label>
          <Input
            id={`image-${contentItem.id}`}
            value={contentItem.image}
            onChange={(e) => onContentChange(contentItem.id, "image", e.target.value)}
          />
        </div>
        {contentItem.tags &&
          <div className="grid gap-2">
            <Label htmlFor={`tags-${contentItem.id}`}>Tags</Label>
            <TokenInput
              style={{
                height: "auto",
              }}
              tokenValues={contentItem.tags}
              onTokenValuesChange={(value) => onContentChange(contentItem.id, "tags", value)}
            />
          </div>
        }
        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id={`featured-${contentItem.id}`}
            checked={contentItem.featured}
            onCheckedChange={(checked) => onContentChange(contentItem.id, "featured", checked)}
          />
          <Label htmlFor={`featured-${contentItem.id}`}>Empfohlen</Label>
        </div> 
        <div className="grid gap-2">
          <Label htmlFor={`downloadUrl-${contentItem.id}`}>Download-URL</Label>
          <Input
            id={`downloadUrl-${contentItem.id}`}
            value={contentItem.pdfDocument?.fileUrl}
            onChange={e => onContentChange(contentItem.id, "pdfDocument", { ...contentItem.pdfDocument, fileUrl: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`externalUrl-${contentItem.id}`}>Externe URL</Label>
          <Input
            id={`externalUrl-${contentItem.id}`}
            value={contentItem.externalUrl}
            onChange={(e) => onContentChange(contentItem.id, "externalUrl", e.target.value)}
          />
        </div> */}
        <PdfUploadField
          value={contentItem}
          onChange={(fileInfo) => onContentChange(contentItem.id, "pdfDocument", fileInfo)}
          label="PDF-Dokument"
          model={contentItem}
          uploadApiPath={`/api/pdf-upload/${contentItem.type}/file/${contentItem.id}`} // Adjust API path as needed
        />
      </div>

    </CardContent>
  </Card>
);

type SchulungItemProps = {
  schulung: Schulung;
  onSchulungChange: (id: string, field: string, value: any) => void;
  onSchulungDelete: (id: string) => void;
  toast: any;
};

const SchulungItemEditor = ({ schulung, onSchulungChange, onSchulungDelete, toast }: SchulungItemProps) => {
  // Local state for input fields
  const [localDays, setLocalDays] = useState<string>(schulung.days?.toString() || '0');
  const [localHours, setLocalHours] = useState<string>(schulung.hours?.toString() || '0');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local values when the training course changes
  useEffect(() => {
    setLocalDays(schulung.days?.toString() || '0');
    setLocalHours(schulung.hours?.toString() || '0');
  }, [schulung.id]); // Only update when switching to a different training course

  const updateDuration = () => {
    // Parse local values as numbers
    const days = Math.max(0, parseInt(localDays || '0', 10));
    const hours = Math.max(0, parseFloat(localHours || '0'));

    // Update the training course object values
    onSchulungChange(schulung.id, 'days', days);
    onSchulungChange(schulung.id, 'hours', hours);

    // Update the display text
    const durationText = formatDuration(days, hours);
    onSchulungChange(schulung.id, 'duration', durationText);
  };

  const formatDuration = (days: number, hours: number) => {
    const daysPart = days > 0 ? `${days} ${days === 1 ? 'Tag' : 'Tage'}` : '';
    const hoursPart = hours > 0 ? `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}` : '';

    if (daysPart && hoursPart) return `${daysPart}, ${hoursPart}`;
    return daysPart || hoursPart || 'Keine Angabe';
  };

  return (
    <AccordionItem value={schulung.id} className="border rounded-md p-1 mb-2">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-primary" />
            <span>{schulung.title || 'Neue Schulung'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-4">{schulung.category}</span>
            <span>{schulung.duration}</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`title-${schulung.id}`}>Titel</Label>
            <Input
              id={`title-${schulung.id}`}
              value={schulung.title}
              onChange={(e) => onSchulungChange(schulung.id, "title", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`category-${schulung.id}`}>Kategorie</Label>
            <Select
              value={schulung.category}
              onValueChange={(value: any) => onSchulungChange(schulung.id, "category", value)}>
              <SelectTrigger id={`category-${schulung.id}`}>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online-Kurs">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Online-Kurs</span>
                  </div>
                </SelectItem>
                <SelectItem value="Workshop">
                  <div className="flex items-center">
                    <BookMarked className="mr-2 h-4 w-4" />
                    <span>Workshop</span>
                  </div>
                </SelectItem>
                <SelectItem value="Webinar">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Webinar</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`days-${schulung.id}`}>Tage</Label>
              <Input
                id={`days-${schulung.id}`}
                type="number"
                min="0"
                step="1"
                value={localDays}
                onChange={(e) => setLocalDays(e.target.value)}
                onBlur={updateDuration}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`hours-${schulung.id}`}>Stunden</Label>
              <Input
                id={`hours-${schulung.id}`}
                type="number"
                min="0"
                step="0.5"
                value={localHours}
                onChange={(e) => setLocalHours(e.target.value)}
                onBlur={updateDuration}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`price-${schulung.id}`}>Preis</Label>
            <Input
              id={`price-${schulung.id}`}
              type="number"
              min="0"
              step="0.01"
              value={schulung.price}
              onChange={(e) => onSchulungChange(schulung.id, "price", parseFloat(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`price-${schulung.id}`}>Image-URL</Label>
            <Input
              id={`image-${schulung.id}`}
              type="string"
              value={schulung.image}
              onChange={(e) => onSchulungChange(schulung.id, "image", String(e.target.value))}
            />
          </div>
          
          <PdfUploadField
            value={ schulung }
            model={ schulung } 
            onChange={(fileInfo: any) => onSchulungChange(schulung.id, "pdfDocument", fileInfo)}
            label="PDF-Dokument"
            uploadApiPath={`/api/pdf-upload/schulung/file/${schulung.id}`} // Adjust API path as needed
          />

          {/* PDF Upload Section 
          <div className="grid gap-2 border-t pt-4 mt-4">
            <Label>PDF Dokument</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="flex items-center gap-2"
                type="button"
              >
                <Upload size={16} />
                PDF hochladen
              </Button>

              Hidden file input
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
              />

              Display the uploaded PDF
              schulung.pdfDocument && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md flex-grow">
                  <FileText size={16} className="text-blue-500 shrink-0" />
                  <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {schulung.pdfDocument.filename}
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-auto p-1 rounded-full hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
            {schulung.pdfDocument?.uploadDate && (
              <p className="text-xs text-gray-500">
                Hochgeladen: {new Date(schulung.pdfDocument.uploadDate).toLocaleString('de-DE')}
              </p>
            )}
          </div>*/}

          <div className="flex justify-end pt-4">
            <Button variant="destructive" size="sm" onClick={() => onSchulungDelete(schulung.id)}>
              <Trash className="h-4 w-4 mr-1" /> Löschen
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Define enum for tab types to avoid hardcoded strings
enum TabType {
  TEMPLATES = "templates",
  BEST_PRACTICES = "best-practices",
  TRAININGS = "schulungen"
}

// Define enum for content types
enum ContentType {
  TEMPLATE = "template",
  BEST_PRACTICE = "best-practice"
}

export default function KnowledgeHubEditor() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.TEMPLATES);
  const [content, setContent] = useState<any[]>([]);
  const [schulungen, setSchulungen] = useState<Schulung[]>([]);
  const [openSchulungen, setOpenSchulungen] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the tab query parameter from URL to allow direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === TabType.TRAININGS) {
        setActiveTab(TabType.TRAININGS);
      }
    }
  }, []);

  useEffect(() => {
    const loadKnowledgeHubContent = async () => {
      setIsLoading(true);
      setSaveError(null);
      setSaveSuccess(null);
      try {
        console.log("[KNOWLEDGE-HUB-CONTENT-EDITOR] Lade Knowledge Hub Inhalte...");

        // First try to load the data from the server
        try {
          const serverKnowledgeHubContent = await getClientKnowledgeHubContent();
          console.log(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] Knowledge Hub content loaded from server:",
            serverKnowledgeHubContent.length
          );

          setContent(serverKnowledgeHubContent);

          // Load training courses
          try {
            const response = await fetch('/api/schulungen');
            if (response.ok) {
              const schulungenData = await response.json();
              setSchulungen(schulungenData);
              // Set the first training course as open, if available
              if (schulungenData.length > 0) {
                setOpenSchulungen([schulungenData[0].id]);
              }
            } else {
              // If no server response, show empty state or fetch mock data
              setSchulungen([]);
              setError('No trainings data available');
            }
          } catch (e) {
            console.error('Error fetching trainings:', e);
            // In case of error, show empty state
            setSchulungen([]);
            setError('Error loading trainings data');
          }

          // Training catalog functionality removed

          setError(null);
          return;
        } catch (serverError) {
          console.error(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] Error loading from server, trying local database:",
            serverError
          );
        }

        // If server loading fails, try local database
        const dbKnowledgeHubContent = await db.knowledgeHubContent.toArray();

        if (Array.isArray(dbKnowledgeHubContent) && dbKnowledgeHubContent.length > 0) {
          console.log(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] Knowledge Hub content loaded from local database:",
            dbKnowledgeHubContent.length
          );
          setContent(dbKnowledgeHubContent);
          setError(null);
        } else {
          console.log(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] No Knowledge Hub content found in database, using default data"
          );
          const sanitizedKnowledgeHubContent = defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent);
          setContent(sanitizedKnowledgeHubContent);

          // Initialize database with default data
          try {
            await db.knowledgeHubContent.clear();
            await db.knowledgeHubContent.bulkPut(sanitizedKnowledgeHubContent);
            console.log("[KNOWLEDGE-HUB-CONTENT-EDITOR] Datenbank mit Standarddaten initialisiert");
          } catch (dbError) {
            console.error(
              "[KNOWLEDGE-HUB-CONTENT-EDITOR] Fehler beim Initialisieren der Datenbank:",
              dbError
            );
            setError(
              "Fehler beim Initialisieren der Datenbank. Standarddaten werden nur temporär verwendet."
            );
          }
        }
      } catch (err) {
        console.error("[KNOWLEDGE-HUB-CONTENT-EDITOR] Fehler beim Laden der Knowledge Hub Inhalte:", err);
        setContent(defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent));
        setError("Fehler beim Laden der Knowledge Hub Inhalte. Standarddaten werden verwendet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadKnowledgeHubContent();
  }, []);

  const pdfDeletionBatch: any = async (items: any) => {
    // const res: any = await fetch(uploadApiPath, { method: "DELETE" })
    const itemDeletionBatch: Array<Promise<any>> = [];
    items.forEach((object: any) => {
      if (object.pdfDocument?.deleted === true) {
        itemDeletionBatch.push(fetch(object.pdfDocument?.fileUrl, { method: "DELETE" }));
        object.pdfDocument = undefined;
      }
    });
    await Promise.all(itemDeletionBatch);
  }

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      console.log("[KNOWLEDGE-HUB-CONTENT-EDITOR] Saving Knowledge Hub content...");

      // Clean up Knowledge Hub content before saving
      const sanitizedKnowledgeHubContent = content.map(sanitizeKnowledgeHubContent);

      // Save to server
      try {
        await pdfDeletionBatch(sanitizedKnowledgeHubContent);
        const success = await saveClientKnowledgeHubContent(sanitizedKnowledgeHubContent);

        // Save training courses
        let schulungenSuccess = true;
        try {
          await pdfDeletionBatch(schulungen);
          const schulungenResponse = await fetch('/api/schulungen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schulungen)
          });

          if (!schulungenResponse.ok) {
            schulungenSuccess = false;
          }

          // Training catalog upload functionality removed
        } catch (schulungenError) {
          console.error("Error saving training courses:", schulungenError);
          schulungenSuccess = false;
        }

        if (success && schulungenSuccess) {
          console.log(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] Knowledge Hub content and training courses saved successfully"
          );
          setSaveSuccess("Knowledge Hub content and training courses saved successfully.");

          // Also save to local database
          try {
            await db.knowledgeHubContent.clear();
            await db.knowledgeHubContent.bulkPut(sanitizedKnowledgeHubContent);
            console.log(
              "[KNOWLEDGE-HUB-CONTENT-EDITOR] Knowledge Hub content also saved to local database"
            );
          } catch (dbError) {
            console.error(
              "[KNOWLEDGE-HUB-CONTENT-EDITOR] Error saving to local database:",
              dbError
            );
          }

          toast({
            title: "Success",
            description: "Knowledge Hub content and training courses saved successfully.",
          });

          return;
        } else {
          throw new Error("Save operation failed");
        }
      } catch (serverError) {
        console.error("[KNOWLEDGE-HUB-CONTENT-EDITOR] Error saving to server:", serverError);

        // Try to save to local database
        // Nobody knows if that is relevant. Must be checked in the future - GenAI slop?
        try {
          await db.knowledgeHubContent.clear();
          await db.knowledgeHubContent.bulkPut(sanitizedKnowledgeHubContent);
          console.log("[KNOWLEDGE-HUB-CONTENT-EDITOR] Knowledge Hub Inhalte in der lokalen Datenbank gespeichert");
          setSaveSuccess(
            "Knowledge Hub Inhalte erfolgreich in der lokalen Datenbank gespeichert. Server-Speicherung fehlgeschlagen."
          );
          toast({
            title: "Teilweise erfolgreich",
            description:
              "Knowledge Hub Inhalte wurden nur lokal gespeichert. Server-Speicherung fehlgeschlagen.",
            variant: "default",
          });
        } catch (dbError) {
          console.error(
            "[KNOWLEDGE-HUB-CONTENT-EDITOR] Fehler beim Speichern in der lokalen Datenbank:",
            dbError
          );
          throw new Error("Speicherung fehlgeschlagen (Server und lokal)");
        }
      }
    } catch (err) {
      console.error("[KNOWLEDGE-HUB-CONTENT-EDITOR] Fehler beim Speichern der Knowledge Hub Inhalte:", err);
      setSaveError(
        `Fehler beim Speichern der Knowledge Hub Inhalte: ${err instanceof Error ? err.message : "Unbekannter Fehler"
        }`
      );
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Knowledge Hub Inhalte.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContentItem = (contentType: ContentType) => {
    const newContentItem = {
      id: `${contentType}-${uuidv4()}`,
      type: contentType,
      title: `New ${contentType === ContentType.TEMPLATE ? "Template" : "Best Practice"}`,
      subtitle: `Subtitle new ${contentType === ContentType.TEMPLATE ? "Template" : "Best Practice"}`,
      description: `${contentType === ContentType.TEMPLATE ? "Template" : "Best Practice"} Description`,
      category: "development",
      image: "/bestPractices.svg",
      downloads: Math.floor(Math.random() * (1000 - 1 + 1) + 1),
      tags: [],
      // featured: false,
      downloadUrl: "",
      externalUrl: "",
    };

    const newContent = [newContentItem, ...content];
    setContent(newContent);
  };

  const handleContentItemDelete = (id: string) => {
    const newContent = content.filter((contentItem) => contentItem.id !== id);
    setContent(newContent);
  };

  const handleContentItemContentChange = (id: string, field: string, value: any) => {
    const newContent = content.map((contentItem) => {
      if (contentItem.id === id) {
        return { ...contentItem, [field]: value };
      }
      return contentItem;
    });
    setContent(newContent);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "knowledge-hub-data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (Array.isArray(importedData)) {
          setContent(importedData);
          toast({
            title: "Import erfolgreich",
            description: `${importedData.length} Knowledge Hub Inhalte importiert.`,
          });
        } else {
          toast({
            title: "Import fehlgeschlagen",
            description: "Die importierte Datei enthält keine gültige Best Practice-Liste.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[KNOWLEDGE-HUB-CONTENT-EDITOR] Import error:", error);
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht verarbeitet werden.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleAddSchulungItem = () => {
    const newSchulungId = `schulung-${uuidv4()}`;
    const newSchulungItem: Schulung = {
      id: newSchulungId,
      title: "New Training Course",
      category: "Online-Kurs",
      duration: "4 hours",
      price: 299,
      image: "",
      hours: 4,
      days: 0
    };

    const newSchulungen = [newSchulungItem, ...schulungen];
    setSchulungen(newSchulungen);

    // Automatically expand the new training course and ensure it's visible
    setOpenSchulungen([newSchulungId, ...openSchulungen]);
  };

  const handleSchulungItemDelete = (id: string) => {
    const newSchulungen = schulungen.filter((schulungItem) => schulungItem.id !== id);
    setSchulungen(newSchulungen);

    // Remove the deleted training course from the list of open ones
    setOpenSchulungen(openSchulungen.filter(openId => openId !== id));
  };

  const handleSchulungItemChange = (id: string, field: string, value: any) => {
    const newSchulungen = schulungen.map((schulungItem) => {
      if (schulungItem.id === id) {
        return { ...schulungItem, [field]: value };
      }
      return schulungItem;
    });
    setSchulungen(newSchulungen);
  };

  // Training catalog functions removed

  if (isLoading) {
    return (
      <div className="text-center py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Lade Knowledge Hub Inhalte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Knowledge Hub Content-Editor</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Speicherfehler</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>{saveSuccess}</AlertDescription>
        </Alert>
      )}

      {activeTab !== TabType.TRAININGS && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                if (activeTab === TabType.TRAININGS) {
                  handleAddSchulungItem();
                } else {
                  handleAddContentItem(activeTab === TabType.TEMPLATES ? ContentType.TEMPLATE : ContentType.BEST_PRACTICE);
                }
              }}>
              <Plus className="mr-2 h-4 w-4" />{" "}
              {activeTab === TabType.TEMPLATES
                ? "Template"
                : activeTab === TabType.BEST_PRACTICES
                  ? "Best Practice"
                  : "Schulung"} hinzufügen
            </Button>
            <Button onClick={handleSave} variant="default" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Speichern
                </>
              )}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Exportieren
            </Button>
            <div className="relative">
              <input
                type="file"
                id="import-file"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                onChange={handleImport}
                accept=".json"
              />
              <Button variant="outline" className="relative">
                <Upload className="mr-2 h-4 w-4" /> Importieren
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Load all content (for Dev purposes only) */}
      {/* <div className="grid gap-6">
        {content
          .map((contentItem) => (
            <ContentItemEditor
              key={contentItem.id}
              contentItem={contentItem}
              onContentChange={handleContentItemContentChange}
              onContentDelete={handleContentItemDelete}
            />
          ))}
      </div> */}

      <Tabs
        defaultValue={TabType.TEMPLATES}
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={TabType.TEMPLATES}>Templates</TabsTrigger>
          <TabsTrigger value={TabType.BEST_PRACTICES}>Best Practices</TabsTrigger>
          <TabsTrigger value={TabType.TRAININGS}>Schulungsmanager</TabsTrigger>
        </TabsList>

        <TabsContent value={TabType.TEMPLATES} className="mt-6">
          <div className="grid gap-6">
            {content
              .filter((contentItem) => contentItem.type === ContentType.TEMPLATE)
              .map((contentItem) => (
                <ContentItemEditor
                  key={contentItem.id}
                  contentItem={contentItem}
                  onContentChange={handleContentItemContentChange}
                  onContentDelete={handleContentItemDelete}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value={TabType.BEST_PRACTICES} className="mt-6">
          <div className="grid gap-6">
            {content
              .filter((contentItem) => contentItem.type === ContentType.BEST_PRACTICE)
              .map((contentItem) => (
                <ContentItemEditor
                  key={contentItem.id}
                  contentItem={contentItem}
                  onContentChange={handleContentItemContentChange}
                  onContentDelete={handleContentItemDelete}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value={TabType.TRAININGS} className="mt-6">
          <SchulungenManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
