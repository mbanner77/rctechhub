"use client"

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  PlusCircle as Plus,
  Save,
  BookOpen as Book,
  Archive,
  Trash,
  Upload as UploadCloud,
  Monitor,
  Database,
  BarChart2,
  Cloud,
  RefreshCcw as RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitCard } from "@/types/unit-cards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { predefinedTags } from "@/data/predefined-tags";
import RichTextEditor from "@/components/admin/rich-text-editor";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useExperts } from "@/hooks/use-experts";
import UnitCardTabs from "@/components/admin/tabs/unit-card-tabs";

export default function UcEditor() {
    const [isLoading, setIsLoading] = useState(true);
    const [unitCards, setUnitCards] = useState<UnitCard[]>([]);
    const [filteredUnitCards, setFilteredUnitCards] = useState<UnitCard[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [selectedUnitCard, setSelectedUnitCard] = useState<UnitCard | null>(null);
    const [formData, setFormData] = useState<Partial<UnitCard>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<number | null>(null);
    const { toast } = useToast();
    const { experts } = useExperts();

    const categoryOptions = [
        { value: "core-systems", label: "Core Systems", icon: <Monitor className="h-4 w-4 mr-2" /> },
        { value: "integration", label: "Integration", icon: <RefreshCw className="h-4 w-4 mr-2" /> },
        { value: "data-analytics", label: "Data & Analytics", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
        { value: "cloud-platform", label: "Cloud & Platform", icon: <Cloud className="h-4 w-4 mr-2" /> },
        { value: "transformation", label: "Transformation", icon: <Database className="h-4 w-4 mr-2" /> },
    ];

    useEffect(() => {
        const loadUnitCards = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/admin/unit-cards");
                if (response.ok) {
                    const data = await response.json();
                    setUnitCards(data);
                    setFilteredUnitCards(data);
                } else {
                    console.error("Failed to load UnitCards from Admin API")
                }
            } catch (error) {
                console.error("Error loading UnitCards:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadUnitCards();
    }, []);

    useEffect(() => {
        let filtered = unitCards;
        
        if (statusFilter === 'active') {
            filtered = unitCards.filter(card => card.active !== false);
        } else if (statusFilter === 'inactive') {
            filtered = unitCards.filter(card => card.active === false);
        }
        
        setFilteredUnitCards(filtered);
    }, [unitCards, statusFilter]);

    const handleSelectUnitCard = (uc: UnitCard) => {
        setSelectedUnitCard(uc);
        setFormData(uc);
    }

    const handleFormChange = (field: keyof UnitCard | 'contactPersonIds' | 'showContactPersons', value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleTagChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            e.preventDefault();
            const newTag = e.currentTarget.value.trim();
            const currentTags = formData.tags || [];
            
            if (!currentTags.includes(newTag) && predefinedTags.includes(newTag)) {
                handleFormChange('tags', [...currentTags, newTag]);
            }
            
            e.currentTarget.value = '';
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = (formData.tags || []).filter(tag => tag !== tagToRemove);
        handleFormChange('tags', updatedTags);
    }

    const validateFormData = () => {
        const errors = [];
        
        if (!formData.title || formData.title.trim().length < 3) {
            errors.push("Titel ist erforderlich und muss mindestens 3 Zeichen lang sein");
        }
        
        if (!formData.subtitle || formData.subtitle.trim().length < 3) {
            errors.push("Untertitel ist erforderlich und muss mindestens 3 Zeichen lang sein");
        }
        
        if (!formData.description || formData.description.trim().length < 10) {
            errors.push("Beschreibung ist erforderlich und muss mindestens 10 Zeichen lang sein");
        }
        
        if (!formData.category) {
            errors.push("Kategorie ist erforderlich");
        }
        
        if (!formData.slogan || formData.slogan.trim().length < 3) {
            errors.push("Slogan ist erforderlich und muss mindestens 3 Zeichen lang sein");
        }
        
        const invalidAdvantages = (formData.advantages || [])
            .filter(adv => typeof adv !== 'string' && (!adv.title || !adv.description));
        if (invalidAdvantages.length > 0) {
            errors.push("Alle Vorteile müssen einen Titel und eine Beschreibung haben");
        }
        
        const invalidChallenges = (formData.challenges || [])
            .filter(chal => typeof chal !== 'string' && (!chal.title || !chal.description));
        if (invalidChallenges.length > 0) {
            errors.push("Alle Herausforderungen müssen einen Titel und eine Beschreibung haben");
        }
        
        const invalidCaseStudies = (formData.caseStudies || [])
            .filter(cs => typeof cs !== 'string' && (!cs.title || !cs.description || !cs.client_name || !cs.category));
        if (invalidCaseStudies.length > 0) {
            errors.push("Alle Fallstudien müssen einen Titel, eine Beschreibung, einen Kundennamen und eine Kategorie haben");
        }
        
        const invalidResources = (formData.resources || [])
            .filter(res => typeof res !== 'string' && (!res.title || !res.description));
        if (invalidResources.length > 0) {
            errors.push("Alle Ressourcen müssen einen Titel und eine Beschreibung haben");
        }
        
        return errors;
    }

    const handleSave = async () => {
        const validationErrors = validateFormData();
        if (validationErrors.length > 0) {
            toast({
                title: "Validierungsfehler",
                description: (
                    <ul className="list-disc pl-4">
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                ),
                variant: "destructive",
            });
            return;
        }
        
        try {
            console.log("Saving form data:", formData);
            
            const preparedData = {
                ...formData,
                advantages: (formData.advantages || []).map(adv => 
                    typeof adv === 'string' ? { 
                        title: adv, 
                        description: '',
                        catchPhrase: ''
                    } : adv
                ),
                challenges: (formData.challenges || []).map(chal => 
                    typeof chal === 'string' ? { 
                        title: chal, 
                        description: '' 
                    } : chal
                ),
                approach: (formData.approach || []).map(app => 
                    typeof app === 'string' ? { 
                        title: app, 
                        description: '', 
                        steps: [] 
                    } : app
                ),
                caseStudies: (formData.caseStudies || []).map(cs => 
                    typeof cs === 'string' ? {
                        title: cs,
                        description: '',
                        client_name: '',
                        category: '',
                        tags: []
                    } : cs
                ),
                resources: (formData.resources || []).map(res =>
                    typeof res === 'string' ? {
                        title: res,
                        description: ''
                    } : res
                )
            };

            if (selectedUnitCard?.id) {
                const response = await fetch(`/api/data/unit-cards/${selectedUnitCard.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(preparedData)
                });
                
                if (response.ok) {
                    setUnitCards(prev => 
                        prev.map(card => card.id === selectedUnitCard.id ? { ...card, ...formData } : card)
                    );
                    toast({
                        title: "Erfolgreich gespeichert",
                        description: "Die Unit Card wurde erfolgreich aktualisiert.",
                        variant: "default",
                    });
                } else {
                    const errorText = await response.text();
                    console.error('Failed to update Unit Card:', response.status, errorText);
                    toast({
                        title: "Fehler beim Speichern",
                        description: `Die Unit Card konnte nicht aktualisiert werden: ${response.status} ${errorText}`,
                        variant: "destructive",
                    });
                }
            } else {
                const response = await fetch('/api/data/unit-cards', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(preparedData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const response = await fetch("/api/data/unit-cards");
                        if (response.ok) {
                            const data = await response.json();
                            setUnitCards(data);
                        }
                        setIsDialogOpen(false);
                        toast({
                            title: "Erfolgreich erstellt",
                            description: "Die neue Unit Card wurde erfolgreich erstellt.",
                            variant: "default",
                        });
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Failed to create Unit Card:', response.status, errorText);
                    toast({
                        title: "Fehler beim Erstellen",
                        description: `Die Unit Card konnte nicht erstellt werden: ${response.status} ${errorText}`,
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('Error saving Unit Card:', error);
            toast({
                title: "Fehler",
                description: `Fehler beim Speichern der Unit Card: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
        }
    }

    const handleDeleteClick = (id: number, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        setCardToDelete(id);
        setIsDeleteDialogOpen(true);
    }

    const handleDelete = async () => {
        if (!cardToDelete) return;
        
        try {
            const response = await fetch(`/api/data/unit-cards/${cardToDelete}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setUnitCards(prev => prev.filter(card => card.id !== cardToDelete));
                if (selectedUnitCard?.id === cardToDelete) {
                    setSelectedUnitCard(null);
                    setFormData({});
                }
                toast({
                    title: "Erfolgreich gelöscht",
                    description: "Die Unit Card wurde erfolgreich gelöscht.",
                    variant: "default",
                });
            } else {
                console.error('Failed to delete Unit Card');
                toast({
                    title: "Fehler beim Löschen",
                    description: "Die Unit Card konnte nicht gelöscht werden.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting Unit Card:', error);
            toast({
                title: "Fehler",
                description: `Fehler beim Löschen der Unit Card: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setCardToDelete(null);
        }
    }

    const handleAddNewCard = () => {
        setSelectedUnitCard(null);
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            tags: [],
            category: '',
            image: '',
            introduction: '',
            slogan: '',
            quote: '',
            heroImage: '',
            backgroundPattern: '/tech-pattern-blue.png',
            expertIds: [],
            contactPersonIds: [],
            showContactPersons: false,
            active: true, // New Unit Cards default to active
            advantages: [],
            challenges: [],
            caseStudies: [],
            approach: [],
            resources: []
        } as any);
        setIsDialogOpen(true);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg">Lade UnitCards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 mb-6">
                <Button
                    onClick={handleAddNewCard}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Neue Unit-Card
                </Button>
                
                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="text-sm">Filter:</Label>
                    <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status filtern" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle anzeigen</SelectItem>
                            <SelectItem value="active">Nur aktive</SelectItem>
                            <SelectItem value="inactive">Nur inaktive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            {/* UC List and Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Liste der Unit-Cards</span>
                                <div className="text-sm font-normal text-gray-500">
                                    {filteredUnitCards.length} von {unitCards.length}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[800px] overflow-y-auto">
                                {filteredUnitCards.length === 0 ? (
                                    <div className="text-center p-4 text-gray-500">
                                        <p>
                                            {statusFilter === 'all' ? 'Keine Unit-Cards vorhanden' : 
                                             statusFilter === 'active' ? 'Keine aktiven Unit-Cards vorhanden' :
                                             'Keine inaktiven Unit-Cards vorhanden'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredUnitCards.map((uc) => (
                                        <div
                                            key={uc.id}
                                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                                selectedUnitCard?.id === uc.id ? "bg-blue-50 border-blue-300" : ""
                                            }`}
                                            onClick={() => handleSelectUnitCard(uc)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-shrink-0">
                                                    {uc.image ? (
                                                        <Image
                                                            src={uc.image}
                                                            alt={uc.title}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <Book className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">{uc.title}</div>
                                                        {uc.active === false && (
                                                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                                                Inaktiv
                                                            </Badge>
                                                        )}
                                                        {uc.active !== false && (
                                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                                Aktiv
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {uc.category && (
                                                            <Badge variant="outline" className="mr-1">
                                                                {uc.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (uc.id) handleDeleteClick(uc.id, e);
                                                    }}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-2">
                    {selectedUnitCard || isDialogOpen ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedUnitCard ? "Edit Unit Card" : "New Unit Card"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="details">Zusätzliche Details</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="title" className="mb-2 block">
                                                    Title
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={formData.title || ''}
                                                    onChange={(e) => handleFormChange("title", e.target.value)}
                                                    placeholder="Enter title"
                                                    className="mb-4"
                                                />

                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Switch
                                                        id="active"
                                                        checked={formData.active !== false}
                                                        onCheckedChange={(checked) => handleFormChange("active", checked)}
                                                    />
                                                    <Label htmlFor="active" className="text-sm font-medium">
                                                        Aktiv (Auf Pathfinder-Seite anzeigen)
                                                    </Label>
                                                </div>

                                                <Label htmlFor="subtitle" className="mb-2 block">
                                                    Subtitle
                                                </Label>
                                                <Input
                                                    id="subtitle"
                                                    value={formData.subtitle || ''}
                                                    onChange={(e) => handleFormChange("subtitle", e.target.value)}
                                                    placeholder="Enter subtitle"
                                                    className="mb-4"
                                                />

                                                <Label htmlFor="description" className="mb-2 block">
                                                    Description (Rich Text)
                                                </Label>
                                                <RichTextEditor
                                                    id="description"
                                                    value={formData.description || ''}
                                                    onChange={(html) => handleFormChange("description", html)}
                                                    placeholder="Beschreibe die Unit (Überschriften, Listen, Links)"
                                                />

                                                <Label htmlFor="category" className="mb-2 block">
                                                    Category
                                                </Label>
                                                <Select
                                                    value={formData.category || ''}
                                                    onValueChange={(value) => handleFormChange("category", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                <div className="flex items-center">
                                                                    {option.icon}
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="slogan" className="mb-2 block">
                                                    Intro-text / Slogan
                                                </Label>
                                                <Input
                                                    id="slogan"
                                                    value={formData.slogan || ''}
                                                    onChange={(e) => handleFormChange("slogan", e.target.value)}
                                                    placeholder="Enter slogan"
                                                    className="mb-4"
                                                />

                                                <Label htmlFor="introduction" className="mb-2 block">
                                                    Einleitung (Rich Text)
                                                </Label>
                                                <RichTextEditor
                                                    id="introduction"
                                                    value={formData.introduction || ''}
                                                    onChange={(html) => handleFormChange("introduction", html)}
                                                    placeholder="Kurze Einleitung/Intro für die Detailseite"
                                                />

                                                <Label htmlFor="image" className="mb-2 block">
                                                    Image URL
                                                </Label>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Input
                                                        id="image"
                                                        value={formData.image || ''}
                                                        onChange={(e) => handleFormChange("image", e.target.value)}
                                                        placeholder="Enter image URL"
                                                        className="flex-1"
                                                    />
                                                    {formData.image && (
                                                        <div className="w-10 h-10 shrink-0">
                                                            <Image
                                                                src={formData.image}
                                                                alt="Preview"
                                                                width={40}
                                                                height={40}
                                                                className="rounded object-cover w-10 h-10"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <Label htmlFor="tags" className="mb-2 block">
                                                    Tags (Choose from predefined list)
                                                </Label>
                                                <div className="space-y-4">
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const currentTags = formData.tags || [];
                                                            if (!currentTags.includes(value)) {
                                                                handleFormChange('tags', [...currentTags, value]);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tag" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {predefinedTags
                                                                .filter(tag => !(formData.tags || []).includes(tag))
                                                                .map(tag => (
                                                                    <SelectItem key={tag} value={tag}>
                                                                        {tag}
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {(formData.tags || []).map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                                className="px-2 py-1 flex items-center gap-1"
                                                            >
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    className="ml-1 rounded-full hover:bg-gray-200 p-1"
                                                                    onClick={() => handleRemoveTag(tag)}
                                                                >
                                                                    ×
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact persons section */}
                                            <div className="border-t pt-4 mt-4">
                                                <Label className="mb-2 block text-lg font-semibold">
                                                    Ansprechpartner verwalten
                                                </Label>
                                                <div className="space-y-3">
                                                    <Select
                                                        value=""
                                                        onValueChange={(value) => {
                                                            if (value) {
                                                                const currentIds = (formData as any).contactPersonIds || [];
                                                                if (!currentIds.includes(value)) {
                                                                    handleFormChange("contactPersonIds", [...currentIds, value]);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Ansprechpartner hinzufügen" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {experts
                                                                .filter(expert => expert.isContactPerson)
                                                                .filter(expert => !((formData as any).contactPersonIds || []).includes(expert.id))
                                                                .map(expert => (
                                                                    <SelectItem key={expert.id} value={expert.id}>
                                                                        {expert.firstName} {expert.name} ({expert.role})
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    <div className="space-y-2">
                                                        {((formData as any).contactPersonIds || []).map((contactId: string) => {
                                                            const expert = experts.find(e => e.id === contactId);
                                                            return expert ? (
                                                                <div key={contactId} className="flex items-center justify-between p-2 border rounded-md bg-blue-50">
                                                                    <span className="text-sm font-medium">
                                                                        👤 {expert.firstName} {expert.name} 
                                                                        <span className="text-gray-600 ml-1">({expert.role})</span>
                                                                    </span>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const currentIds = (formData as any).contactPersonIds || [];
                                                                            const newIds = currentIds.filter((id: string) => id !== contactId);
                                                                            handleFormChange("contactPersonIds", newIds);
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>

                                                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                                        <input
                                                            type="checkbox"
                                                            id="showContactPersons"
                                                            checked={(formData as any).showContactPersons || false}
                                                            onChange={(e) => {
                                                                handleFormChange("showContactPersons", e.target.checked);
                                                            }}
                                                        />
                                                        <Label htmlFor="showContactPersons" className="font-medium">
                                                            Ansprechpartner im Pathfinder anzeigen
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="details" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label htmlFor="introduction" className="mb-2 block">
                                                    Introduction
                                                </Label>
                                                <Textarea
                                                    id="introduction"
                                                    value={formData.introduction || ''}
                                                    onChange={(e) => handleFormChange("introduction", e.target.value)}
                                                    placeholder="Enter detailed introduction"
                                                    className="mb-4"
                                                    rows={3}
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="quote" className="mb-2 block">
                                                    Quote (appears at top of detail page)
                                                </Label>
                                                <Textarea
                                                    id="quote"
                                                    value={formData.quote || ''}
                                                    onChange={(e) => handleFormChange("quote", e.target.value)}
                                                    placeholder="Enter an inspiring quote"
                                                    className="mb-4"
                                                    rows={2}
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="heroImage" className="mb-2 block">
                                                    Hero Image URL (for detail page)
                                                </Label>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Input
                                                        id="heroImage"
                                                        value={formData.heroImage || ''}
                                                        onChange={(e) => handleFormChange("heroImage", e.target.value)}
                                                        placeholder="Enter hero image URL"
                                                        className="flex-1"
                                                    />
                                                    {formData.heroImage && (
                                                        <div className="w-10 h-10 shrink-0">
                                                            <Image
                                                                src={formData.heroImage}
                                                                alt="Preview"
                                                                width={40}
                                                                height={40}
                                                                className="rounded object-cover w-10 h-10"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 border-t pt-6">
                                                <h3 className="text-lg font-medium mb-4">Unit Card Abschnitte</h3>
                                                
                                                <div className="mt-4">
                                                    <Suspense fallback={<div>Lade Unit Card Tabs...</div>}>
                                                        <UnitCardTabs formData={formData} onFormChange={handleFormChange} />
                                                    </Suspense>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="expertIds" className="mb-2 block">
                                                    Experten IDs (comma separated)
                                                </Label>
                                                <Input
                                                    id="expertIds"
                                                    value={(formData.expertIds || []).join(',')}
                                                    onChange={(e) => {
                                                        const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean);
                                                        handleFormChange("expertIds", ids);
                                                    }}
                                                    placeholder="e.g. 1,2,3"
                                                    className="mb-2"
                                                />
                                                <div className="text-sm text-gray-600 mb-4">
                                                    <strong>Verfügbare Experten:</strong>
                                                    <div className="mt-1">
                                                        {experts
                                                            .filter(expert => !expert.isContactPerson)
                                                            .map(expert => (
                                                                <div key={expert.id} className="inline-block mr-4 mb-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {expert.id}: {expert.firstName} {expert.name}
                                                                    </Badge>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end mt-6 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            if (!selectedUnitCard) {
                                                setFormData({});
                                            }
                                        }}
                                        className="border-gray-300 hover:bg-gray-100"
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {selectedUnitCard ? "Speichern" : "Erstellen"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center text-gray-500">
                                    <Archive className="h-12 w-12 mx-auto mb-4" />
                                    <p>
                                        Wählen Sie eine UnitCard aus der Liste oder erstellen Sie
                                        einen neue.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unit Card löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sind Sie sicher, dass Sie diese Unit Card löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
