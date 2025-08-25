import { useState, useEffect, useRef, useCallback } from 'react';
import { Schulung } from '@/types/schulung';

export function useSchulungenByUnitId(unitId: string | null) {
  const [schulungen, setSchulungen] = useState<Schulung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store previous unitId to prevent unnecessary reloads
  const prevUnitIdRef = useRef<string | null>(null);

  const fetchSchulungen = useCallback(async (id: string | null) => {
    if (!id) {
      setSchulungen([]);
      setLoading(false);
      return;
    }

    // Skip if the ID hasn't changed
    if (id === prevUnitIdRef.current) {
      return;
    }

    try {
      setLoading(true);
      // Use the dedicated API endpoint to get schulungen by unitId
      const response = await fetch(`/api/schulungen/by-unit?unitId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schulungen: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSchulungen(data);
      setError(null);
      // Update the ref with current unitId
      prevUnitIdRef.current = id;
    } catch (err) {
      console.error('Error fetching schulungen:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching schulungen'));
      setSchulungen([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies

  useEffect(() => {
    fetchSchulungen(unitId);
  }, [unitId, fetchSchulungen]);

  return { schulungen, loading, error };
}

export function useAllSchulungen() {
  const [schulungen, setSchulungen] = useState<Schulung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSchulungen() {
      try {
        setLoading(true);
        // Get all schulungen
        const response = await fetch('/api/schulungen/by-unit');
        
        if (!response.ok) {
          // Fallback to the main endpoint if the dedicated endpoint fails
          const fallbackResponse = await fetch('/api/schulungen');
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch schulungen: ${fallbackResponse.statusText}`);
          }
          const data = await fallbackResponse.json();
          setSchulungen(data);
          return;
        }
        
        const data = await response.json();
        setSchulungen(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching schulungen:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching schulungen'));
        setSchulungen([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSchulungen();
  }, []);

  return { schulungen, loading, error };
}
