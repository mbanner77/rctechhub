"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Linkedin,
  FileText,
  LucideAward,
  BookOpen,
  Clock,
  MapPin,
} from "lucide-react";
import type { Expert } from "@/types/expert";
import { ContactDialog } from "./contact-dialog";
import { parseQuillHTML } from "@/lib/html-parser";

interface ExpertDetailDialogProps {
  expert: Expert | null;
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  buttonClass?: string
}

interface Education {
  degree: string
  institution: string
  year: string
}

interface Project {
  title: string;
  client: string;
  description: string;
  technologies: string[];
  year: string;
}

export function ExpertDetailDialog({
  expert,
  isOpen,
  onClose,
  open,
  onOpenChange,
  children,
  buttonClass = "bg-[#85C916] text-white hover:bg-green-700"
}: ExpertDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("about");
  const [internalOpen, setInternalOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Only open contact dialog automatically if expert.showContactDialog is explicitly set to true
  // This ensures "Profil anzeigen" only shows profile, while "Kontakt aufnehmen" shows both profile and contact dialog
  if (expert?.showContactDialog === true && !isContactDialogOpen) {
    setIsContactDialogOpen(true); 
    expert.showContactDialog = false;
  }

  if (!expert) {
    // If used as compound component with children, return the trigger
    if (children) {
      return (
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Experten-Profil</DialogTitle>
              <DialogDescription>
                Keine Expertendaten verfügbar
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    }
    return null;
  }

  // Determine which open state to use
  const dialogOpen =
    open !== undefined ? open : isOpen !== undefined ? isOpen : internalOpen;

  // Determine which close handler to use
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (onClose && !newOpen) {
      onClose();
    } else if (open === undefined && isOpen === undefined) {
      setInternalOpen(newOpen);
    }
  };  // Build full name from Expert properties, handle cases where firstName might be undefined
  const fullName = expert.firstName && expert.name 
    ? `${expert.firstName} ${expert.name}`.trim()
    : expert.name || expert.firstName || "Expert";

  // If used as compound component with children
  if (children) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Experten-Profil</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zu {fullName}
            </DialogDescription>
          </DialogHeader>
          {/* Dialog content would go here - simplified for compound component */}
          <div className="text-center py-8">
            <p>Detailansicht für {fullName}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Experten-Profil</DialogTitle>
          <DialogDescription>
            Detaillierte Informationen zu {fullName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Linke Spalte - Profilbild und Kontaktdaten */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex-1 space-y-4">
              <div className="relative w-full rounded-lg overflow-hidden">
                <Image
                  src={expert.image || "/placeholder.svg"}
                  alt={fullName}
                  width={400}
                  height={0}
                  style={{ height: 'auto' }}
                  className="w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `/placeholder.svg?height=400&width=400&query=professional+headshot`;
                  }}
                />
              </div>

              <div>
                {" "}
                <h2 className="text-xl font-bold">{fullName}</h2>
                <p className="text-gray-600">{expert.role}</p>
              </div>

              {(expert.email || expert.location || expert.linkedin) && (
                <div className="space-y-2">
                  {expert.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />{" "}
                      <a
                        href={`mailto:${expert.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {expert.email}
                      </a>
                    </div>
                  )}
                  {expert.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{expert.location}</span>
                    </div>
                  )}
                  {expert.linkedin && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="h-4 w-4 mr-2 text-gray-500" />
                      <a
                        href={expert.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profil
                      </a>
                    </div>
                  )}
                </div>
              )}

              {expert.languages && expert.languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Sprachen
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.languages.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {((expert.expertise && expert.expertise.length > 0) || 
                (expert.technologies && expert.technologies.length > 0)) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(expert.expertise || expert.technologies)?.map(
                      (skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact button fixed at bottom */}
            <div className="mt-auto pt-4">
              <Button className={`w-full ${buttonClass}`} onClick={() => setIsContactDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Kontakt aufnehmen
              </Button>
            </div>
            {/*<Button className={`w-full ${buttonClass}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Termin vereinbaren
            </Btton>*/}
          </div>

          {/* Rechte Spalte - Tabs mit Details */}
          <div className="md:col-span-2">
            <Tabs
              defaultValue="about"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="about">Über mich</TabsTrigger>
                <TabsTrigger value="projects">Projekte</TabsTrigger>
                {/*<TabsTrigger value="publications">Publikationen</TabsTrigger>
                <TabsTrigger value="speaking">Vorträge</TabsTrigger>*/}
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                {expert.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Biografie</h3>
                    <div className="text-gray-700">{parseQuillHTML(expert.bio)}</div>
                  </div>
                )}

                {expert.experience && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Erfahrung</h3>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-amber-500" />
                      <span>{expert.experience}</span>
                    </div>
                  </div>
                )}

                {expert.certifications && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Zertifizierungen
                    </h3>
                    <div className="flex items-center">
                      <LucideAward className="h-5 w-5 mr-2 text-amber-500" />
                      <span>{expert.certifications}</span>
                    </div>
                  </div>
                )}

                {expert.education && expert.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ausbildung</h3>
                    <div className="space-y-2">
                      {expert.education.map((edu: any, index: number) => (
                        <div key={index} className="flex items-start">
                          <BookOpen className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm text-gray-600">
                              {edu.institution}, {edu.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expert.awards && expert.awards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Auszeichnungen</h3>
                    <div className="space-y-2">
                      {expert.awards.map((award: any, index: number) => (
                        <div key={index} className="flex items-start">
                          <LucideAward className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{award.title}</p>
                            <p className="text-sm text-gray-600">
                              {award.organization}, {award.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">
                  Ausgewählte Projekte
                </h3>
                {expert.projects && expert.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {expert.projects.map(
                      (projectTitle: string, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-bold">{projectTitle}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Technologien:</span>{" "}
                              {expert.technologies?.join(", ") || "Nicht spezifiziert"}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Keine Projekte hinterlegt</p>
                    <p className="text-sm">Für diesen Experten sind derzeit keine Projektinformationen hinterlegt.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="publications" className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Publikationen</h3>
                {expert.publications && expert.publications.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {expert.publications.map(
                      (publicationTitle: string, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-bold">{publicationTitle}</h4>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Keine Publikationen hinterlegt</p>
                    <p className="text-sm">Für diesen Experten sind derzeit keine Publikationen hinterlegt.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="speaking" className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">
                  Vorträge & Konferenzen
                </h3>
                {expert.speakingEngagements && expert.speakingEngagements.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {expert.speakingEngagements.map(
                      (engagement: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold">{engagement.title}</h4>
                              <Badge variant="outline">{engagement.date}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Event:</span>{" "}
                              {engagement.event}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Ort:</span>{" "}
                              {engagement.location}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Keine Vorträge hinterlegt</p>
                    <p className="text-sm">Für diesen Experten sind derzeit keine Informationen über Vorträge und Konferenzen hinterlegt.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>{" "}
        
        {/* Contact dialog for the expert */}
        <ContactDialog 
          isOpen={isContactDialogOpen} 
          onClose={() => setIsContactDialogOpen(false)}
          serviceTitle={`Experte: ${fullName}`}
        />
      </DialogContent>
    </Dialog>
  );
}

// Füge einen benannten Export hinzu
export { ExpertDetailDialog as default };
