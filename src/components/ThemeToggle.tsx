'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './ui/Icon';

const STORAGE_KEY = 'learninx_theme';

type Theme = 'dark' | 'light';

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle() {
  // Start as `dark` so the server-rendered HTML matches the default
  // (dark) styling; on mount we read the actual stored value and
  // apply it before the user sees a flash.
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const next = readInitial();
    setTheme(next);
    setMounted(true);
    document.documentElement.classList.toggle('light', next === 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode, full storage, etc.)
    }
  }

  const label =
    mounted && theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800/60 hover:text-[var(--lx-accent)]"
    >
      {mounted && theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </button>
  );
}
