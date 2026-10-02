'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, SearchIcon, ShareIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
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
  const [activeCategory, setActiveCategory] = useState<CheatCategory | 'All'>(
    'All',
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Press "/" to focus the search box (skip when typing in another field).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== '/') return;
      const target = event.target as HTMLElement | null;
      const inField =
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName) ||
          target.isContentEditable);
      if (inField) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="lx-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden
          >
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, concepts, or tasks (press / )"
            className="lx-input pl-9"
            aria-label="Search cheatsheet"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
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
      </div>

      {filtered.length === 0 ? (
        <div className="lx-card p-10 text-center text-sm text-[var(--lx-muted)]">
          No commands match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, items }) => (
            <section key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{category}</h2>
                <Pill tone="default">{items.length}</Pill>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
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
      disabled={count === 0}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]'
          : 'border-[var(--lx-border)] text-[var(--lx-muted)] hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]'
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

function CheatCard({
  entry,
  highlighted,
}: {
  entry: CheatEntry;
  highlighted: boolean;
}) {
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
      className={`lx-card flex flex-col gap-3 p-4 transition-shadow sm:p-5 ${
        highlighted ? 'ring-2 ring-[var(--lx-accent)]' : ''
      }`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <h3 className="font-mono text-base font-semibold text-[var(--lx-accent)]">
            {entry.cmd}
          </h3>
          <CopyButton text={entry.cmd} label={`Copy command: ${entry.cmd}`} />
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <Pill tone="default">{entry.category}</Pill>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center rounded p-1 text-[var(--lx-muted)] transition hover:text-[var(--lx-accent)]"
            aria-label={linkCopied ? 'Link copied' : `Copy link to ${entry.cmd}`}
            title={linkCopied ? 'Link copied' : 'Copy link to this command'}
          >
            {linkCopied ? <CheckIcon size={12} /> : <ShareIcon size={12} />}
          </button>
        </span>
      </header>
      <p className="text-sm font-medium text-[var(--lx-fg)]">{entry.short}</p>
      <p className="text-sm leading-relaxed text-[var(--lx-muted)]">
        {entry.long}
      </p>
      {entry.examples.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
            Examples
          </div>
          <ul className="space-y-1.5 font-mono text-sm">
            {entry.examples.map((ex) => (
              <li
                key={ex}
                className="rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] flex items-center justify-between gap-2 pl-2.5 pr-1.5 py-1.5 text-[var(--lx-fg)]"
              >
                <code className="truncate">$ {ex}</code>
                <CopyButton text={ex} label={`Copy command: ${ex}`} showLabel />
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
function CopyButton({
  text,
  label,
  showLabel = false,
}: {
  text: string;
  label: string;
  showLabel?: boolean;
}) {
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
      className="inline-flex shrink-0 items-center gap-1 rounded border-[var(--lx-border)] px-1.5 py-0.5 text-[0.7rem] text-[var(--lx-muted)] transition hover:border-[var(--lx-accent)] hover:text-[var(--lx-accent)]"
      aria-label={copied ? `Copied: ${text}` : label}
    >
      {copied ? (
        <>
          <CheckIcon size={showLabel ? 12 : 11} /> {showLabel && 'Copied'}
        </>
      ) : (
        <>
          <CopyIcon size={showLabel ? 12 : 11} /> {showLabel && 'Copy'}
        </>
      )}
    </button>
  );
}
