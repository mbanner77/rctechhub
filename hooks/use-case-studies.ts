import { useState, useEffect, useRef, useCallback } from 'react';

export interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  tags: string[];
  client: string;
  clientLogo?: string;
  location?: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  image?: string;
  pdf?: string;
  unitId?: string;
}

export function useCaseStudiesByUnitId(unitId: string | null) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store previous unitId to prevent unnecessary reloads
  const prevUnitIdRef = useRef<string | null>(null);

  const fetchCaseStudies = useCallback(async (id: string | null) => {
    if (!id) {
      setCaseStudies([]);
      setLoading(false);
      return;
    }

    // Skip if the ID hasn't changed
    if (id === prevUnitIdRef.current) {
      return;
    }

    try {
      setLoading(true);
      // Use the dedicated API endpoint to get case studies by unitId
      const response = await fetch(`/api/case-studies/by-unit?unitId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch case studies: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCaseStudies(data);
      setError(null);
      // Update the ref with current unitId
      prevUnitIdRef.current = id;
    } catch (err) {
      console.error('Error fetching case studies:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching case studies'));
      setCaseStudies([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies

  useEffect(() => {
    fetchCaseStudies(unitId);
  }, [unitId, fetchCaseStudies]);

  return { caseStudies, loading, error };
}

export function useAllCaseStudies() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        setLoading(true);
        // Get all case studies from either endpoint
        const response = await fetch('/api/case-studies/by-unit');
        
        if (!response.ok) {
          // Fallback to the admin endpoint if the dedicated endpoint fails
          const adminResponse = await fetch('/api/admin/case-studies');
          if (!adminResponse.ok) {
            throw new Error(`Failed to fetch case studies: ${adminResponse.statusText}`);
          }
          const data = await adminResponse.json();
          setCaseStudies(data);
          return;
        }
        
        const data = await response.json();
        setCaseStudies(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching case studies'));
        setCaseStudies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudies();
  }, []);

  return { caseStudies, loading, error };
}
