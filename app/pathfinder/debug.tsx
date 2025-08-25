"use client";

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';

/**
 * Debugging-Komponente zum Anzeigen von Routen-Informationen
 */
export function DebugPathInfo() {
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Route params:', params);
  }, [pathname, params]);

  return null; // Keine UI-Ausgabe
}
