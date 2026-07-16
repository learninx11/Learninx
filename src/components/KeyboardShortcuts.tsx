'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Two-key keyboard shortcut handler. `g l` -> /lessons, `g h` -> /. */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | null = null;
    let last: string | null = null;

    function isTextTarget(t: EventTarget | null) {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (t.isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTextTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (last === 'g' && key === 'l') {
        e.preventDefault();
        router.push('/lessons');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 'h') {
        e.preventDefault();
        router.push('/');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 'b') {
        e.preventDefault();
        router.push('/boss');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 'a') {
        e.preventDefault();
        router.push('/achievements');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 'p') {
        e.preventDefault();
        router.push('/profile');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 't') {
        e.preventDefault();
        router.push('/typing');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }
      if (last === 'g' && key === 'c') {
        e.preventDefault();
        router.push('/cheatsheet');
        last = null;
        if (pending) clearTimeout(pending);
        return;
      }

      if (key === 'g') {
        last = 'g';
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => {
          last = null;
        }, 800);
        return;
      }
      last = null;
    }

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (pending) clearTimeout(pending);
    };
  }, [router]);

  return null;
}
