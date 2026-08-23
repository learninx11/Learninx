'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import {
  CHEATSHEET,
  CHEAT_CATEGORIES,
  cheatMatches,
  type CheatCategory,
  type CheatEntry,
} from '@/lib/cheatsheet';

export function CheatsheetClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CheatCategory | 'All'>(
    'All',
  );
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

  const filtered = useMemo(() => {
    return CHEATSHEET.filter((entry) => {
      if (activeCategory !== 'All' && entry.category !== activeCategory) {
        return false;
      }
      return cheatMatches(entry, query);
    });
  }, [query, activeCategory]);

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
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {CHEAT_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
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
                  <CheatCard key={entry.cmd} entry={entry} />
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
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
        active
          ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]'
          : 'border-[var(--lx-border)] text-[var(--lx-muted)] hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]'
      }`}
    >
      {label}
    </button>
  );
}

function CheatCard({ entry }: { entry: CheatEntry }) {
  return (
    <article
      id={`cmd-${entry.cmd.replace(/[^a-z0-9]+/gi, '-')}`}
      className="lx-card flex flex-col gap-3 p-4 sm:p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-base font-semibold text-[var(--lx-accent)]">
          {entry.cmd}
        </h3>
        <Pill tone="default">{entry.category}</Pill>
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
                className="rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-2.5 py-1.5 text-[var(--lx-fg)]"
              >
                <code>$ {ex}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
