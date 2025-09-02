"use client"

import { useEffect, useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { analytics } from "@/lib/analytics"

export default function SearchFilters({
  onSearchQueryChange,
  onFiltersChange,
  filters = [],
}: {
  onSearchQueryChange?: (query: string) => void
  onFiltersChange?: (filters: string[]) => void
  filters?: string[] // all categories
}) {

  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service") ?? ""

  const [searchQuery, setSearchQuery] = useState(serviceParam)
  // Track active filters for search results filtering
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  // Track the currently selected category for the dropdown
  // We initially set it to "all" to ensure the "Alle Kategorien" option is selected by default
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const [typedValue, setTypedValue] = useState(searchQuery) // cached

  // Ensure that the selected category is always correct based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setSelectedCategory("all");
    } else if (activeFilters.length === 1) {
      setSelectedCategory(activeFilters[0]);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(typedValue)
      onSearchQueryChange?.(typedValue)
      if (typedValue.length > 2) {
        analytics.search(typedValue, { filters: activeFilters })
      }
    }, 200)

    return () => clearTimeout(delay)
  }, [typedValue])


  const handleSearchInputChange = (value: string) => {
    // Allow common special characters (e.g., '/', '-', '+', '.') and keep user intent.
    // We only trim excessive whitespace later during matching.
    setTypedValue(value)
    // onSearchQueryChange?.(value) // debounced below to avoid UI lags
  }

  const addFilter = (filter: string) => {
    // if (!activeFilters.includes(filter)) {
    //   const newFilters = [...activeFilters, filter]
    //   setActiveFilters(newFilters)
    //   onFiltersChange?.(newFilters)
    // }

    // Update selected category state
    setSelectedCategory(filter)

    // Clear filters when "all" is selected
    if (filter === "all") {
      analytics.filterClear('category')
      setActiveFilters([])
      onFiltersChange?.([])
      return
    }

    // Track category filter application
    analytics.filterApply('category', filter)
    
    const newFilters = [filter] // nur eine Kategorie erlauben
    setActiveFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const removeFilter = (filter: string) => {
    const newFilters = activeFilters.filter((f) => f !== filter)
    setActiveFilters(newFilters)
    // Reset selected category to "all" when all filters are removed
    if (newFilters.length === 0) {
      setSelectedCategory("all")
    }
    onFiltersChange?.(newFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Suchen Sie nach Beratungsangeboten..."
            className="pl-10"
            value={typedValue}
            onChange={(e) => handleSearchInputChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="integration">Integration</SelectItem>
              <SelectItem value="development">Entwicklung</SelectItem>
              <SelectItem value="security">Sicherheit</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="migration">Migration</SelectItem>
            </SelectContent>
          </Select> */}

          {/* <style jsx>{`[data-state="checked"] > svg {display: none;}`}</style> */}
          <Select value={selectedCategory} onValueChange={(value) => addFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all" className="font-medium">
                Alle Kategorien
              </SelectItem>
              {filters.length > 0 ? (
                <>
                  <div className="my-1 h-px bg-gray-200"></div> 
                  {filters.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {filter}
                    </SelectItem>
                  ))}
                </>
              ) : null}
            </SelectContent>
          </Select>



          {/* <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
                <SheetDescription>Filtern Sie die Beratungsangebote nach Ihren Bedürfnissen</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Preisbereich</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-price">Min. Preis (€)</Label>
                      <Input id="min-price" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="max-price">Max. Preis (€)</Label>
                      <Input id="max-price" type="number" placeholder="10000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Technologien</h3>
                  <div className="space-y-2">
                    {["SAP BTP", "SAPUI5", "SAP Fiori", "SAP HANA", "SAP CAP", "SAP Integration Suite"].map((tech) => (
                      <div key={tech} className="flex items-center space-x-2">
                        <Checkbox id={`tech-${tech}`} onCheckedChange={() => addFilter(tech)} />
                        <Label htmlFor={`tech-${tech}`}>{tech}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Dauer</h3>
                  <div className="space-y-2">
                    {["1-5 Tage", "1-2 Wochen", "3-4 Wochen", "1-3 Monate"].map((duration) => (
                      <div key={duration} className="flex items-center space-x-2">
                        <Checkbox id={`duration-${duration}`} onCheckedChange={() => addFilter(duration)} />
                        <Label htmlFor={`duration-${duration}`}>{duration}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Filter anwenden</Button>
              </div>
            </SheetContent>
          </Sheet> */}
        </div>
      </div>

      {/* {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <X size={14} className="cursor-pointer" onClick={() => removeFilter(filter)} />
            </Badge>
          ))}
          <Button variant="link" size="sm" className="text-sm" onClick={() => setActiveFilters([])}>
            Alle löschen
          </Button>
        </div>
      )} */}
    </div>
  )
}
