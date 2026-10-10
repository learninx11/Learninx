'use client';

import { useCallback, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from './theme-script';

/**
 * Light / dark theme. The palette itself is CSS (`html.light` in
 * globals.css); this module only flips the class and remembers the
 * visitor's choice. `system` (the default) follows the OS setting.
 *
 * `THEME_INIT_SCRIPT` (./theme-script) applies the stored choice before
 * first paint, so pages never flash the wrong theme.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_EVENT = 'lx:theme-change';

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage blocked — fall back to the OS setting */
  }
  return 'system';
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function currentTheme(): ResolvedTheme {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  if (currentTheme() === theme) return;
  root.setAttribute('data-theme-switching', '');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute('data-theme-switching')),
  );
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* storage blocked — the choice still applies to this page view */
  }
  applyTheme(preference === 'system' ? systemTheme() : preference);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Current theme preference plus the theme actually on screen. Before
 * mount it reports `system` / `dark`, matching the server render.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPreference(readThemePreference());
      setResolved(currentTheme());
    };
    sync();
    setMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = () => {
      if (readThemePreference() === 'system') applyTheme(systemTheme());
      sync();
    };
    // Another tab changed the theme.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readThemePreference();
      applyTheme(next === 'system' ? systemTheme() : next);
      sync();
    };

    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener('storage', onStorage);
    media.addEventListener('change', onSystemChange);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener('storage', onStorage);
      media.removeEventListener('change', onSystemChange);
    };
  }, []);

  const update = useCallback((next: ThemePreference) => setThemePreference(next), []);

  return { preference, resolved, mounted, setPreference: update };
}
