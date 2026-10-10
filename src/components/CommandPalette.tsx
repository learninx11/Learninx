'use client';

import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  CheckIcon,
  HomeIcon,
  KeyboardIcon,
  ListIcon,
  MonitorIcon,
  MoonIcon,
  PlayIcon,
  SearchIcon,
  ShuffleIcon,
  SunIcon,
} from '@/components/ui/Icon';
import { plainText } from '@/components/ui/RichText';
import { TrackIcon } from '@/components/TrackIcon';
import type { CheatEntry } from '@/lib/cheatsheet';
import { getAllLessons } from '@/lib/lessons';
import { TRACK_DESCRIPTION, TRACK_LABEL, TRACK_ORDER } from '@/lib/lesson-tracks';
import { findNextLesson } from '@/lib/next-lesson';
import { useProgress } from '@/lib/progress-context';
import { NAV_GROUPS } from '@/lib/site-nav';
import { useTheme } from '@/lib/theme';
import { OPEN_PALETTE_EVENT, openShortcuts } from '@/lib/ui-events';
import { useModal } from '@/lib/use-modal';
import { useModKey } from '@/lib/use-mod-key';

type Group = 'Continue' | 'Pages' | 'Tracks' | 'Commands' | 'Lessons' | 'Actions';

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  group: Group;
  href?: string;
  onSelect?: () => void;
  keywords: string[];
  icon: ReactNode;
  /** Right-hand hint, e.g. the item's `g` shortcut. */
  hint?: ReactNode;
  done?: boolean;
  /** Only listed once the visitor types something. */
  searchOnly?: boolean;
}

const GROUP_BIAS: Record<Group, number> = {
  Continue: -12,
  Pages: -8,
  Commands: -6,
  Tracks: -4,
  Actions: -3,
  Lessons: 0,
};

const LESSONS = getAllLessons();

function rank(item: PaletteItem, query: string, terms: string[]): number | null {
  const title = item.title.toLowerCase();
  const haystack = [title, item.subtitle ?? '', item.group, ...item.keywords].join(' ').toLowerCase();
  if (!terms.every((t) => haystack.includes(t))) return null;
  let score = GROUP_BIAS[item.group];
  if (title === query) score -= 100;
  else if (title.startsWith(query)) score -= 60;
  else if (title.split(/[\s:/&-]+/).some((word) => word.startsWith(query))) score -= 40;
  else if (title.includes(query)) score -= 25;
  for (const t of terms) if (title.includes(t)) score -= 5;
  return score;
}

/**
 * Cmd/Ctrl+K palette: jump to any page, track, or lesson, pick up where
 * you left off, or run a quick action (theme, shortcuts, random lesson).
 * The header's search button and the `/` key open it via
 * `openCommandPalette()`.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const listId = useId();
  const mod = useModKey();
  const { completedSet, ready } = useProgress();
  const { resolved, preference, setPreference } = useTheme();
  // The cheatsheet is only needed once someone searches, so it loads the
  // first time the palette opens instead of shipping with every page.
  const [commands, setCommands] = useState<CheatEntry[] | null>(null);

  const close = useCallback(() => setOpen(false), []);
  useModal(open, close, panelRef);

  useEffect(() => {
    if (!open || commands) return;
    let cancelled = false;
    import('@/lib/cheatsheet').then(
      (m) => {
        if (!cancelled) setCommands(m.CHEATSHEET);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [open, commands]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];

    const next = ready ? findNextLesson(LESSONS, completedSet) : null;
    if (next) {
      list.push({
        id: 'continue',
        title: `Continue: ${next.title}`,
        subtitle: `${TRACK_LABEL[next.track]} · up next`,
        group: 'Continue',
        href: `/lessons/${next.slug}`,
        keywords: ['continue', 'resume', 'next', next.title],
        icon: <PlayIcon size={14} />,
      });
    }

    list.push({
      id: 'page:/',
      title: 'Home',
      subtitle: 'Back to the start page',
      group: 'Pages',
      href: '/',
      keywords: ['home', 'landing', 'start'],
      icon: <HomeIcon size={14} />,
      hint: <ShortcutHint keys={['g', 'h']} />,
    });
    for (const item of NAV_GROUPS.flatMap((g) => g.items)) {
      const Icon = item.icon;
      list.push({
        id: `page:${item.href}`,
        title: item.label,
        subtitle: item.blurb,
        group: 'Pages',
        href: item.href,
        keywords: [item.href.slice(1)],
        icon: <Icon size={14} />,
        hint: <ShortcutHint keys={['g', item.shortcut]} />,
      });
    }

    list.push(
      {
        id: 'action:theme',
        title: resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        group: 'Actions',
        onSelect: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'colors'],
        icon: resolved === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />,
      },
      {
        id: 'action:system-theme',
        title: 'Use the system theme',
        subtitle: preference === 'system' ? 'On — following your device' : 'Follow your device setting',
        group: 'Actions',
        onSelect: () => setPreference('system'),
        keywords: ['theme', 'system', 'auto', 'os', 'dark', 'light', 'appearance'],
        icon: <MonitorIcon size={14} />,
      },
      {
        id: 'action:shortcuts',
        title: 'Keyboard shortcuts',
        group: 'Actions',
        onSelect: () => window.setTimeout(openShortcuts, 0),
        keywords: ['keys', 'hotkeys', 'keyboard', 'help', 'shortcuts'],
        icon: <KeyboardIcon size={14} />,
        hint: <ShortcutHint keys={['?']} />,
      },
      {
        id: 'action:random',
        title: 'Surprise me',
        subtitle: 'Open a random lesson you haven’t finished',
        group: 'Actions',
        onSelect: () => {
          const pool = LESSONS.filter((l) => !completedSet.has(l.id));
          const from = pool.length > 0 ? pool : LESSONS;
          const pick = from[Math.floor(Math.random() * from.length)];
          if (pick) router.push(`/lessons/${pick.slug}`);
        },
        keywords: ['random', 'surprise', 'lucky', 'lesson'],
        icon: <ShuffleIcon size={14} />,
      },
    );

    for (const track of TRACK_ORDER) {
      list.push({
        id: `track:${track}`,
        title: TRACK_LABEL[track],
        subtitle: TRACK_DESCRIPTION[track],
        group: 'Tracks',
        href: `/lessons/track/${track}`,
        keywords: ['track', 'lessons', track],
        icon: <TrackIcon track={track} size={14} />,
        searchOnly: true,
      });
    }

    for (const entry of commands ?? []) {
      list.push({
        id: `cmd:${entry.cmd}`,
        title: entry.cmd,
        subtitle: plainText(entry.short),
        group: 'Commands',
        href: `/cheatsheet#cmd-${entry.cmd.replace(/[^a-z0-9]+/gi, '-')}`,
        keywords: [entry.category, ...entry.keywords],
        icon: <ListIcon size={14} />,
        searchOnly: true,
      });
    }

    for (const lesson of LESSONS) {
      list.push({
        id: `lesson:${lesson.id}`,
        title: lesson.title,
        subtitle: plainText(lesson.description),
        group: 'Lessons',
        href: `/lessons/${lesson.slug}`,
        keywords: [lesson.slug, lesson.trackCommand ?? '', lesson.difficulty, TRACK_LABEL[lesson.track]],
        icon: <TrackIcon track={lesson.track} size={14} />,
        done: completedSet.has(lesson.id),
        searchOnly: true,
      });
    }

    return list;
  }, [ready, completedSet, resolved, preference, setPreference, router, commands]);

  // Matching items, best first, then gathered under their group headings
  // (groups ordered by their best match) so headings never repeat.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let ordered: PaletteItem[];
    if (!q) {
      ordered = items.filter((i) => !i.searchOnly);
    } else {
      const terms = q.split(/\s+/);
      ordered = items
        .map((item) => ({ item, score: rank(item, q, terms) }))
        .filter((row): row is { item: PaletteItem; score: number } => row.score !== null)
        .sort((a, b) => a.score - b.score)
        .slice(0, 40)
        .map((row) => row.item);
    }
    const byGroup = new Map<Group, PaletteItem[]>();
    for (const item of ordered) {
      const bucket = byGroup.get(item.group);
      if (bucket) bucket.push(item);
      else byGroup.set(item.group, [item]);
    }
    return [...byGroup.entries()].map(([group, groupItems]) => ({ group, items: groupItems }));
  }, [items, query]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const optionId = (i: number) => `${listId}-opt-${i}`;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted row visible as the arrow keys move it.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open]);

  function choose(item: PaletteItem) {
    setOpen(false);
    if (item.onSelect) item.onSelect();
    else if (item.href) router.push(item.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const count = flat.length;
    if (count === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + count) % count);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(count - 1, i + 6));
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 6));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flat[activeIndex];
      if (item) choose(item);
    }
  }

  if (!open) return null;

  let running = 0;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[8vh] sm:px-4 sm:pt-[12vh]"
    >
      <div
        aria-hidden
        onClick={close}
        className="absolute inset-0 bg-lx-overlay backdrop-blur-sm animate-lx-fade-in"
      />
      <div
        ref={panelRef}
        className="lx-popover relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden animate-lx-pop-in"
      >
        <div className="flex items-center gap-3 border-b border-lx-border px-4">
          <SearchIcon size={16} className="shrink-0 text-lx-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search lessons, commands, and pages…"
            className="h-12 min-w-0 flex-1 bg-transparent text-base text-lx-fg outline-none placeholder:text-lx-subtle focus-visible:outline-none sm:text-[15px]"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat.length > 0 ? optionId(activeIndex) : undefined}
            aria-label="Search Learninx"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={close}
            className="rounded-md px-1.5 py-1 text-xs text-lx-subtle transition hover:text-lx-fg"
          >
            <span className="sm:hidden">Cancel</span>
            <kbd className="lx-kbd hidden sm:inline-flex">Esc</kbd>
          </button>
        </div>

        {flat.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-lx-fg">No results for “{query.trim()}”</p>
            <p className="mt-1 text-xs text-lx-subtle">
              Try a command name like <code className="font-mono">grep</code>, or a topic like{' '}
              <code className="font-mono">kubernetes</code>.
            </p>
          </div>
        ) : (
          <ul
            id={listId}
            role="listbox"
            aria-label="Results"
            className="flex-1 overflow-y-auto overscroll-contain p-2"
          >
            {groups.map(({ group, items: groupItems }) => (
              <li key={group} role="presentation" className="pb-1">
                <div id={`${listId}-${group}`} aria-hidden className="lx-eyebrow px-3 pb-1.5 pt-2">
                  {group}
                </div>
                <ul role="group" aria-labelledby={`${listId}-${group}`}>
                  {groupItems.map((item) => {
                    const index = running++;
                    const active = index === activeIndex;
                    return (
                      <li
                        key={item.id}
                        id={optionId(index)}
                        role="option"
                        aria-selected={active}
                        onMouseMove={() => active || setActiveIndex(index)}
                        onClick={() => choose(item)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                          active ? 'bg-lx-accent-glow' : ''
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            active
                              ? 'border-lx-accent/50 text-lx-accent'
                              : 'border-lx-border text-lx-subtle'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate font-medium ${active ? 'text-lx-fg' : 'text-lx-prose-body'}`}
                          >
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-lx-subtle">{item.subtitle}</span>
                          )}
                        </span>
                        {item.done && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-lx-success">
                            <CheckIcon size={12} /> Done
                          </span>
                        )}
                        {item.hint && <span className="hidden shrink-0 sm:inline-flex">{item.hint}</span>}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden items-center justify-between gap-3 border-t border-lx-border bg-lx-surface px-4 py-2 text-xs text-lx-subtle sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="lx-kbd">↑</kbd>
            <kbd className="lx-kbd">↓</kbd> to move
            <kbd className="lx-kbd ml-2">↵</kbd> to open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="lx-kbd">{mod}</kbd>
            <kbd className="lx-kbd">K</kbd> to toggle
          </span>
        </div>
      </div>
    </div>
  );
}

function ShortcutHint({ keys }: { keys: string[] }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {keys.map((k) => (
        <kbd key={k} className="lx-kbd">
          {k}
        </kbd>
      ))}
    </span>
  );
}
