"use client"

import { PathfinderUnit } from "./pathfinder-unit";
import { pathfinderUnits } from "@/app/pathfinder/pathfinder-units";
import { useEffect, useState } from "react";
import { getUnitCards, mapUnitCardToPathfinderUnit } from "@/lib/unit-cards-service";
import { UnitCard } from "@/types/unit-cards";
import { Skeleton } from "@/components/ui/skeleton";

export function PathfinderUnits() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUnitCards = async () => {
      setLoading(true);
      try {
        // Fetch real unit cards from the API
        const unitCards = await getUnitCards();
        
        // Map unit cards to pathfinder unit format
        const mappedUnits = unitCards.map(card => mapUnitCardToPathfinderUnit(card));
        setUnits(mappedUnits);
        
        console.log(`[PathfinderUnits] ${mappedUnits.length} aktive Unit Cards geladen`);
      } catch (error) {
        console.error("Error fetching unit cards:", error);
        // In case of errors: show empty list, do not use mock data
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitCards();
  }, []);

  return (
    <section id="pathfinder" className="py-16 bg-gray-50 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Unsere Pathfinder Units</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Spezialisierte Teams mit tiefgreifender Expertise in den wichtigsten Bereichen der digitalen Transformation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Show loading skeletons while data is being fetched
            Array(3).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-[500px]">
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-full rounded-lg" />
              </div>
            ))
          ) : units.length > 0 ? (
            // Show actual unit cards
            units.map((unit) => (
              <PathfinderUnit key={unit.id} unit={unit} />
            ))
          ) : (
            // Fallback message if no units are available
            <div className="col-span-3 text-center py-16">
              <p className="text-xl text-gray-500">Keine Unit Cards verfügbar</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
