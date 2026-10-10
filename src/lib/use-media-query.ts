'use client';

import { useEffect, useState } from 'react';

/**
 * Live result of a CSS media query. Returns `serverDefault` until mounted
 * so the first client render matches the static HTML.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const [matches, setMatches] = useState(serverDefault);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
