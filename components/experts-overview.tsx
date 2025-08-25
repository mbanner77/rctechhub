"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Mail, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExpertDetailDialog } from "@/components/expert-detail-dialog";
import { Expert } from "@/types/expert";
import { analytics } from "@/lib/analytics";
import { StickyHeader } from "./sticky-header";
import { ContactDialog } from "./contact-dialog";

export default function ExpertsOverview() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [allExpertiseAreas, setAllExpertiseAreas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Load experts from API
  useEffect(() => {
    const loadExperts = async () => {
      try {
        const response = await fetch("/api/data/experts");
        if (response.ok) {
          const expertData: Expert[] = await response.json();

          // Filter out experts with incomplete data
          const validExperts = expertData.filter(
            (expert) =>
              expert.firstName &&
              expert.name &&
              expert.firstName.trim() !== "" &&
              expert.name.trim() !== ""
          );
          setExperts(validExperts);
          // Extract all expertise areas for filtering
          const allAreas = Array.from(
            new Set(
              validExperts.flatMap(
                (expert) => expert.expertise || expert.technologies || []
              )
            )
          ).sort();
          setAllExpertiseAreas(allAreas);
        } else {
          console.error("Failed to load experts");
        }
      } catch (error) {
        console.error("Error loading experts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadExperts();
  }, []);
  // Filter-Logik
  const filteredExperts = experts.filter((expert) => {
    const fullName = `${expert.firstName || ""} ${expert.name || ""}`.trim();
    const matchesSearch =
      searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expert.expertise &&
        expert.expertise.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
      (expert.technologies &&
        expert.technologies.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const expertiseList = expert.expertise || expert.technologies || [];
    const matchesExpertise =
      selectedExpertise.length === 0 ||
      expertiseList.some((skill: string) => selectedExpertise.includes(skill));

    return matchesSearch && matchesExpertise;
  });

  // Toggle Expertise-Filter
  const toggleExpertise = (expertise: string) => {
    analytics.serviceClick(expertise, 'expert-filter-toggle');
    setSelectedExpertise((prev: string[]) =>
      prev.includes(expertise)
        ? prev.filter((item) => item !== expertise)
        : [...prev, expertise]
    );
  };

  // Experten-Detail anzeigen
  const showExpertDetail = (expert: Expert, openContactDialog: boolean = false) => {
    analytics.serviceClick(`${expert.firstName} ${expert.name}`, 'expert-detail-view');
    // Ensure contact dialog doesn't open automatically when just viewing profile
    const expertCopy = { ...expert, showContactDialog: openContactDialog };
    setSelectedExpert(expertCopy);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="py-5">
        <StickyHeader />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Unsere Experten</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lernen Sie unsere erfahrenen Experten kennen, die Sie bei Ihren
              SAP BTP-Projekten unterstützen können. Jeder Experte bringt
              spezialisiertes Wissen und umfangreiche Erfahrung mit.
            </p>
          </div>
          {/* Filter und Suche */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Nach Namen, Rolle oder Expertise suchen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.length > 2) {
                    analytics.search(e.target.value, { context: 'experts' });
                  }
                }}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => {
                    analytics.serviceClick('search-clear', 'experts');
                    setSearchTerm("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {selectedExpertise.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedExpertise.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Optionen</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="text-sm font-medium mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {allExpertiseAreas.map((expertise) => (
                      <Badge
                        key={expertise}
                        variant={
                          selectedExpertise.includes(expertise)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleExpertise(expertise)}
                      >
                        {expertise}
                        {selectedExpertise.includes(expertise) && (
                          <X
                            className="ml-1 h-3 w-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpertise(expertise);
                            }}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedExpertise.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      analytics.serviceClick('filter-reset', 'experts');
                      setSelectedExpertise([]);
                    }}
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Experten-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredExperts.length > 0 ? (
              filteredExperts.map((expert) => (
                <Card
                  key={expert.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-md flex flex-col"
                >
                  <CardContent className="p-0 flex flex-col flex-1">
                    <div className="relative aspect-[2/3] w-full">
                      <Image
                        src={expert.image || "/placeholder.svg"}
                        alt={`${expert.firstName || ""} ${expert.name || ""
                          }`.trim()}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/placeholder.svg?height=400&width=400&query=professional+headshot`;
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {`${expert.firstName || ""} ${expert.name || ""
                            }`.trim()}
                        </h3>
                        <p className="text-gray-600 mb-3">{expert.role}</p>
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(
                              expert.expertise ||
                              expert.technologies ||
                              []
                            ).slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {(expert.expertise || expert.technologies || []).length > 3 && (
                              <Badge variant="outline">
                                +{(expert.expertise || expert.technologies || []).length - 3} weitere
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="line-clamp-2">
                              <span className="font-medium">Erfahrung:</span>{" "}
                              {expert.experience || "Nicht angegeben"}
                            </p>
                            <p className="line-clamp-2">
                              <span className="font-medium">
                                Zertifizierungen:
                              </span>{" "}
                              {expert.certifications || "Nicht angegeben"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-auto"> 
                        <Button
                          className="flex-1 min-w-[200px] bg-[#6BB14B] hover:bg-green-700 text-white"
                          onClick={() => showExpertDetail(expert, false)}
                        >
                          Profil ansehen
                        </Button>
                        {/*<Button variant="outline" className="flex-1" asChild>
                          <a
                            href={`mailto:${expert.email ||
                              `${expert.firstName || expert.name || "unknown"
                                }.${expert.name || "user"}@realcore.de`
                                .toLowerCase()
                                .replace(/\s+/g, ".")
                              }`}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Kontakt
                          </a>
                        </Button>*/}
                        <Button className="flex-1 min-w-[200px] bg-[#85C916] text-white hover:bg-green-700" onClick={() => showExpertDetail(expert, true)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Kontakt aufnehmen 
                        </Button>

                        {/* Contact dialog for the expert */}
                        <ContactDialog
                          isOpen={isContactDialogOpen}
                          onClose={() => setIsContactDialogOpen(false)}
                          serviceTitle={`Experte: ${expert.firstName} ${expert.name}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">
                  Keine Experten gefunden, die Ihren Filterkriterien
                  entsprechen.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    analytics.serviceClick('filter-reset-all', 'experts');
                    setSearchTerm("");
                    setSelectedExpertise([]);
                  }}                  >
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>

          {/* Experten-Detail-Dialog */}
          <ExpertDetailDialog
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            expert={selectedExpert}
          />
        </div>
      </section>
    </div>
  );
}
