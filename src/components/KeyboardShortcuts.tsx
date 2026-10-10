'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLessonNeighbours } from '@/lib/lesson-nav';
import { NAV_GROUPS } from '@/lib/site-nav';
import {
  focusSandbox,
  isModalOpen,
  isTypingTarget,
  openCommandPalette,
  openShortcuts,
  pageSearchInput,
} from '@/lib/ui-events';

/** `g` + letter jumps, built from the site nav so the two never disagree. */
const GO_TO: Record<string, string> = {
  h: '/',
  ...Object.fromEntries(NAV_GROUPS.flatMap((g) => g.items).map((i) => [i.shortcut, i.href])),
};

/**
 * Site-wide single-key shortcuts (the full list lives in ShortcutsDialog):
 * `g <letter>` jumps to a page, `/` searches, `?` shows the cheat sheet,
 * and on a lesson `[` / `]` step through the catalogue and `t` focuses
 * the sandbox. Nothing fires while typing in a field or with a dialog open.
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let awaitingGo = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Shortcuts that move focus into a field do it when the key comes back
    // up, so the keystroke's own character can't land in that field.
    let focusOnKeyUp: (() => void) | null = null;

    function goToLesson(which: 'previous' | 'next', event: KeyboardEvent) {
      const target = getLessonNeighbours()?.[which];
      if (!target) return;
      event.preventDefault();
      router.push(`/lessons/${target.slug}`);
    }

    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || isModalOpen()) return;
      const key = event.key;

      if (awaitingGo) {
        awaitingGo = false;
        if (timer) clearTimeout(timer);
        const lower = key.toLowerCase();
        if (lower === 'n') {
          goToLesson('next', event);
          return;
        }
        const href = GO_TO[lower];
        if (href) {
          event.preventDefault();
          router.push(href);
        }
        return;
      }

      switch (key) {
        case 'g':
          awaitingGo = true;
          timer = setTimeout(() => {
            awaitingGo = false;
          }, 1000);
          return;
        case '?':
          event.preventDefault();
          openShortcuts();
          return;
        case '/': {
          event.preventDefault();
          const input = pageSearchInput();
          if (input) {
            focusOnKeyUp = () => {
              input.focus();
              input.select();
            };
          } else {
            openCommandPalette();
          }
          return;
        }
        case '[':
          goToLesson('previous', event);
          return;
        case ']':
          goToLesson('next', event);
          return;
        case 't':
          if (document.querySelector('[data-lx-sandbox]')) {
            event.preventDefault();
            focusOnKeyUp = () => {
              focusSandbox();
            };
          }
          return;
      }
    }

    function onKeyUp() {
      if (!focusOnKeyUp) return;
      const run = focusOnKeyUp;
      focusOnKeyUp = null;
      run();
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return null;
}
