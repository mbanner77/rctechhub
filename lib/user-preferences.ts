"use client"

import { useState, useEffect } from "react"
import type { UserServicePreferences } from "@/types/btp-service"

// Lokaler Speicher für Benutzereinstellungen
const STORAGE_KEY = "btp-service-preferences"

// Standardeinstellungen
const DEFAULT_PREFERENCES: UserServicePreferences = {
  favorites: [],
  recentlyViewed: [],
  comparisons: [],
}

export function useServicePreferences() {
  const [preferences, setPreferences] = useState<UserServicePreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Laden der Einstellungen aus dem localStorage
  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem(STORAGE_KEY)
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences))
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Fehler beim Laden der Benutzereinstellungen:", error)
      setIsLoaded(true)
    }
  }, [])

  // Speichern der Einstellungen im localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.error("Fehler beim Speichern der Benutzereinstellungen:", error)
      }
    }
  }, [preferences, isLoaded])

  // Favoriten-Funktionen
  const toggleFavorite = (serviceId: string) => {
    setPreferences((prev) => {
      const isFavorite = prev.favorites.includes(serviceId)
      return {
        ...prev,
        favorites: isFavorite ? prev.favorites.filter((id) => id !== serviceId) : [...prev.favorites, serviceId],
      }
    })
  }

  const isFavorite = (serviceId: string) => {
    return preferences.favorites.includes(serviceId)
  }

  // Zuletzt angesehene Services
  const addToRecentlyViewed = (serviceId: string) => {
    setPreferences((prev) => {
      const filtered = prev.recentlyViewed.filter((id) => id !== serviceId)
      return {
        ...prev,
        recentlyViewed: [serviceId, ...filtered].slice(0, 10), // Maximal 10 Services speichern
      }
    })
  }

  // Vergleichsfunktionen
  const toggleComparison = (serviceId: string) => {
    setPreferences((prev) => {
      const existingItem = prev.comparisons.find((item) => item.serviceId === serviceId)

      if (existingItem) {
        // Service aus Vergleich entfernen
        return {
          ...prev,
          comparisons: prev.comparisons.filter((item) => item.serviceId !== serviceId),
        }
      } else {
        // Service zum Vergleich hinzufügen
        return {
          ...prev,
          comparisons: [...prev.comparisons, { serviceId, selected: true }],
        }
      }
    })
  }

  const isInComparison = (serviceId: string) => {
    return preferences.comparisons.some((item) => item.serviceId === serviceId)
  }

  const clearComparisons = () => {
    setPreferences((prev) => ({
      ...prev,
      comparisons: [],
    }))
  }

  return {
    preferences,
    isLoaded,
    toggleFavorite,
    isFavorite,
    addToRecentlyViewed,
    toggleComparison,
    isInComparison,
    clearComparisons,
  }
}
