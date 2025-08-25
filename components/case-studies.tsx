import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExternalLink, Download } from "lucide-react";
import { CaseStudy } from "@/hooks/use-case-studies";

interface CaseStudiesProps {
  caseStudies: CaseStudy[];
  loading: boolean;
  gradient?: string; // Optional gradient for styling the buttons
}

export function CaseStudies({ caseStudies, loading, gradient = "from-blue-500 to-blue-700" }: CaseStudiesProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-500">Lade Fallstudien...</div>
      </div>
    );
  }

  if (!caseStudies || caseStudies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Fallstudien verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {caseStudies.map((caseStudy) => (
        <Card key={caseStudy.id} className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              {caseStudy.image ? (
                <Image
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(caseStudy.title)}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Kein Bild verfügbar</span>
                </div>
              )}
            </div>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{caseStudy.industry}</Badge>
                {caseStudy.tags &&
                  caseStudy.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
              </div>
              <h3 className="text-2xl font-bold mb-2">{caseStudy.title}</h3>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {caseStudy.clientLogo ? (
                    <div className="relative w-8 h-8 mr-2">
                      <Image
                        src={caseStudy.clientLogo}
                        alt={caseStudy.client}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(caseStudy.client)}`;
                        }}
                      />
                    </div>
                  ) : null}
                  <span className="font-medium">{caseStudy.client}</span>
                </div>
                {caseStudy.location && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{caseStudy.location}</span>
                  </>
                )}
              </div>
              <p className="text-gray-600 mb-6">{caseStudy.summary}</p>
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Herausforderung:</h4>
                  <p className="text-gray-600">{caseStudy.challenge}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Lösung:</h4>
                  <p className="text-gray-600">{caseStudy.solution}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ergebnisse:</h4>
                  <p className="text-gray-600">{caseStudy.results}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className={`bg-gradient-to-r ${gradient} text-white hover:opacity-90`}>
                  Fallstudie lesen
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                {caseStudy.pdf && (
                  <Button variant="outline">
                    PDF herunterladen
                    <Download className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
