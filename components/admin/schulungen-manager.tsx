"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, Trash2, Save, BookOpen, Loader2, Upload, FileText, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Schulung } from "@/types/schulung"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Pathfinder unit options (from the existing code)
const pathfinderUnitOptions = [
  { id: "digital-core", title: "Digital Core" },
  { id: "platform-elevation", title: "Platform Elevation" },
  { id: "adaptive-integration", title: "Adaptive Integration" },
  { id: "data-driven-decisions", title: "Data-Driven Decisions" },
  { id: "business-simplified", title: "Business Simplified" },
  { id: "xaas-transformation", title: "XaaS Transformation" }
]

export default function SchulungenManager() {
  const [schulungen, setSchulungen] = useState<Schulung[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load training courses on initial render
  useEffect(() => {
    const loadSchulungen = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Load training courses from the API
        const response = await fetch('/api/schulungen');
        if (response.ok) {
          const data = await response.json();
          
          // Check if there's a dev message from our API
          if (data._devMessage) {
            toast({
              title: "Development Mode",
              description: data._devMessage,
              variant: "default",
            });
          }
          
          setSchulungen(data);
        }
      } catch (error) {
        console.error("Error loading training courses:", error)
        setError(`Error loading training courses: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSchulungen()
  }, [])

  // Create empty file input refs for each training
  useEffect(() => {
    schulungen.forEach(schulung => {
      if (!fileInputRefs.current[schulung.id]) {
        fileInputRefs.current[schulung.id] = null;
      }
    });
  }, [schulungen]);

  const createEmptySchulung = (): Schulung => ({
    id: `schulung-${Math.random().toString(36).substr(2, 9)}`,
    title: "",
    category: "Online-Kurs",
    duration: "",
    price: 0,
    unitId: "" // Empty unitId by default
  })

  const handleAddSchulung = () => {
    const newSchulung = createEmptySchulung()
    setSchulungen([...schulungen, newSchulung])
  }

  const handleRemoveSchulung = (index: number) => {
    const newSchulungen = [...schulungen]
    newSchulungen.splice(index, 1)
    setSchulungen(newSchulungen)
  }

  const handleSchulungChange = (index: number, field: keyof Schulung, value: any) => {
    const newSchulungen = [...schulungen]
    newSchulungen[index] = { ...newSchulungen[index], [field]: value }
    
    // Update duration based on hours and days
    if (field === 'hours') {
      const hours = parseFloat(value) || 0
      if (hours >= 8) {
        const days = Math.floor(hours / 8)
        const remainingHours = hours % 8
        newSchulungen[index].days = days
        newSchulungen[index].duration = `${days} day${days !== 1 ? 's' : ''} ${remainingHours > 0 ? `and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`
      } else {
        newSchulungen[index].duration = `${hours} hour${hours !== 1 ? 's' : ''}`
      }
    } else if (field === 'days') {
      const days = parseFloat(value) || 0
      const hours = newSchulungen[index].hours || 0
      const remainingHours = hours % 8
      newSchulungen[index].duration = `${days} day${days !== 1 ? 's' : ''} ${remainingHours > 0 ? `and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`
    }
    
    setSchulungen(newSchulungen)
  }

  // Handle PDF upload click for a specific training
  const handleUploadClick = (schulungId: string) => {
    if (fileInputRefs.current[schulungId]) {
      fileInputRefs.current[schulungId]?.click();
    }
  };

  // Handle file selection for PDF upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would upload the file to a server here
    // For this prototype, we'll use a local URL
    const fileUrl = URL.createObjectURL(file);
    
    // Update the training with the file information
    const newSchulungen = [...schulungen];
    newSchulungen[index] = {
      ...newSchulungen[index],
      pdfDocument: {
        filename: file.name,
        deleted: false,
        fileUrl: fileUrl,
        uploadDate: new Date().toISOString()
      }
    };
    
    setSchulungen(newSchulungen);
    
    toast({
      title: "PDF uploaded",
      description: `"${file.name}" has been attached to the training.`,
    });
  };

  // Handle removing a PDF from a training
  const handleRemoveFile = (index: number) => {
    const newSchulungen = [...schulungen];
    
    // Check if there's a file URL that needs to be revoked
    const fileUrl = newSchulungen[index]?.pdfDocument?.fileUrl;
    if (fileUrl && fileUrl.startsWith('blob:')) {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(fileUrl);
    }
    
    // Remove the PDF document reference
    newSchulungen[index] = {
      ...newSchulungen[index],
      pdfDocument: undefined
    };
    
    setSchulungen(newSchulungen);
    
    toast({
      title: "PDF removed",
      description: "The PDF has been removed from the training.",
    });
  };

  // Save training courses to the API
  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const validSchulungen = schulungen.map((schulung) => {
        if (!schulung.id) {
          schulung.id = `schulung-${Math.random().toString(36).substr(2, 9)}`
        }
        return schulung
      })

      // Sende die Schulungen an die API
      const response = await fetch('/api/schulungen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validSchulungen),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save training courses');
      }

      toast({
        title: "Saved",
        description: "The training courses have been successfully saved.",
      })

      return true
    } catch (error) {
      console.error("Error saving:", error)
      setError(`Error saving: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Error",
        description: `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setShowResetDialog(true)
  }

  const confirmReset = async () => {
    // Reload data from the server, effectively resetting to the current state
    setIsLoading(true);
    try {
      const response = await fetch('/api/schulungen');
      if (response.ok) {
        const data = await response.json();
        setSchulungen(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error resetting data:', error);
    } finally {
      setIsLoading(false);
    }
    
    setShowResetDialog(false);
    toast({
      title: "Reset",
      description: "The training courses have been reset.",
    })
  }
  
  // Catalog-related functionality removed

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading trainings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <Button onClick={handleAddSchulung} variant="outline" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Training
            </Button>
            
            <div className="flex-1"></div>
            
            <Button onClick={handleReset} variant="outline" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={schulungen.length === 1 ? schulungen[0].id : undefined}
          >
            {schulungen.map((schulung, index) => (
              <AccordionItem key={schulung.id || index} value={schulung.id}>
                <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{schulung.title || "New Training"}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex space-x-4">
                      <span>{schulung.category}</span>
                      <span>{schulung.duration}</span>
                      <span>{schulung.price} €</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 space-y-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`}>Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={schulung.title}
                          onChange={(e) => handleSchulungChange(index, "title", e.target.value)}
                          placeholder="Training title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`category-${index}`}>Category</Label>
                        <Select
                          value={schulung.category}
                          onValueChange={(value) => handleSchulungChange(index, "category", value)}
                        >
                          <SelectTrigger id={`category-${index}`}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online-Kurs">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>Online-Kurs</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Workshop">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>Workshop</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Webinar">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>Webinar</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`duration-${index}`}>Duration</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Input
                              id={`days-${index}`}
                              type="number"
                              value={schulung.days || 0}
                              onChange={(e) => handleSchulungChange(index, "days", e.target.value)}
                              placeholder="Days"
                            />
                            <span className="text-xs text-gray-500">Days</span>
                          </div>
                          <div>
                            <Input
                              id={`hours-${index}`}
                              type="number"
                              value={schulung.hours || 0}
                              onChange={(e) => handleSchulungChange(index, "hours", e.target.value)}
                              placeholder="Hours"
                            />
                            <span className="text-xs text-gray-500">Hours</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`}>Price (€)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          value={schulung.price}
                          onChange={(e) => handleSchulungChange(index, "price", parseFloat(e.target.value))}
                          placeholder="Price in Euro"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`unitId-${index}`}>Pathfinder Unit (optional)</Label>
                        <Select
                          value={schulung.unitId || ""}
                          onValueChange={(value) => handleSchulungChange(index, "unitId", value || undefined)}
                        >
                          <SelectTrigger id={`unitId-${index}`}>
                            <SelectValue placeholder="Unit auswählen (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Keine Unit (Standard)</SelectItem>
                            {pathfinderUnitOptions.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* PDF Upload Section */}
                    <div className="space-y-2 mt-4 border-t pt-4">
                      <Label>PDF Document</Label>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button 
                          onClick={() => handleUploadClick(schulung.id)} 
                          variant="outline" 
                          className="flex items-center gap-2"
                          type="button"
                        >
                          <Upload size={16} />
                          Upload PDF
                        </Button>
                        
                        {/* Hidden file input */}
                        <input 
                          type="file" 
                          onChange={(e) => handleFileChange(e, index)}
                          ref={(el) => { fileInputRefs.current[schulung.id] = el; }}
                          accept=".pdf"
                          className="hidden" 
                        />
                        
                        {/* Display the uploaded PDF */}
                        {schulung.pdfDocument && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md flex-grow">
                            <FileText size={16} className="text-blue-500 shrink-0" />
                            <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                              {schulung.pdfDocument.filename}
                            </span>
                            <button 
                              onClick={() => handleRemoveFile(index)}
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
                          Uploaded: {new Date(schulung.pdfDocument.uploadDate).toLocaleString('de-DE')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSchulung(index)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Training
                      </Button>
                    </div>

                    {schulung.pdfDocument && (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{schulung.pdfDocument.filename}</span>
                        <Button
                          variant="link"
                          onClick={() => handleRemoveFile(index)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Trainings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all trainings to their default values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
