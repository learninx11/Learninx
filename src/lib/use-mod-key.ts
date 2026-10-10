'use client';

import { useEffect, useState } from 'react';

/**
 * The label of the platform's shortcut modifier: `⌘` on Apple devices,
 * `Ctrl` elsewhere. Reads `navigator` after mount so the server render
 * (always `Ctrl`) never mismatches the first client render.
 */
export function useModKey(): '⌘' | 'Ctrl' {
  const [mod, setMod] = useState<'⌘' | 'Ctrl'>('Ctrl');
  useEffect(() => {
    if (/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) setMod('⌘');
  }, []);
  return mod;
}
