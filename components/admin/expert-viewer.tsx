"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Search,
  Users,
  Award,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Expert } from "@/types/expert";
import Image from "next/image";
import { ExpertDetailDialog } from "@/components/expert-detail-dialog";
import { EnhancedFooter } from "@/components/enhanced-footer";

export default function ExpertViewer() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const { toast } = useToast();

  const showExpertDetail = (expert: Expert) => {
    setSelectedExpert(expert);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    const loadExperts = async () => {
      try {
        const response = await fetch("/api/data/experts");
        if (response.ok) {
          const data = await response.json();
          setExperts(data);
          setFilteredExperts(data);
        } else {
          throw new Error("Fehler beim Laden der Expertendaten");
        }      } catch (err) {
        console.error("Fehler beim Laden der Experten:", err);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Experten. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        setError(
          "Fehler beim Laden der Experten. Bitte versuchen Sie es erneut."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadExperts();
  }, []);
  useEffect(() => {
    let filtered = experts;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (expert) =>
          expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.expertise?.some((exp) =>
            exp.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          expert.technologies?.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Expertise filter
    if (selectedExpertise.length > 0) {
      filtered = filtered.filter((expert) =>
        selectedExpertise.some((expertise) =>
          expert.expertise?.some((exp) => 
            exp.toLowerCase().includes(expertise.toLowerCase())
          ) ||
          expert.technologies?.some((tech) => 
            tech.toLowerCase().includes(expertise.toLowerCase())
          )
        )
      );
    }

    setFilteredExperts(filtered);
  }, [searchTerm, selectedExpertise, experts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        {" "}
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">Lade Experten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Experten-Übersicht</h1>
            <p className="text-gray-600 mt-2">
              Entdecken Sie unsere SAP BTP Experten
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Experten suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredExperts.length} von {experts.length} Experten
            </div>
          </div>

          {/* Experten-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.length > 0 ? (
                filteredExperts.map((expert) => (
                  <Card
                    key={expert.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="relative h-64">
                        <Image
                          src={expert.image || "/placeholder.svg"}
                          alt={`${expert.firstName || ""} ${
                            expert.name || ""
                          }`.trim()}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=400&width=400&query=professional+headshot`;
                          }}
                        />
                      </div>
                      <div className="p-6 flex flex-col h-[300px]">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">
                            {`${expert.firstName || ""} ${
                              expert.name || ""
                            }`.trim()}
                          </h3>
                          <p className="text-gray-600 mb-3">{expert.role}</p>
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(
                                expert.expertise ||
                                expert.technologies ||
                                []
                              ).map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Erfahrung:</span>{" "}
                                {expert.experience || "Nicht angegeben"}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Zertifizierungen:
                                </span>{" "}
                                {expert.certifications || "Nicht angegeben"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-black"
                            onClick={() => showExpertDetail(expert)}
                          >
                            Profil ansehen
                          </Button>
                          <Button variant="outline" className="flex-1" asChild>
                            <a
                              href={`mailto:${
                                expert.email ||
                                `${
                                  expert.firstName || expert.name || "unknown"
                                }.${expert.name || "user"}@realcore.de`
                                  .toLowerCase()
                                  .replace(/\s+/g, ".")
                              }`}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Kontakt
                            </a>
                          </Button>
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
                      setSearchTerm("");
                      setSelectedExpertise([]);
                    }}
                  >
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
        </section>
      </div>
    </div>
  );
}
