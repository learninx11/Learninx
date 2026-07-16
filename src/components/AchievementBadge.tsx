'use client';

import type { Achievement } from '@/lib/achievements';

/**
 * Tiny inline-SVG medallion used in the achievements page and in
 * toasts. Pure presentational — no state, no events.
 */
export function AchievementBadge({
  glyph,
  size = 24,
  unlocked = true,
  className,
}: {
  glyph: Achievement['glyph'];
  size?: number;
  unlocked?: boolean;
  className?: string;
}) {
  const base = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    className,
  };
  const inner = (() => {
    switch (glyph) {
      case 'rocket':
        return (
          <>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15c-1.98 0-3.5-1.6-3.5-3.55 0-2.54 2.04-5.45 3.5-7.45 1.46 2 3.5 4.91 3.5 7.45C15.5 13.4 13.98 15 12 15z" />
            <path d="M9 12c-1.5 0-3-1-3-3" />
          </>
        );
      case 'book':
        return (
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
            <path d="M4 5.5V19.5" />
          </>
        );
      case 'streak':
        return (
          <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-2 1-4 3-4 6a8 8 0 0 0 16 0c0-6-9-11-9-11z" />
        );
      case 'quiz':
        return (
          <>
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </>
        );
      case 'boss':
        return (
          <>
            <path d="M7 21h10l1-7H6z" />
            <path d="M9 14V7a3 3 0 0 1 6 0v7" />
            <path d="M9 11h6" />
          </>
        );
      case 'bookmark':
        return <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />;
      case 'note':
        return (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </>
        );
      case 'trophy':
        return (
          <>
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
            <path d="M17 5h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4M7 5H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
          </>
        );
      case 'share':
        return (
          <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
          </>
        );
      case 'typing':
        return (
          <>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M8 18h8" />
          </>
        );
      case 'first':
        return (
          <>
            <path d="M5 13l4 4L19 7" />
          </>
        );
      case 'perfectionist':
        return (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </>
        );
    }
  })();
  return (
    <svg {...base} opacity={unlocked ? 1 : 0.35}>
      {inner}
    </svg>
  );
}
