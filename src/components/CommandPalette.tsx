'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowRightIcon,
  AwardIcon,
  BookIcon,
  CommandIcon,
  GamepadIcon,
  SearchIcon,
  TerminalIcon,
  UserIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { getAllLessons } from '@/lib/lessons';

interface PaletteItem {
  id: string;
  title: string;
  description?: string;
  group: 'Navigate' | 'Lesson' | 'Cheatsheet' | 'Action';
  href?: string;
  keywords?: string[];
  icon: ReactNode;
  onSelect?: () => void;
}

const STATIC_NAV: Omit<PaletteItem, 'id'>[] = [
  {
    title: 'Home',
    description: 'Back to the landing page',
    group: 'Navigate',
    href: '/',
    icon: <ArrowRightIcon size={14} />,
    keywords: ['home', 'landing'],
  },
  {
    title: 'All lessons',
    description: 'Browse the full lesson catalogue',
    group: 'Navigate',
    href: '/lessons',
    icon: <BookIcon size={14} />,
    keywords: ['lessons', 'catalogue', 'list'],
  },
  {
    title: 'Cheatsheet',
    description: 'Searchable command reference',
    group: 'Navigate',
    href: '/cheatsheet',
    icon: <TerminalIcon size={14} />,
    keywords: ['cheatsheet', 'commands', 'reference', 'shell'],
  },
  {
    title: 'Boss levels',
    description: 'Multi-step challenges',
    group: 'Navigate',
    href: '/boss',
    icon: <TerminalIcon size={14} />,
    keywords: ['boss', 'challenge', 'hard'],
  },
  {
    title: 'Typing test',
    description: 'Practice typing real shell commands',
    group: 'Navigate',
    href: '/typing',
    icon: <GamepadIcon size={14} />,
    keywords: ['typing', 'wpm', 'speed', 'practice', 'game'],
  },
  {
    title: 'Achievements',
    description: 'See your unlocked badges',
    group: 'Navigate',
    href: '/achievements',
    icon: <AwardIcon size={14} />,
    keywords: ['achievements', 'badges', 'rewards', 'trophies'],
  },
  {
    title: 'Profile',
    description: 'Lifetime stats, export, and import',
    group: 'Navigate',
    href: '/profile',
    icon: <UserIcon size={14} />,
    keywords: ['profile', 'stats', 'export', 'import', 'backup'],
  },
];

function isMacLike(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const router = useRouter();
  const mac = isMacLike();

  // Open / close keyboard shortcut: Cmd/Ctrl + K, or "/" when no input
  // is focused (mirrors GitHub, Linear, etc.).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const inField =
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName) ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (event.key === '/' && !inField && !open) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Build the item list. Lessons are static data so we can build them
  // once per mount.
  const items = useMemo<PaletteItem[]>(() => {
    const lessons = getAllLessons();
    const fromLessons: PaletteItem[] = lessons.map((l) => ({
      id: `lesson:${l.id}`,
      title: l.title,
      description: l.description,
      group: 'Lesson',
      href: `/lessons/${l.slug}`,
      keywords: [
        l.id,
        l.slug,
        l.title,
        l.description,
        l.trackCommand ?? '',
        l.difficulty,
      ],
      icon: <BookIcon size={14} />,
    }));
    const navItems: PaletteItem[] = STATIC_NAV.map((n, i) => ({
      id: `nav:${i}`,
      ...n,
    }));
    return [...navItems, ...fromLessons];
  }, []);

  // Filter by query. Empty query shows the top items in declaration order.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 12);
    return items
      .map((item) => {
        const haystack = [
          item.title,
          item.description ?? '',
          item.group,
          ...(item.keywords ?? []),
        ]
          .join(' ')
          .toLowerCase();
        const idx = haystack.indexOf(q);
        return { item, score: idx === -1 ? Number.POSITIVE_INFINITY : idx };
      })
      .filter((row) => Number.isFinite(row.score))
      .sort((a, b) => a.score - b.score)
      .slice(0, 30)
      .map((row) => row.item);
  }, [items, query]);

  // Reset highlight when filter changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Focus the input on open.
  useEffect(() => {
    if (open) {
      // microtask after the modal mounts
      requestAnimationFrame(() => inputRef.current?.focus());
      setQuery('');
    }
  }, [open]);

  const choose = useCallback(
    (item: PaletteItem) => {
      if (item.onSelect) {
        item.onSelect();
      } else if (item.href) {
        router.push(item.href);
      }
      setOpen(false);
    },
    [router],
  );

  function onListKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      scrollActiveIntoView();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      scrollActiveIntoView();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filtered[activeIndex];
      if (item) choose(item);
    }
  }

  function scrollActiveIntoView() {
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-idx="${activeIndex}"]`,
      );
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  return (
    <>
      <PaletteTrigger onClick={() => setOpen(true)} mac={mac} />
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
        >
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="lx-card relative z-10 w-full max-w-xl overflow-hidden border-[var(--lx-border-strong)]/70 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--lx-border)] px-4 py-3">
              <SearchIcon size={16} className="text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKey}
                placeholder="Search lessons, jump to a page…"
                className="flex-1 bg-transparent text-sm text-[var(--lx-fg)] outline-none placeholder:text-slate-500"
                aria-label="Search"
              />
              <span className="lx-kbd">esc</span>
            </div>
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-[55vh] overflow-y-auto p-1"
              >
                {renderGroup(filtered, activeIndex, choose, setActiveIndex)}
              </ul>
            )}
            <div className="flex items-center justify-between border-t border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/60 px-4 py-2 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <CommandIcon size={12} /> {mac ? '⌘' : 'Ctrl'} + K
              </span>
              <span>
                <span className="lx-kbd">↑</span> <span className="lx-kbd">↓</span> to
                navigate · <span className="lx-kbd">↵</span> to open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PaletteTrigger({ onClick, mac }: { onClick: () => void; mac: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open command palette"
      className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]"
    >
      <SearchIcon size={12} />
      <span className="hidden sm:inline">Search</span>
      <span className="hidden items-center gap-0.5 sm:flex">
        <span className="lx-kbd">{mac ? '⌘' : 'Ctrl'}</span>
        <span className="lx-kbd">K</span>
      </span>
    </button>
  );
}

function renderGroup(
  items: PaletteItem[],
  activeIndex: number,
  choose: (item: PaletteItem) => void,
  setActive: (i: number) => void,
) {
  const groups: { group: string; items: PaletteItem[]; startIdx: number }[] = [];
  items.forEach((item, i) => {
    const last = groups[groups.length - 1];
    if (last && last.group === item.group) {
      last.items.push(item);
    } else {
      groups.push({ group: item.group, items: [item], startIdx: i });
    }
  });

  let runningIdx = 0;
  return groups.map((g) => {
    const groupEl = (
      <li key={g.group} className="px-1 pb-1 pt-2 first:pt-1">
        <div className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
          {g.group}
        </div>
        <ul>
          {g.items.map((item) => {
            const isActive = runningIdx === activeIndex;
            const idx = runningIdx;
            runningIdx += 1;
            return (
              <li key={item.id} data-idx={idx}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => choose(item)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? 'bg-[var(--lx-accent-glow)] text-[var(--lx-fg)]'
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md border ${
                      isActive
                        ? 'border-[var(--lx-accent)]/50 text-[var(--lx-accent)]'
                        : 'border-slate-800 text-slate-500'
                    }`}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.description && (
                      <span className="block truncate text-xs text-slate-500">
                        {item.description}
                      </span>
                    )}
                  </span>
                  {item.href && (
                    <Pill tone="default" className="!text-[0.6rem]">
                      {item.href}
                    </Pill>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </li>
    );
    return groupEl;
  });
}

// Re-export for the optional "Open search" button callers can place in
// the chrome (e.g. lessons index search bar). Currently unused but
// handy as a public API.
export function openPaletteButtonProps(macLike?: boolean) {
  return {
    label: 'Search',
    hint: macLike ? '⌘K' : 'Ctrl+K',
  };
}
