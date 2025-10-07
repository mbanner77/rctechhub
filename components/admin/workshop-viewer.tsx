"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Calendar, Code, Lightbulb, Search, Settings, Users
} from "lucide-react";
import { Workshop } from "@/types/workshop";
import { useSiteConfig } from "@/hooks/use-site-config";
import { formatCurrency } from "@/lib/currency";
import { defaultWorkshops } from "@/data/default-workshops";

// Icon Map für die Anzeige
const iconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="h-8 w-8 mb-2" />,
  Lightbulb: <Lightbulb className="h-8 w-8 mb-2" />,
  BookOpen: <BookOpen className="h-8 w-8 mb-2" />,
  Code: <Code className="h-8 w-8 mb-2" />,
  Settings: <Settings className="h-8 w-8 mb-2" />,
  Users: <Users className="h-8 w-8 mb-2" />,
};

export default function WorkshopViewer() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const { config } = useSiteConfig()

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch("/api/data/workshops");
        if (response.ok) {
          const data = await response.json();
          setWorkshops(data);
        } else {
          console.error("Failed to fetch workshops");
          setWorkshops(defaultWorkshops);
        }
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setWorkshops(defaultWorkshops);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Gruppiere Workshops nach unitId
  const groupedWorkshops = workshops.reduce((groups: Record<string, Workshop[]>, workshop) => {
    const unitId = workshop.unitId || "other";
    if (!groups[unitId]) {
      groups[unitId] = [];
    }
    groups[unitId].push(workshop);
    return groups;
  }, {});

  // Tabs werden basierend auf den verfügbaren unitIds erstellt

  // Setze ersten Tab als aktiv, wenn noch keiner gesetzt ist
  useEffect(() => {
    if (Object.keys(groupedWorkshops).length > 0 && !activeTab) {
      setActiveTab(Object.keys(groupedWorkshops)[0]);
    }
  }, [groupedWorkshops, activeTab]);

  // Filter workshops basierend auf der Suchanfrage
  const filteredWorkshops = searchQuery
    ? workshops.filter(workshop =>
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Workshops durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredWorkshops ? (
        // Suchergebnisse anzeigen
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Suchergebnisse ({filteredWorkshops.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </div>
      ) : (
        // Workshops nach Units gruppiert anzeigen
        <Tabs 
          value={activeTab || undefined} 
          onValueChange={setActiveTab as (value: string) => void}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.keys(groupedWorkshops).map((unitId) => (
              <TabsTrigger key={unitId} value={unitId}>
                {unitNames[unitId] || unitId}
                <Badge variant="outline" className="ml-2">
                  {groupedWorkshops[unitId].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(groupedWorkshops).map((unitId) => (
            <TabsContent key={unitId} value={unitId} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedWorkshops[unitId].map((workshop) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Einheitennamen für Tabs
const unitNames: Record<string, string> = {
  "digital-core": "Digital Core",
  "cloud-foundation": "Cloud Foundation",
  "adaptive-integration": "Adaptive Integration",
  "data-driven-decisions": "Data-Driven Decisions",
  "business-simplified": "Business Simplified",
  "xaas-transformation": "XaaS Transformation",
  "other": "Sonstige"
};

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { config } = useSiteConfig()
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center">
          {workshop.icon && iconMap[workshop.icon] ? (
            iconMap[workshop.icon]
          ) : (
            <BookOpen className="h-8 w-8 mb-2" />
          )}
          <CardTitle className="ml-2">{workshop.title}</CardTitle>
        </div>
        <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-2">
          <span>{workshop.duration}</span>
          {typeof workshop.price === 'number' && workshop.price > 0 && (
            <>
              <span>•</span>
              <span>{formatCurrency(Number(workshop.price || 0), config.currency)}</span>
            </>
          )}
          {workshop.audience && (
            <>
              <span>•</span>
              <span>{workshop.audience}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700">{workshop.description}</p>
        
        {workshop.benefits && workshop.benefits.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Vorteile:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {workshop.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-700">{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {workshop.unitId && unitNames[workshop.unitId] && (
          <div className="mt-4">
            <Badge variant="outline" className="mt-2">
              {unitNames[workshop.unitId]}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
