"use client"

import { useState, useEffect } from "react"
import { Layers, Database, BarChart2, Cloud, RefreshCw } from "lucide-react"

import { pathfinderUnits } from "@/app/pathfinder/pathfinder-units"
import { PathfinderUnit } from "./pathfinder-unit";
import { StickyHeader } from "./sticky-header"
import { analytics } from "@/lib/analytics"
import { getUnitCards, mapUnitCardToPathfinderUnit } from "@/lib/unit-cards-service"
import { UnitCard } from "@/types/unit-cards"

export function PathfinderOverview() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [units, setUnits] = useState<any[]>([])
  const [filteredUnits, setFilteredUnits] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Alle verfügbaren Technologien aus den Units extrahieren
  const allTags = Array.from(
    new Set(units.flatMap((unit) => unit.technologies || []))
  ).sort()

  // Kategorien für die Units
  const categories = [
    { id: "core-systems", name: "Core Systems", icon: <Database className="h-4 w-4" /> },
    { id: "integration", name: "Integration", icon: <RefreshCw className="h-4 w-4" /> },
    { id: "data-analytics", name: "Data & Analytics", icon: <BarChart2 className="h-4 w-4" /> },
    { id: "cloud-platform", name: "Cloud & Platform", icon: <Cloud className="h-4 w-4" /> },
    { id: "transformation", name: "Transformation", icon: <Database className="h-4 w-4" /> },
  ]  // Load unit cards from API
  useEffect(() => {
    const fetchUnitCards = async () => {
      setIsLoading(true);
      try {
        // Fetch real unit cards from the API
        const unitCards = await getUnitCards();
        
        // Map unit cards to pathfinder unit format
        const mappedUnits = unitCards.map(card => mapUnitCardToPathfinderUnit(card));
        setUnits(mappedUnits);
        setFilteredUnits(mappedUnits);
        
        console.log(`[PathfinderOverview] ${mappedUnits.length} aktive Unit Cards geladen`);
      } catch (error) {
        console.error("Error fetching unit cards:", error);
        // In case of errors: show empty list, do not use mock data
        setUnits([]);
        setFilteredUnits([]);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    fetchUnitCards();
  }, []);

  // Filter anwenden
  useEffect(() => {
    if (!units.length) return;
    
    const filtered = units.filter((unit) => {
      // Suche im Titel anwenden, wenn vorhanden
      const matchesSearch = !searchTerm || 
        (unit.title && unit.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Kategorie hat Vorrang - wenn Kategorien ausgewählt sind, werden nur Units dieser Kategorien betrachtet
      const matchesCategory = selectedCategories.length === 0 || 
        (unit.category && selectedCategories.includes(unit.category));
        
      // Tags werden nur innerhalb der ausgewählten Kategorien gefiltert
      const matchesTags = selectedTags.length === 0 || 
        (unit.technologies && unit.technologies.some((tech: string) => selectedTags.includes(tech)));

      // Wenn keine Kategorie ausgewählt ist, normale Filterung nach Tags
      if (selectedCategories.length === 0) {
        return matchesSearch && matchesTags;
      }
      
      // Wenn eine Kategorie ausgewählt ist, muss die Unit zu dieser Kategorie gehören
      // und nur dann wird nach Tags gefiltert
      return matchesSearch && matchesCategory && (selectedTags.length === 0 || matchesTags);
    });
    
    setFilteredUnits(filtered);
  }, [selectedTags, selectedCategories, units])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="py-5">
        <StickyHeader />
      </div>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-4">Pathfinder Units</h1>

          {/* Filter Controls */}
          <div className="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
            {/* Categories Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide text-center mb-4">
                Kategorien
              </h3>              <div className="flex justify-center flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedCategories.includes(category.id)
                        ? "bg-green-600 text-white border-green-600 shadow-md" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    }`}
                    onClick={() => {
                      const newCategories = selectedCategories.includes(category.id)
                        ? selectedCategories.filter(cat => cat !== category.id)
                        : [...selectedCategories, category.id]
                      setSelectedCategories(newCategories)
                      analytics.search('pathfinder-category', { category: category.id, active: !selectedCategories.includes(category.id) })
                    }}
                  >
                    <span className="mr-1.5 flex-shrink-0">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

            {/* Tags Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide text-center mb-4">
                Technologien
              </h3>
              <div className="flex justify-center flex-wrap gap-1.5 max-w-5xl mx-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                    onClick={() => {
                      const isSelected = selectedTags.includes(tag);
                      analytics.serviceClick(tag, isSelected ? 'pathfinder-tag-deselect' : 'pathfinder-tag-select');
                      setSelectedTags(selectedTags.includes(tag)
                        ? selectedTags.filter((t) => t !== tag)
                        : [...selectedTags, tag]
                      )
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>            {/* Active Filters & Results */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {(selectedTags.length > 0 || selectedCategories.length > 0) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Aktiv:</span>
                    <div className="flex gap-1">
                      {selectedCategories.map((categoryId) => (
                        <span key={categoryId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          {categories.find(cat => cat.id === categoryId)?.name}
                        </span>
                      ))}
                      {selectedTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {tag}
                        </span>
                      ))}
                      {selectedTags.length > 3 && (
                        <span className="text-xs text-gray-500">+{selectedTags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredUnits.length}</span> units
                </span>
                {(selectedTags.length > 0 || selectedCategories.length > 0) && (
                  <button
                    onClick={() => {
                      analytics.serviceClick('filter-clear-all', 'pathfinder-overview');
                      setSelectedTags([])
                      setSelectedCategories([])
                    }}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Filter entfernen
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Units Display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">Loading units...</div>
            </div>
          ) : filteredUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => (
                <PathfinderUnit key={unit.id} unit={unit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-gray-500">No matching units found</div>
            </div>
          )}
        </div>
      </div>
  )
}
