'use client';

import { useEffect, useState } from 'react';
import { ListIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import type { TocEntry } from '@/lib/toc';

/**
 * Sticky table of contents for a long lesson. Renders nothing when
 * there are fewer than two headings — most lessons only have one or
 * two H2s and a ToC would just be visual noise.
 */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(
    entries[0]?.id ?? null,
  );

  // Track which heading is currently in view so we can highlight the
  // matching link. We use IntersectionObserver against the rendered
  // DOM nodes (the Markdown component adds the matching `id`).
  useEffect(() => {
    if (entries.length === 0) return;
    const nodes = entries
      .map((e) => document.getElementById(e.id))
      .filter((n): n is HTMLElement => !!n);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        // The top 30% of the viewport counts as "in view" so the
        // active highlight flips just as the heading nears the top.
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="lx-card sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto p-4 text-sm xl:block"
    >
      <div className="mb-2 flex items-center gap-2">
        <Pill tone="default">
          <ListIcon size={12} /> On this page
        </Pill>
      </div>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={() => setActive(e.id)}
              className={`block rounded-md px-2 py-1.5 text-xs leading-snug transition ${
                active === e.id
                  ? 'bg-[var(--lx-accent-glow)] font-semibold text-[var(--lx-accent)]'
                  : 'text-[var(--lx-muted)] hover:text-[var(--lx-accent)]'
              }`}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
