'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ListIcon } from '@/components/ui/Icon';
import type { TocEntry } from '@/lib/toc';

/**
 * Table of contents for a long lesson, in two shapes: a sticky `rail`
 * beside the article on wide screens (with the section in view
 * highlighted), and a collapsible `inline` box at the top of the article
 * below that. Renders nothing for lessons with fewer than two headings.
 */
export function TableOfContents({
  entries,
  variant,
}: {
  entries: TocEntry[];
  variant: 'rail' | 'inline';
}) {
  if (entries.length < 2) return null;
  return variant === 'rail' ? <TocRail entries={entries} /> : <TocInline entries={entries} />;
}

function TocRail({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  // Track which heading is currently in view so we can highlight the
  // matching link. The Markdown component gives each heading its `id`.
  useEffect(() => {
    const nodes = entries
      .map((e) => document.getElementById(e.id))
      .filter((n): n is HTMLElement => !!n);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // The top 30% of the viewport counts as "in view" so the highlight
      // flips just as a heading nears the top.
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] self-start overflow-y-auto pb-4 xl:block"
    >
      <p className="lx-eyebrow mb-3 flex items-center gap-1.5">
        <ListIcon size={12} /> On this page
      </p>
      <ul className="space-y-0.5 border-l border-lx-border">
        {entries.map((e) => {
          const isActive = active === e.id;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={() => setActive(e.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3.5 pr-2 text-[13px] leading-snug transition ${
                  isActive
                    ? 'border-lx-accent font-medium text-lx-accent'
                    : 'border-transparent text-lx-muted hover:border-lx-border-strong hover:text-lx-fg'
                }`}
              >
                {e.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TocInline({ entries }: { entries: TocEntry[] }) {
  return (
    <details className="group lx-card xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <ListIcon size={14} className="text-lx-accent" /> On this page
          <span className="font-normal text-lx-subtle">
            {entries.length} sections
          </span>
        </span>
        <ChevronDownIcon size={16} className="text-lx-subtle transition-transform group-open:rotate-180" />
      </summary>
      <ul className="space-y-0.5 border-t border-lx-border px-2 py-2">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-lx-muted transition hover:bg-lx-surface hover:text-lx-accent"
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
