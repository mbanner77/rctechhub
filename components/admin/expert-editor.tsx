"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Save,
  Trash,
  Plus,
  User,
  RotateCcw,
  Edit,
  Search,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Expert } from "@/types/expert";
import { UnitCard } from "@/types/unit-cards";
import { defaultExperts } from "@/data/experts";

export default function ExpertEditor() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  // Pathfinder Unit assignment state
  const [unitCards, setUnitCards] = useState<UnitCard[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitChanges, setUnitChanges] = useState<Record<number, { expert: boolean; contact: boolean }>>({});

  // Form state for editing
  const [formData, setFormData] = useState<Partial<Expert>>({});
  const [originalExpertData, setOriginalExpertData] = useState<Expert | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [originalExpertsSnapshot, setOriginalExpertsSnapshot] = useState<
    Record<string, Expert>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadExperts = async () => {
      setIsLoading(true);
      setSaveError(null);
      setSaveSuccess(null);
      try {
        const response = await fetch("/api/data/experts");
        if (response.ok) {
          const data = await response.json();
          setExperts(data || defaultExperts);

          const snapshot = (data || defaultExperts).reduce(
            (acc: Record<string, Expert>, expert: Expert) => {
              acc[expert.id] = { ...expert };
              return acc;
            },
            {}
          );
          setOriginalExpertsSnapshot(snapshot);
        } else {
          console.warn("Failed to load experts from API, using defaults");
          setExperts(defaultExperts);

          const snapshot = defaultExperts.reduce(
            (acc: Record<string, Expert>, expert: Expert) => {
              acc[expert.id] = { ...expert };
              return acc;
            },
            {}
          );
          setOriginalExpertsSnapshot(snapshot);
        }
      } catch (error) {
        console.error("Error loading experts:", error);
        setExperts(defaultExperts);

        const snapshot = defaultExperts.reduce(
          (acc: Record<string, Expert>, expert: Expert) => {
            acc[expert.id] = { ...expert };
            return acc;
          },
          {}
        );
        setOriginalExpertsSnapshot(snapshot);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperts();
  }, []);

  // Load Unit-Cards for Pathfinder assignments
  useEffect(() => {
    const loadUnitCards = async () => {
      setUnitsLoading(true);
      try {
        const response = await fetch("/api/admin/unit-cards");
        if (response.ok) {
          const data = await response.json();
          setUnitCards(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Error loading unit-cards:", e);
      } finally {
        setUnitsLoading(false);
      }
    };
    loadUnitCards();
  }, []);

  // Initialize unitChanges when selecting an expert
  useEffect(() => {
    if (!selectedExpert) return;
    const init: Record<number, { expert: boolean; contact: boolean }> = {};
    unitCards.forEach((uc) => {
      const isExpert = Array.isArray(uc.expertIds) && uc.expertIds.includes(selectedExpert.id);
      const isContact = Array.isArray((uc as any).contactPersonIds) && (uc as any).contactPersonIds.includes(selectedExpert.id);
      if (uc.id != null) {
        init[uc.id] = { expert: !!isExpert, contact: !!isContact };
      }
    });
    setUnitChanges(init);
  }, [selectedExpert, unitCards]);

  const toggleUnitAssignment = (unitId: number, field: 'expert' | 'contact', value: boolean) => {
    setUnitChanges((prev) => ({
      ...prev,
      [unitId]: { ...(prev[unitId] || { expert: false, contact: false }), [field]: value },
    }));
  };

  const saveUnitAssignments = async () => {
    if (!selectedExpert) return;
    try {
      const promises: Promise<Response>[] = [];
      unitCards.forEach((uc) => {
        if (uc.id == null) return;
        const current = unitChanges[uc.id];
        if (!current) return;
        const wasExpert = Array.isArray(uc.expertIds) && uc.expertIds.includes(selectedExpert.id);
        const wasContact = Array.isArray((uc as any).contactPersonIds) && (uc as any).contactPersonIds.includes(selectedExpert.id);
        const changed = wasExpert !== current.expert || wasContact !== current.contact;
        if (!changed) return;
        const nextExpertIds = new Set<string>(Array.isArray(uc.expertIds) ? uc.expertIds : []);
        const nextContactIds = new Set<string>(Array.isArray((uc as any).contactPersonIds) ? (uc as any).contactPersonIds : []);
        if (current.expert) nextExpertIds.add(selectedExpert.id); else nextExpertIds.delete(selectedExpert.id);
        if (current.contact) nextContactIds.add(selectedExpert.id); else nextContactIds.delete(selectedExpert.id);
        const payload = {
          ...uc,
          expertIds: Array.from(nextExpertIds),
          contactPersonIds: Array.from(nextContactIds),
        } as UnitCard & { contactPersonIds?: string[] };
        promises.push(
          fetch(`/api/data/unit-cards/${uc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        );
      });
      if (promises.length === 0) {
        toast({ title: 'Keine Änderungen', description: 'Es gibt keine geänderten Zuweisungen.', variant: 'default' });
        return;
      }
      const results = await Promise.all(promises);
      const ok = results.every(r => r.ok);
      if (ok) {
        toast({ title: 'Zuweisungen gespeichert', description: 'Pathfinder-Zuweisungen erfolgreich übernommen.' });
      } else {
        toast({ title: 'Teilweise fehlgeschlagen', description: 'Einige Zuweisungen konnten nicht gespeichert werden.', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Error saving unit assignments', e);
      toast({ title: 'Fehler', description: 'Zuweisungen konnten nicht gespeichert werden.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await fetch("/api/data/experts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experts),
      });

      if (response.ok) {
        const result = await response.json();
        setSaveSuccess(
          `Experten erfolgreich gespeichert: ${
            result.count || experts.length
          } Einträge`
        );

        const updatedSnapshot = experts.reduce(
          (acc: Record<string, Expert>, expert: Expert) => {
            acc[expert.id] = { ...expert };
            return acc;
          },
          {}
        );
        setOriginalExpertsSnapshot(updatedSnapshot);

        if (selectedExpert) {
          setOriginalExpertData({ ...selectedExpert });
        }
        setHasChanges(false);

        toast({
          title: "Erfolg",
          description: "Experten wurden erfolgreich gespeichert",
        });
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "Fehler beim Speichern der Experten");
      }
    } catch (error) {
      console.error("Error saving experts:", error);
      setSaveError("Netzwerkfehler beim Speichern der Experten");
    }
  };

  const handleAddExpert = () => {
    const newExpert: Expert = {
      id: Date.now().toString(),
      name: "",
      firstName: "",
      role: "",
      technologies: [],
      email: "",
      expertise: [],
      experience: "",
      certifications: "",
      image: "",
      bio: "",
      phone: "",
      location: "",
      linkedin: "",
      languages: [],
      projects: [],
      publications: [],
      showContactDialog: false,
    };

    setExperts([...experts, newExpert]);
    setSelectedExpert(newExpert);
    setFormData(newExpert);
    setOriginalExpertData({ ...newExpert });
    setOriginalExpertsSnapshot((prev) => ({
      ...prev,
      [newExpert.id]: { ...newExpert },
    }));
    setHasChanges(false);
  };

  const handleDeleteExpert = (id: string) => {
    setExperts(experts.filter((exp) => exp.id !== id));

    setOriginalExpertsSnapshot((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    if (selectedExpert?.id === id) {
      setSelectedExpert(null);
      setFormData({});
      setOriginalExpertData(null);
      setHasChanges(false);
    }
  };

  const handleSelectExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setFormData(expert);

    if (!originalExpertsSnapshot[expert.id]) {
      setOriginalExpertsSnapshot((prev) => ({
        ...prev,
        [expert.id]: { ...expert },
      }));
      setOriginalExpertData({ ...expert });
    } else {
      setOriginalExpertData(originalExpertsSnapshot[expert.id]);
    }
  };
  const handleFormChange = (field: keyof Expert, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    // Reset image error state when image URL changes
    if (field === "image" && selectedExpert) {
      setImageErrors((prev) => ({
        ...prev,
        [selectedExpert.id]: false,
      }));
    }

    if (originalExpertData) {
      const hasChanges =
        JSON.stringify(updatedFormData) !== JSON.stringify(originalExpertData);
      setHasChanges(hasChanges);
    }

    if (selectedExpert) {
      const updatedExpert = { ...selectedExpert, [field]: value };
      setSelectedExpert(updatedExpert);
      setExperts(
        experts.map((exp) =>
          exp.id === updatedExpert.id ? updatedExpert : exp
        )
      );
    }
  };

  const handleArrayFieldChange = (
    field: keyof Expert,
    index: number,
    value: string
  ) => {
    if (selectedExpert && Array.isArray(formData[field])) {
      const updatedArray = [...(formData[field] as string[])];
      updatedArray[index] = value;
      handleFormChange(field, updatedArray);
    }
  };

  const handleAddArrayItem = (field: keyof Expert) => {
    if (selectedExpert) {
      const currentArray = (formData[field] as string[]) || [];
      handleFormChange(field, [...currentArray, ""]);
    }
  };
  const handleRemoveArrayItem = (field: keyof Expert, index: number) => {
    if (selectedExpert && Array.isArray(formData[field])) {
      const updatedArray = (formData[field] as string[]).filter(
        (_, i) => i !== index
      );
      handleFormChange(field, updatedArray);
    }
  };

  const handleImageError = (expertId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [expertId]: true,
    }));
  };

  const handleImageLoad = (expertId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [expertId]: false,
    }));
  };

  const handleResetExpert = () => {
    if (originalExpertData && selectedExpert) {
      setSelectedExpert({ ...originalExpertData });
      setFormData({ ...originalExpertData });
      setExperts(
        experts.map((exp) =>
          exp.id === selectedExpert.id ? { ...originalExpertData } : exp
        )
      );
      setHasChanges(false);
    }
  };

  const hasExpertUnsavedChanges = (expert: Expert) => {
    const originalData = originalExpertsSnapshot[expert.id];
    if (!originalData) return true;
    return JSON.stringify(expert) !== JSON.stringify(originalData);
  };

  // Filter experts based on search query
  const filteredExperts = experts.filter((expert) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const searchableFields = [
      expert.firstName,
      expert.name,
      expert.role,
      expert.bio,
      expert.location,
      expert.experience,
      ...(expert.technologies || []),
      ...(expert.expertise || []),
      ...(expert.languages || []),
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">Lade Experten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      )}{" "}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">Erfolg</AlertTitle>
          <AlertDescription className="text-green-700">
            {saveSuccess}
          </AlertDescription>
        </Alert>
      )}{" "}
      <div className="flex justify-between items-center gap-4 mb-6">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Alle Änderungen speichern
        </Button>
        <Button
          onClick={handleAddExpert}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neuer Experte
        </Button>
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {/* Expert List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Experten-Liste ({filteredExperts.length})</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Experten durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />{" "}
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Expert List */}
              <div className="space-y-2 max-h-[800px] overflow-y-auto">
                {filteredExperts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2" />
                    {searchQuery ? (
                      <div>
                        <p>Keine Experten gefunden für:</p>
                        <p className="font-medium">"{searchQuery}"</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="mt-2"
                        >
                          Suche zurücksetzen
                        </Button>
                      </div>
                    ) : (
                      <p>Keine Experten vorhanden</p>
                    )}
                  </div>
                ) : (
                  filteredExperts.map((expert) => (
                    <div
                      key={expert.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedExpert?.id === expert.id
                          ? "bg-blue-50 border-blue-300"
                          : hasExpertUnsavedChanges(expert)
                          ? "border-orange-300"
                          : ""
                      }`}
                      onClick={() => handleSelectExpert(expert)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {expert.image && !imageErrors[expert.id] ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                              <Image
                                // Use key to force re-render on image change
                                key={expert.image}
                                src={expert.image}
                                alt={`${expert.firstName} ${expert.name}`}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(expert.id)}
                                onLoad={() => handleImageLoad(expert.id)}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {expert.firstName} {expert.name}
                            </div>
                            {hasExpertUnsavedChanges(expert) && (
                              <span title="Ungespeicherte Änderungen">
                                <Edit className="h-3 w-3 text-orange-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expert.role}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExpert(expert.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />{" "}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>{" "}
        </div>
        {/* Expert Editor */}
        <div className="lg:col-span-2">
          {selectedExpert ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {formData.firstName} {formData.name}
                  </CardTitle>
                  <Button
                    onClick={handleResetExpert}
                    disabled={!hasChanges}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Änderungen zurücksetzen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                    <TabsTrigger value="contact">Kontakt</TabsTrigger>
                    <TabsTrigger value="expertise">Expertise</TabsTrigger>
                    <TabsTrigger value="additional">Zusatzinfo</TabsTrigger>
                    <TabsTrigger value="pathfinder">Pathfinder</TabsTrigger>
                  </TabsList>{" "}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    {/* Profile Picture Section */}
                    <Card className="border-dashed border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {formData.image ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="cursor-pointer">
                                    <Image
                                      key={formData.image}
                                      src={formData.image}
                                      alt={`${formData.firstName || ""} ${
                                        formData.name || ""
                                      }`}
                                      width={80}
                                      height={80}
                                      className="object-cover rounded-full border-4 border-white shadow-lg aspect-square ring-2 ring-gray-100 hover:ring-4 hover:ring-blue-200 hover:shadow-xl transition-all duration-200 hover:scale-105"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        const placeholder =
                                          e.currentTarget.parentElement?.parentElement?.querySelector(
                                            ".placeholder-image"
                                          );
                                        if (placeholder) {
                                          placeholder.classList.remove(
                                            "hidden"
                                          );
                                        }
                                      }}
                                      onLoad={(e) => {
                                        e.currentTarget.style.display = "block";
                                        const placeholder =
                                          e.currentTarget.parentElement?.parentElement?.querySelector(
                                            ".placeholder-image"
                                          );
                                        if (placeholder) {
                                          placeholder.classList.add("hidden");
                                        }
                                      }}
                                    />
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Profilbild -{" "}
                                      {formData.firstName && formData.name
                                        ? `${formData.firstName} ${formData.name}`
                                        : "Vorschau"}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center items-center p-4">
                                    <Image
                                      src={formData.image}
                                      alt={`${formData.firstName || ""} ${
                                        formData.name || ""
                                      }`}
                                      width={500}
                                      height={500}
                                      className="object-contain rounded-lg shadow-lg max-w-full max-h-[70vh] w-auto h-auto"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : null}
                            <div
                              className={`placeholder-image w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center aspect-square border-4 border-white shadow-lg ring-2 ring-gray-100 ${
                                formData.image ? "hidden" : ""
                              }`}
                            >
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label
                              htmlFor="image"
                              className="text-sm font-medium text-gray-700"
                            >
                              Profilbild URL
                            </Label>
                            <Input
                              id="image"
                              value={formData.image || ""}
                              onChange={(e) =>
                                handleFormChange("image", e.target.value)
                              }
                              placeholder="/profile.jpg"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.image
                                ? "💡 Klicken Sie auf das Bild für eine größere Ansicht"
                                : "📷 Fügen Sie eine Bild-URL hinzu, um eine Vorschau zu sehen"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName || ""}
                          onChange={(e) =>
                            handleFormChange("firstName", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) =>
                            handleFormChange("name", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role">Rolle / Position</Label>
                      <Input
                        id="role"
                        value={formData.role || ""}
                        onChange={(e) =>
                          handleFormChange("role", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Beschreibung</Label>
                      <RichTextEditor
                        value={formData.bio || ""}
                        onChange={(value) => handleFormChange("bio", value)}
                        placeholder="Beschreibung des Experten..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Erfahrung</Label>
                      <Input
                        id="experience"
                        value={formData.experience || ""}
                        onChange={(e) =>
                          handleFormChange("experience", e.target.value)
                        }
                        placeholder="z.B. 15+ Jahre"
                      />{" "}
                    </div>
                  </TabsContent>
                  <TabsContent value="pathfinder" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pathfinder-Units</Label>
                        <p className="text-sm text-muted-foreground">Weise den Experten einzelnen Units als Experte oder Ansprechpartner zu.</p>
                      </div>
                      <Button onClick={saveUnitAssignments} className="flex items-center gap-2" disabled={unitsLoading || !selectedExpert}>
                        Zuweisungen speichern
                      </Button>
                    </div>
                    {unitsLoading ? (
                      <div className="text-sm text-gray-500">Lade Units…</div>
                    ) : unitCards.length === 0 ? (
                      <div className="text-sm text-gray-500">Keine Units gefunden.</div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {unitCards.map((uc) => {
                          const state = unitChanges[uc.id as number] || { expert: false, contact: false };
                          return (
                            <div key={uc.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{uc.title}</div>
                                <div className="text-xs text-gray-500 truncate">{uc.subtitle}</div>
                              </div>
                              <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={!!state.expert}
                                    onChange={(e) => toggleUnitAssignment(uc.id as number, 'expert', e.target.checked)}
                                  />
                                  Experte
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={!!state.contact}
                                    onChange={(e) => toggleUnitAssignment(uc.id as number, 'contact', e.target.checked)}
                                  />
                                  Ansprechpartner
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="contact" className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email-Adresse</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        placeholder="vorname.name@realcore.de"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          handleFormChange("phone", e.target.value)
                        }
                        placeholder="+49 123 456789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Standort</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) =>
                          handleFormChange("location", e.target.value)
                        }
                        placeholder="München, Deutschland"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profil</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin || ""}
                        onChange={(e) =>
                          handleFormChange("linkedin", e.target.value)
                        }
                        placeholder="https://www.linkedin.com/in/..."
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="expertise" className="space-y-4">
                    <div>
                      <Label>Technologien</Label>
                      <div className="space-y-2">
                        {(formData.technologies || []).map(
                          (tech: string, index: number) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={tech}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "technologies",
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Technologie eingeben"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRemoveArrayItem("technologies", index)
                                }
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddArrayItem("technologies")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Technologie hinzufügen
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Expertise (mapped zu Technologie-Daten)</Label>
                      <div className="space-y-2">
                        {(formData.expertise || []).map((exp, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={exp}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "expertise",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Expertise-Bereich eingeben"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRemoveArrayItem("expertise", index)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddArrayItem("expertise")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Expertise hinzufügen
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="certifications">Zertifizierungen</Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications || ""}
                        onChange={(e) =>
                          handleFormChange("certifications", e.target.value)
                        }
                        rows={2}
                        placeholder="SAP Certified Development Associate - ABAP, ..."
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="additional" className="space-y-4">
                    <div>
                      <Label>Sprachen</Label>
                      <div className="space-y-2">
                        {(formData.languages || []).map((lang, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={lang}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "languages",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="z.B. Deutsch (Muttersprache)"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRemoveArrayItem("languages", index)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddArrayItem("languages")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Sprache hinzufügen
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Projekte</Label>
                      <div className="space-y-2">
                        {(formData.projects || []).map((project, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={project}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "projects",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Projektbeschreibung"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRemoveArrayItem("projects", index)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddArrayItem("projects")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Projekt hinzufügen
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>
                        Publikationen/Vorträge (können gelöscht werden)
                      </Label>
                      <div className="space-y-2">
                        {(formData.publications || []).map((pub, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={pub}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "publications",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Titel der Publikation/des Vortrags"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRemoveArrayItem("publications", index)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddArrayItem("publications")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Publikation hinzufügen
                        </Button>
                      </div>
                    </div>
                  </TabsContent>{" "}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    Wählen Sie einen Experten aus der Liste oder erstellen Sie
                    einen neuen.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
