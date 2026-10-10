'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, CloseIcon, CodeIcon, CopyIcon, SearchIcon, ShareIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import {
  CHEATSHEET,
  CHEAT_CATEGORIES,
  cheatMatches,
  type CheatCategory,
  type CheatEntry,
} from '@/lib/cheatsheet';

function cardId(cmd: string): string {
  return `cmd-${cmd.replace(/[^a-z0-9]+/gi, '-')}`;
}

export function CheatsheetClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CheatCategory | 'All'>('All');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // A link to `#cmd-chmod` should scroll to and briefly highlight that
  // card — the id is already there for anchor purposes, but a client-
  // rendered list can't rely on the browser's native hash-scroll alone
  // since the target may not exist in the DOM at the moment of first paint.
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    setHighlightId(id);
    const timeout = window.setTimeout(() => setHighlightId(null), 2200);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = useMemo(() => {
    return CHEATSHEET.filter((entry) => {
      if (activeCategory !== 'All' && entry.category !== activeCategory) {
        return false;
      }
      return cheatMatches(entry, query);
    });
  }, [query, activeCategory]);

  // Counts reflect the current search text but ignore the category filter
  // itself, so a chip always shows "how many results if you picked this
  // one" rather than re-deriving from an already-narrowed list.
  const categoryCounts = useMemo(() => {
    const matching = CHEATSHEET.filter((entry) => cheatMatches(entry, query));
    const counts = new Map<CheatCategory, number>();
    for (const entry of matching) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }
    return { total: matching.length, byCategory: counts };
  }, [query]);

  const grouped = useMemo(() => {
    const out: { category: CheatCategory; items: CheatEntry[] }[] = [];
    for (const cat of CHEAT_CATEGORIES) {
      const items = filtered.filter((e) => e.category === cat);
      if (items.length > 0) out.push({ category: cat, items });
    }
    return out;
  }, [filtered]);

  const filteringActive = query.trim() !== '' || activeCategory !== 'All';

  function clearFilters() {
    setQuery('');
    setActiveCategory('All');
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-6">
      <div className="lx-card sticky top-[4.25rem] z-20 space-y-3 bg-lx-surface-strong/90 p-4 shadow-lx-lg sm:p-5">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lx-subtle"
            aria-hidden
          >
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            type="search"
            data-lx-page-search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.preventDefault();
                setQuery('');
              }
            }}
            placeholder="Search commands, concepts, or tasks — try “permissions”"
            className="lx-input pl-9 pr-16 font-sans [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search the cheatsheet"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-lx-subtle transition hover:text-lx-fg"
            >
              <CloseIcon size={14} />
            </button>
          ) : (
            <kbd className="lx-kbd pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 sm:inline-flex">
              /
            </kbd>
          )}
        </div>
        <div
          role="group"
          aria-label="Category"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <CategoryChip
            label="All"
            count={categoryCounts.total}
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {CHEAT_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              count={categoryCounts.byCategory.get(c) ?? 0}
              active={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            />
          ))}
        </div>
        {filteringActive && (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-lx-subtle" aria-live="polite">
            {filtered.length} command{filtered.length === 1 ? '' : 's'} shown
            <button type="button" onClick={clearFilters} className="font-medium text-lx-accent hover:underline">
              Clear filters
            </button>
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="lx-card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-lx-muted">No commands match &ldquo;{query.trim()}&rdquo;.</p>
          <button type="button" onClick={clearFilters} className="lx-btn lx-btn-secondary lx-btn-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ category, items }) => (
            <section key={category} aria-labelledby={`cat-${category}`} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 id={`cat-${category}`} className="text-lg font-semibold">
                  {category}
                </h2>
                <Pill tone="default">{items.length}</Pill>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((entry) => (
                  <CheatCard
                    key={entry.cmd}
                    entry={entry}
                    highlighted={highlightId === cardId(entry.cmd)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0 && !active}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-lx-accent bg-lx-accent-glow text-lx-accent'
          : 'border-lx-border text-lx-muted hover:border-lx-accent/40 hover:text-lx-fg'
      }`}
    >
      {label} <span className="tabular-nums opacity-60">{count}</span>
    </button>
  );
}

function CheatCard({ entry, highlighted }: { entry: CheatEntry; highlighted: boolean }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const id = cardId(entry.cmd);

  async function copyLink(): Promise<void> {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      /* clipboard blocked (e.g. insecure context) */
    }
  }

  return (
    <article
      id={id}
      className={`lx-card flex min-w-0 scroll-mt-48 flex-col gap-3 p-4 transition-shadow sm:p-5 ${
        highlighted ? 'ring-2 ring-lx-accent' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1">
          <h3 className="truncate font-mono text-base font-semibold text-lx-accent">{entry.cmd}</h3>
          <CopyButton text={entry.cmd} label={`Copy command: ${entry.cmd}`} />
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex shrink-0 items-center gap-1 rounded p-1 text-lx-subtle transition hover:text-lx-accent"
          aria-label={linkCopied ? 'Link copied' : `Copy link to ${entry.cmd}`}
          title={linkCopied ? 'Link copied' : 'Copy a link to this command'}
        >
          {linkCopied ? <CheckIcon size={13} /> : <ShareIcon size={13} />}
        </button>
      </header>
      <p className="text-sm font-medium text-lx-fg [overflow-wrap:anywhere]">
        <RichText text={entry.short} />
      </p>
      <p className="text-sm leading-relaxed text-lx-muted [overflow-wrap:anywhere]">
        <RichText text={entry.long} />
      </p>
      {entry.examples.length > 0 && (
        <div className="space-y-1.5">
          <div className="lx-eyebrow">Examples</div>
          <ul className="space-y-1.5 font-mono text-sm">
            {entry.examples.map((ex) => (
              <li
                key={ex}
                className="flex items-center justify-between gap-2 rounded-md border border-lx-border bg-lx-code-bg py-1 pl-2.5 pr-1 text-lx-fg"
              >
                <code className="min-w-0 truncate" title={ex}>
                  <span className="select-none text-lx-subtle">$ </span>
                  {ex}
                </code>
                <span className="flex shrink-0 items-center">
                  <Link
                    href={`/explain?cmd=${encodeURIComponent(ex)}`}
                    className="inline-flex items-center rounded px-1.5 py-1 text-lx-subtle transition hover:text-lx-accent"
                    aria-label={`Explain: ${ex}`}
                    title="Explain this command"
                  >
                    <CodeIcon size={13} />
                  </Link>
                  <CopyButton text={ex} label={`Copy command: ${ex}`} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

/**
 * Small copy-to-clipboard button. Shows a check for a moment after a
 * successful copy so the user gets confirmation without a toast.
 */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked (e.g. insecure context) */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-1 transition ${
        copied ? 'text-lx-success' : 'text-lx-subtle hover:text-lx-accent'
      }`}
      aria-label={copied ? `Copied: ${text}` : label}
      title={copied ? 'Copied' : 'Copy'}
    >
      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
    </button>
  );
}
