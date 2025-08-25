import { useState, useEffect, useCallback, useRef } from 'react';
import { Expert } from '@/types/expert';
import { fetchCurrentExperts, defaultExperts } from '@/data/experts';

// Hook to fetch and manage current experts
export const useExperts = () => {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadExperts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const currentExperts = await fetchCurrentExperts();
            setExperts(currentExperts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load experts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExperts();
    }, [loadExperts]);
    // Function to refresh experts data
    const refreshExperts = useCallback(async () => {
        await loadExperts();
    }, [loadExperts]);

    return {
        experts,
        loading,
        error,
        refreshExperts,
    };
};

// Hook to get experts by IDs with real-time updates
export const useExpertsByIds = (expertIds: string[]) => {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const loadExpertsByIds = useCallback(async () => {
        // If no IDs provided, set empty state
        if (!expertIds || expertIds.length === 0) {
            setExperts([]);
            setLoading(false);
            setError(null);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const allExperts = await fetchCurrentExperts();
            
            const filteredExperts = expertIds
                .map(id => allExperts.find(expert => expert.id === id))
                .filter((expert): expert is Expert => expert !== undefined);
                
            setExperts(filteredExperts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load experts');
            
            // Fallback to default experts
            const fallbackExperts = expertIds
                .map(id => defaultExperts.find(expert => expert.id === id))
                .filter((expert): expert is Expert => expert !== undefined);
            setExperts(fallbackExperts);
        } finally {
            setLoading(false);
        }
    }, [expertIds]);

    useEffect(() => {
        loadExpertsByIds();
    }, [loadExpertsByIds]);

    return {
        experts,
        loading,
        error,
        refresh: loadExpertsByIds,
    };
};

// Hook to get expert by ID with real-time updates
export const useExpertById = (expertId: string) => {
    const [expert, setExpert] = useState<Expert | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadExpert = useCallback(async () => {
        if (!expertId) {
            setExpert(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const allExperts = await fetchCurrentExperts();
            const foundExpert = allExperts.find(expert => expert.id === expertId);
            setExpert(foundExpert || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load expert');
            setExpert(null);
        } finally {
            setLoading(false);
        }
    }, [expertId]);

    useEffect(() => {
        loadExpert();
    }, [loadExpert]);

    return {
        expert,
        loading,
        error,
        refresh: loadExpert,
    };
};
