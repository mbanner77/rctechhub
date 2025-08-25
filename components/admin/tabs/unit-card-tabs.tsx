"use client"

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UnitCard, Advantage, Challenge, CaseStudy, Resource } from "@/types/unit-cards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle as Plus } from "lucide-react";

interface UnitCardTabsProps {
  formData: Partial<UnitCard>;
  onFormChange: (field: keyof UnitCard, value: any) => void;
}

export default function UnitCardTabs({ formData, onFormChange }: UnitCardTabsProps) {
  // Definiere alle Hooks am Anfang der Komponente
  // Hooks für Übersicht-Tab
  const [isAddAdvantageDialogOpen, setIsAddAdvantageDialogOpen] = useState(false);
  const [isEditAdvantageDialogOpen, setIsEditAdvantageDialogOpen] = useState<number | null>(null);
  const [isAddChallengeDialogOpen, setIsAddChallengeDialogOpen] = useState(false);
  const [isEditChallengeDialogOpen, setIsEditChallengeDialogOpen] = useState<number | null>(null);
  
  // Hooks für Vorgehen-Tab
  const [isAddApproachDialogOpen, setIsAddApproachDialogOpen] = useState(false);
  const [isEditApproachDialogOpen, setIsEditApproachDialogOpen] = useState<number | null>(null);
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState<number | null>(null);
  const [isEditStepDialogOpen, setIsEditStepDialogOpen] = useState<{approachIndex: number, stepIndex: number} | null>(null);
  
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="approach">Vorgehen</TabsTrigger>
        <TabsTrigger value="casestudies">Fallstudien</TabsTrigger>
        <TabsTrigger value="resources">Ressourcen</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-6">
        <div className="space-y-6">
          {/* Advantages Section */}
          <div>
            <Label className="mb-2 block">Advantages (Vorteile)</Label>
            <div className="space-y-4 mb-4">
              <Dialog open={isAddAdvantageDialogOpen} onOpenChange={setIsAddAdvantageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Advantage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Advantage</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const title = (form.elements.namedItem('adv-title') as HTMLInputElement).value;
                    const description = (form.elements.namedItem('adv-description') as HTMLTextAreaElement).value;
                    const catchPhrase = (form.elements.namedItem('adv-catchphrase') as HTMLInputElement).value;
                    
                    if (title && description) {
                      const newAdvantage = {
                        title,
                        description,
                        catchPhrase: catchPhrase || undefined
                      };
                      
                      const currentAdvantages = formData.advantages || [];
                      onFormChange('advantages', [...currentAdvantages, newAdvantage]);
                      form.reset();
                      setIsAddAdvantageDialogOpen(false);
                    }
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="adv-title">Title</Label>
                        <Input id="adv-title" name="adv-title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adv-description">Description</Label>
                        <Textarea id="adv-description" name="adv-description" required rows={3} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adv-catchphrase">Catch Phrase</Label>
                        <Input id="adv-catchphrase" name="adv-catchphrase" placeholder="A catchy phrase (optional)" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddAdvantageDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <div className="space-y-2 mt-4">
                {(formData.advantages || []).map((advantage, index) => {
                  const advObj = typeof advantage === 'string' 
                    ? { title: advantage, description: '' } 
                    : advantage;
                    
                  return (
                    <div key={index} className="border rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{advObj.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{advObj.description}</p>
                          {advObj.catchPhrase && (
                            <p className="text-sm italic mt-1 text-blue-600">
                              "{advObj.catchPhrase}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog
                            open={isEditAdvantageDialogOpen === index}
                            onOpenChange={(open) => setIsEditAdvantageDialogOpen(open ? index : null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Advantage</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const title = (form.elements.namedItem('adv-edit-title') as HTMLInputElement).value;
                                const description = (form.elements.namedItem('adv-edit-description') as HTMLTextAreaElement).value;
                                const catchPhrase = (form.elements.namedItem('adv-edit-catchphrase') as HTMLInputElement).value;
                                
                                if (title && description) {
                                  const updatedAdvantage = {
                                    title,
                                    description,
                                    catchPhrase: catchPhrase || undefined
                                  };
                                  
                                  const updatedAdvantages = [...(formData.advantages || [])];
                                  updatedAdvantages[index] = updatedAdvantage;
                                  onFormChange('advantages', updatedAdvantages);
                                  
                                  setIsEditAdvantageDialogOpen(null);
                                }
                              }}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="adv-edit-title">Title</Label>
                                    <Input 
                                      id="adv-edit-title" 
                                      name="adv-edit-title" 
                                      defaultValue={advObj.title}
                                      required 
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="adv-edit-description">Description</Label>
                                    <Textarea 
                                      id="adv-edit-description" 
                                      name="adv-edit-description" 
                                      defaultValue={advObj.description}
                                      required 
                                      rows={3} 
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="adv-edit-catchphrase">Catch Phrase</Label>
                                    <Input 
                                      id="adv-edit-catchphrase" 
                                      name="adv-edit-catchphrase" 
                                      defaultValue={advObj.catchPhrase || ''}
                                      placeholder="A catchy phrase (optional)" 
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setIsEditAdvantageDialogOpen(null)}>
                                    Abbrechen
                                  </Button>
                                  <Button type="submit">Save Changes</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const newAdvantages = [...(formData.advantages || [])];
                              newAdvantages.splice(index, 1);
                              onFormChange('advantages', newAdvantages);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Challenges Section */}
          <div>
            <Label className="mb-2 block">Challenges (Herausforderungen)</Label>
            <div className="space-y-4 mb-4">
              <Dialog open={isAddChallengeDialogOpen} onOpenChange={setIsAddChallengeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Challenge</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const title = (form.elements.namedItem('challenge-title') as HTMLInputElement).value;
                    const description = (form.elements.namedItem('challenge-description') as HTMLTextAreaElement).value;
                    
                    if (title && description) {
                      const newChallenge = {
                        title,
                        description
                      };
                      
                      const currentChallenges = formData.challenges || [];
                      onFormChange('challenges', [...currentChallenges, newChallenge]);
                      form.reset();
                      setIsAddChallengeDialogOpen(false);
                    }
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="challenge-title">Title</Label>
                        <Input id="challenge-title" name="challenge-title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="challenge-description">Description</Label>
                        <Textarea id="challenge-description" name="challenge-description" required rows={3} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddChallengeDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <div className="space-y-2 mt-4">
                {(formData.challenges || []).map((challenge, index) => {
                  const chalObj = typeof challenge === 'string' 
                    ? { title: challenge, description: '' } 
                    : challenge;
                    
                  return (
                    <div key={index} className="border rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{chalObj.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{chalObj.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog
                            open={isEditChallengeDialogOpen === index}
                            onOpenChange={(open) => setIsEditChallengeDialogOpen(open ? index : null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Challenge</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const title = (form.elements.namedItem('challenge-edit-title') as HTMLInputElement).value;
                                const description = (form.elements.namedItem('challenge-edit-description') as HTMLTextAreaElement).value;
                                
                                if (title && description) {
                                  const updatedChallenge = {
                                    title,
                                    description
                                  };
                                  
                                  const updatedChallenges = [...(formData.challenges || [])];
                                  updatedChallenges[index] = updatedChallenge;
                                  onFormChange('challenges', updatedChallenges);
                                  
                                  setIsEditChallengeDialogOpen(null);
                                }
                              }}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="challenge-edit-title">Title</Label>
                                    <Input 
                                      id="challenge-edit-title" 
                                      name="challenge-edit-title" 
                                      defaultValue={chalObj.title}
                                      required 
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="challenge-edit-description">Description</Label>
                                    <Textarea 
                                      id="challenge-edit-description" 
                                      name="challenge-edit-description" 
                                      defaultValue={chalObj.description}
                                      required 
                                      rows={3} 
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setIsEditChallengeDialogOpen(null)}>
                                    Abbrechen
                                  </Button>
                                  <Button type="submit">Save Changes</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const newChallenges = [...(formData.challenges || [])];
                              newChallenges.splice(index, 1);
                              onFormChange('challenges', newChallenges);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="casestudies" className="mt-4">
        <div>
          <Label className="mb-2 block">Fallstudien (Case Studies)</Label>
          <div className="space-y-4 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Fallstudie hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Fallstudie hinzufügen</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.elements.namedItem('cs-title') as HTMLInputElement).value;
                  const description = (form.elements.namedItem('cs-description') as HTMLTextAreaElement).value;
                  const client_name = (form.elements.namedItem('cs-client') as HTMLInputElement).value;
                  const category = (form.elements.namedItem('cs-category') as HTMLInputElement).value;
                  const industry = (form.elements.namedItem('cs-industry') as HTMLInputElement).value;
                  
                  if (title && description && client_name && category) {
                    const newCaseStudy = {
                      id: `cs-${Date.now()}`,
                      title,
                      description,
                      client_name,
                      category,
                      industry: industry || undefined,
                      tags: []
                    };
                    
                    const currentCaseStudies = formData.caseStudies || [];
                    onFormChange('caseStudies', [...currentCaseStudies, newCaseStudy]);
                    form.reset();
                    const closeButton = document.querySelector('[data-close-dialog]');
                    if (closeButton) (closeButton as HTMLButtonElement).click();
                  }
                }}>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cs-title">Titel</Label>
                      <Input id="cs-title" name="cs-title" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cs-client">Kunde</Label>
                      <Input id="cs-client" name="cs-client" required />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="cs-description">Beschreibung</Label>
                      <Textarea id="cs-description" name="cs-description" required rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cs-category">Kategorie</Label>
                      <Input id="cs-category" name="cs-category" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cs-industry">Branche</Label>
                      <Input id="cs-industry" name="cs-industry" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Hinzufügen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <div className="space-y-3 mt-4">
              {(formData.caseStudies || []).map((caseStudy, index) => (
                <div key={caseStudy.id || index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{caseStudy.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{caseStudy.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{caseStudy.client_name}</Badge>
                        <Badge variant="outline">{caseStudy.category}</Badge>
                        {caseStudy.industry && <Badge variant="outline">{caseStudy.industry}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Bearbeiten
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Fallstudie bearbeiten</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('cs-edit-title') as HTMLInputElement).value;
                            const description = (form.elements.namedItem('cs-edit-description') as HTMLTextAreaElement).value;
                            const client_name = (form.elements.namedItem('cs-edit-client') as HTMLInputElement).value;
                            const category = (form.elements.namedItem('cs-edit-category') as HTMLInputElement).value;
                            const industry = (form.elements.namedItem('cs-edit-industry') as HTMLInputElement).value;
                            
                            if (title && description && client_name && category) {
                              const updatedCaseStudy = {
                                ...caseStudy,
                                title,
                                description,
                                client_name,
                                category,
                                industry: industry || undefined
                              };
                              
                              const updatedCaseStudies = [...(formData.caseStudies || [])];
                              updatedCaseStudies[index] = updatedCaseStudy;
                              onFormChange('caseStudies', updatedCaseStudies);
                              
                              const closeButton = document.querySelector('[data-close-dialog]');
                              if (closeButton) (closeButton as HTMLButtonElement).click();
                            }
                          }}>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="cs-edit-title">Titel</Label>
                                <Input 
                                  id="cs-edit-title" 
                                  name="cs-edit-title" 
                                  defaultValue={caseStudy.title}
                                  required 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="cs-edit-client">Kunde</Label>
                                <Input 
                                  id="cs-edit-client" 
                                  name="cs-edit-client" 
                                  defaultValue={caseStudy.client_name}
                                  required 
                                />
                              </div>
                              <div className="grid gap-2 col-span-2">
                                <Label htmlFor="cs-edit-description">Beschreibung</Label>
                                <Textarea 
                                  id="cs-edit-description" 
                                  name="cs-edit-description" 
                                  defaultValue={caseStudy.description}
                                  required 
                                  rows={3} 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="cs-edit-category">Kategorie</Label>
                                <Input 
                                  id="cs-edit-category" 
                                  name="cs-edit-category" 
                                  defaultValue={caseStudy.category}
                                  required 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="cs-edit-industry">Branche</Label>
                                <Input 
                                  id="cs-edit-industry" 
                                  name="cs-edit-industry" 
                                  defaultValue={caseStudy.industry || ''}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button type="submit">Änderungen speichern</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const newCaseStudies = [...(formData.caseStudies || [])];
                          newCaseStudies.splice(index, 1);
                          onFormChange('caseStudies', newCaseStudies);
                        }}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="resources" className="mt-4">
        <div>
          <Label className="mb-2 block">Ressourcen (Resources)</Label>
          <div className="space-y-4 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ressource hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ressource hinzufügen</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.elements.namedItem('res-title') as HTMLInputElement).value;
                  const description = (form.elements.namedItem('res-description') as HTMLTextAreaElement).value;
                  const duration = (form.elements.namedItem('res-duration') as HTMLInputElement).value;
                  const format = (form.elements.namedItem('res-format') as HTMLInputElement).value;
                  const price = (form.elements.namedItem('res-price') as HTMLInputElement).value;
                  const pdf = (form.elements.namedItem('res-pdf') as HTMLInputElement).value;
                  
                  if (title && description) {
                    const newResource = {
                      title,
                      description,
                      duration: duration || undefined,
                      format: format || undefined,
                      price: price || undefined,
                      pdf: pdf || undefined
                    };
                    
                    const currentResources = formData.resources || [];
                    onFormChange('resources', [...currentResources, newResource]);
                    form.reset();
                    const closeButton = document.querySelector('[data-close-dialog]');
                    if (closeButton) (closeButton as HTMLButtonElement).click();
                  }
                }}>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="res-title">Titel</Label>
                      <Input id="res-title" name="res-title" required />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="res-description">Beschreibung</Label>
                      <Textarea id="res-description" name="res-description" required rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="res-duration">Dauer</Label>
                      <Input id="res-duration" name="res-duration" placeholder="z.B. 2 Stunden" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="res-format">Format</Label>
                      <Input id="res-format" name="res-format" placeholder="z.B. Workshop, Webinar" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="res-price">Preis</Label>
                      <Input id="res-price" name="res-price" placeholder="z.B. €500, Kostenlos" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="res-pdf">PDF Link</Label>
                      <Input id="res-pdf" name="res-pdf" placeholder="Link zu einem PDF-Dokument" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Hinzufügen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <div className="space-y-3 mt-4">
              {(formData.resources || []).map((resource, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resource.format && <Badge variant="outline">{resource.format}</Badge>}
                        {resource.duration && <Badge variant="outline">{resource.duration}</Badge>}
                        {resource.price && <Badge variant="outline">{resource.price}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Bearbeiten
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Ressource bearbeiten</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('res-edit-title') as HTMLInputElement).value;
                            const description = (form.elements.namedItem('res-edit-description') as HTMLTextAreaElement).value;
                            const duration = (form.elements.namedItem('res-edit-duration') as HTMLInputElement).value;
                            const format = (form.elements.namedItem('res-edit-format') as HTMLInputElement).value;
                            const price = (form.elements.namedItem('res-edit-price') as HTMLInputElement).value;
                            const pdf = (form.elements.namedItem('res-edit-pdf') as HTMLInputElement).value;
                            
                            if (title && description) {
                              const updatedResource = {
                                title,
                                description,
                                duration: duration || undefined,
                                format: format || undefined,
                                price: price || undefined,
                                pdf: pdf || undefined
                              };
                              
                              const updatedResources = [...(formData.resources || [])];
                              updatedResources[index] = updatedResource;
                              onFormChange('resources', updatedResources);
                              
                              const closeButton = document.querySelector('[data-close-dialog]');
                              if (closeButton) (closeButton as HTMLButtonElement).click();
                            }
                          }}>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="grid gap-2 col-span-2">
                                <Label htmlFor="res-edit-title">Titel</Label>
                                <Input 
                                  id="res-edit-title" 
                                  name="res-edit-title" 
                                  defaultValue={resource.title}
                                  required 
                                />
                              </div>
                              <div className="grid gap-2 col-span-2">
                                <Label htmlFor="res-edit-description">Beschreibung</Label>
                                <Textarea 
                                  id="res-edit-description" 
                                  name="res-edit-description" 
                                  defaultValue={resource.description}
                                  required 
                                  rows={3} 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="res-edit-duration">Dauer</Label>
                                <Input 
                                  id="res-edit-duration" 
                                  name="res-edit-duration" 
                                  defaultValue={resource.duration || ''}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="res-edit-format">Format</Label>
                                <Input 
                                  id="res-edit-format" 
                                  name="res-edit-format" 
                                  defaultValue={resource.format || ''}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="res-edit-price">Preis</Label>
                                <Input 
                                  id="res-edit-price" 
                                  name="res-edit-price" 
                                  defaultValue={resource.price || ''}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="res-edit-pdf">PDF Link</Label>
                                <Input 
                                  id="res-edit-pdf" 
                                  name="res-edit-pdf" 
                                  defaultValue={resource.pdf || ''}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button type="submit">Änderungen speichern</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const newResources = [...(formData.resources || [])];
                          newResources.splice(index, 1);
                          onFormChange('resources', newResources);
                        }}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="approach" className="mt-4">
        <div>
          <Label className="mb-2 block">Vorgehen (Approach)</Label>
          <div className="space-y-4 mb-4">
            {/* Only show the add button if there is no approach section yet */}
            {(!formData.approach || formData.approach.length === 0) && (
              <Dialog open={isAddApproachDialogOpen} onOpenChange={setIsAddApproachDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Vorgehen hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Vorgehen hinzufügen</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const title = (form.elements.namedItem('approach-title') as HTMLInputElement).value;
                    const description = (form.elements.namedItem('approach-description') as HTMLTextAreaElement).value;
                    
                    if (title && description) {
                      const newApproach = {
                        title,
                        description,
                        steps: []
                      };
                      
                      // Just set the approach directly, don't append to an array
                      onFormChange('approach', [newApproach]);
                      form.reset();
                      // Dialog schließen
                      setIsAddApproachDialogOpen(false);
                    }
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="approach-title">Titel</Label>
                        <Input id="approach-title" name="approach-title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="approach-description">Beschreibung</Label>
                        <Textarea id="approach-description" name="approach-description" required rows={3} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddApproachDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit">Hinzufügen</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
            <div className="space-y-3 mt-4">
              {(formData.approach || []).map((approach, approachIndex) => (
                <div key={approachIndex} className="border rounded-md p-4 bg-gray-50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{approach.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{approach.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog 
                        open={isEditApproachDialogOpen === approachIndex} 
                        onOpenChange={(open) => setIsEditApproachDialogOpen(open ? approachIndex : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Bearbeiten
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Vorgehen bearbeiten</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('approach-edit-title') as HTMLInputElement).value;
                            const description = (form.elements.namedItem('approach-edit-description') as HTMLTextAreaElement).value;
                            
                            if (title && description) {
                              const updatedApproach = {
                                ...approach,
                                title,
                                description
                              };
                              
                              // Update only the current approach (there should only be one)
                              onFormChange('approach', [updatedApproach]);
                              
                              // Dialog schließen
                              setIsEditApproachDialogOpen(null);
                            }
                          }}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="approach-edit-title">Titel</Label>
                                <Input 
                                  id="approach-edit-title" 
                                  name="approach-edit-title" 
                                  defaultValue={approach.title}
                                  required 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="approach-edit-description">Beschreibung</Label>
                                <Textarea 
                                  id="approach-edit-description" 
                                  name="approach-edit-description" 
                                  defaultValue={approach.description}
                                  required 
                                  rows={3} 
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsEditApproachDialogOpen(null)}>
                                Abbrechen
                              </Button>
                              <Button type="submit">Änderungen speichern</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          // Clear the approach completely
                          onFormChange('approach', []);
                        }}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                  
                  {/* Steps within this approach */}
                  <div className="mt-4 ml-4 border-l-2 border-gray-300 pl-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-sm">Schritte</h5>
                      <Dialog 
                        open={isAddStepDialogOpen === approachIndex} 
                        onOpenChange={(open) => setIsAddStepDialogOpen(open ? approachIndex : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Schritt hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Schritt hinzufügen</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('step-title') as HTMLInputElement).value;
                            const description = (form.elements.namedItem('step-description') as HTMLTextAreaElement).value;
                            const activitiesRaw = (form.elements.namedItem('step-activities') as HTMLTextAreaElement).value;
                            const resultsRaw = (form.elements.namedItem('step-results') as HTMLTextAreaElement).value;
                            
                            // Split activities and results by new line
                            const activities = activitiesRaw.split('\n').filter(item => item.trim().length > 0);
                            const results = resultsRaw.split('\n').filter(item => item.trim().length > 0);
                            
                            if (title && description) {
                              const newStep = {
                                title,
                                description,
                                activities,
                                results
                              };
                              
                              const updatedApproach = {...approach};
                              updatedApproach.steps = [...(updatedApproach.steps || []), newStep];
                              
                              const updatedApproaches = [...(formData.approach || [])];
                              updatedApproaches[approachIndex] = updatedApproach;
                              onFormChange('approach', updatedApproaches);
                              
                              form.reset();
                              // Dialog schließen
                              setIsAddStepDialogOpen(null);
                            }
                          }}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="step-title">Titel</Label>
                                <Input id="step-title" name="step-title" required />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="step-description">Beschreibung</Label>
                                <Textarea id="step-description" name="step-description" required rows={2} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="step-activities">Aktivitäten (eine pro Zeile)</Label>
                                <Textarea id="step-activities" name="step-activities" rows={3} placeholder="Aktivität 1&#10;Aktivität 2" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="step-results">Ergebnisse (eines pro Zeile)</Label>
                                <Textarea id="step-results" name="step-results" rows={3} placeholder="Ergebnis 1&#10;Ergebnis 2" />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsAddStepDialogOpen(null)}>
                                Abbrechen
                              </Button>
                              <Button type="submit">Schritt hinzufügen</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="space-y-3">
                      {(approach.steps || []).map((step, stepIndex) => (
                        <div key={stepIndex} className="border rounded-md p-3 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium text-sm">{step.title}</h6>
                              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                              
                              {step.activities && step.activities.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium">Aktivitäten:</p>
                                  <ul className="text-xs list-disc list-inside pl-2">
                                    {step.activities.map((activity, i) => (
                                      <li key={i}>{activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {step.results && step.results.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium">Ergebnisse:</p>
                                  <ul className="text-xs list-disc list-inside pl-2">
                                    {step.results.map((result, i) => (
                                      <li key={i}>{result}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Dialog 
                                open={isEditStepDialogOpen !== null && 
                                      isEditStepDialogOpen.approachIndex === approachIndex && 
                                      isEditStepDialogOpen.stepIndex === stepIndex} 
                                onOpenChange={(open) => setIsEditStepDialogOpen(
                                  open ? {approachIndex, stepIndex} : null
                                )}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-xs">
                                    Bearbeiten
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Schritt bearbeiten</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const title = (form.elements.namedItem('step-edit-title') as HTMLInputElement).value;
                                    const description = (form.elements.namedItem('step-edit-description') as HTMLTextAreaElement).value;
                                    const activitiesRaw = (form.elements.namedItem('step-edit-activities') as HTMLTextAreaElement).value;
                                    const resultsRaw = (form.elements.namedItem('step-edit-results') as HTMLTextAreaElement).value;
                                    
                                    // Split activities and results by new line
                                    const activities = activitiesRaw.split('\n').filter(item => item.trim().length > 0);
                                    const results = resultsRaw.split('\n').filter(item => item.trim().length > 0);
                                    
                                    if (title && description) {
                                      const updatedStep = {
                                        ...step,
                                        title,
                                        description,
                                        activities,
                                        results
                                      };
                                      
                                      const updatedApproach = {...approach};
                                      const updatedSteps = [...(updatedApproach.steps || [])];
                                      updatedSteps[stepIndex] = updatedStep;
                                      updatedApproach.steps = updatedSteps;
                                      
                                      const updatedApproaches = [...(formData.approach || [])];
                                      updatedApproaches[approachIndex] = updatedApproach;
                                      onFormChange('approach', updatedApproaches);
                                      
                                      // Dialog schließen
                                      setIsEditStepDialogOpen(null);
                                    }
                                  }}>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="step-edit-title">Titel</Label>
                                        <Input 
                                          id="step-edit-title" 
                                          name="step-edit-title" 
                                          defaultValue={step.title}
                                          required 
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="step-edit-description">Beschreibung</Label>
                                        <Textarea 
                                          id="step-edit-description" 
                                          name="step-edit-description" 
                                          defaultValue={step.description}
                                          required 
                                          rows={2} 
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="step-edit-activities">Aktivitäten (eine pro Zeile)</Label>
                                        <Textarea 
                                          id="step-edit-activities" 
                                          name="step-edit-activities"
                                          defaultValue={(step.activities || []).join('\n')}
                                          rows={3} 
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="step-edit-results">Ergebnisse (eines pro Zeile)</Label>
                                        <Textarea 
                                          id="step-edit-results" 
                                          name="step-edit-results"
                                          defaultValue={(step.results || []).join('\n')}
                                          rows={3} 
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button type="button" variant="outline" onClick={() => setIsEditStepDialogOpen(null)}>
                                        Abbrechen
                                      </Button>
                                      <Button type="submit">Änderungen speichern</Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => {
                                  const updatedApproach = {...approach};
                                  const updatedSteps = [...(updatedApproach.steps || [])];
                                  updatedSteps.splice(stepIndex, 1);
                                  updatedApproach.steps = updatedSteps;
                                  
                                  const updatedApproaches = [...(formData.approach || [])];
                                  updatedApproaches[approachIndex] = updatedApproach;
                                  onFormChange('approach', updatedApproaches);
                                }}
                              >
                                Löschen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
