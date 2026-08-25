'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  LightbulbIcon,
  RotateCcwIcon,
  ShuffleIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';
import { getAllTips, getDailyTip } from '@/lib/tips';

export function DailyTipCard() {
  const { ready, state, markTipSeen, recordTipSeen } = useProgress();
  // Render an empty card on the server / before hydration so the static
  // HTML matches the first client render. We compute the real tip on
  // mount in the user's local time.
  const [today, setToday] = useState<
    | { tip: { title: string; body: string; example: string }; index: number; dayKey: string }
    | null
  >(null);
  // `view` indexes the TIPS catalogue. `null` means "show today's".
  const [view, setView] = useState<number | null>(null);
  // Bumped on every shuffle so the "Seen" pill re-renders with a
  // fresh count even if the underlying state is identical.
  const [seenVersion, setSeenVersion] = useState(0);

  useEffect(() => {
    const t = getDailyTip();
    setToday({ tip: t.tip, index: t.index, dayKey: t.dayKey });
  }, []);

  const tips = useMemo(() => getAllTips(), []);
  const currentIndex = view ?? today?.index ?? 0;
  const currentTip = today != null ? tips[currentIndex] ?? today.tip : null;

  // Once the user has seen today's tip on this browser, we hide the
  // card. (It comes back tomorrow because the day key changes.) We
  // only auto-dismiss when the visitor is on today's tip — exploring
  // older ones shouldn't dismiss the card for the rest of the day.
  const onToday = today != null && (view ?? today.index) === today.index;
  const seenToday =
    ready && today != null && onToday && state.lastTipDay === today.dayKey;

  if (today == null || currentTip == null) {
    return <DailyTipSkeleton />;
  }

  if (seenToday) {
    return null;
  }

  const shuffle = () => {
    if (tips.length <= 1) return;
    // Prefer a tip the visitor has not seen yet. Fall back to any
    // other tip; fall back further to a re-shuffle.
    const seen = new Set(state.tipsSeen);
    const unseen = tips
      .map((_, i) => i)
      .filter((i) => i !== currentIndex && !seen.has(i));
    const pool =
      unseen.length > 0
        ? unseen
        : tips.map((_, i) => i).filter((i) => i !== currentIndex);
    if (pool.length === 0) {
      // Single-tip catalogue — nothing to shuffle to.
      return;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    setView(next);
    setSeenVersion((v) => v + 1);
    recordTipSeen(next);
  };

  const reset = () => {
    setView(null);
    setSeenVersion((v) => v + 1);
    // Record today's deterministic tip as seen so it counts toward
    // the Tip explorer achievement if the visitor never shuffled.
    recordTipSeen(today.index);
  };

  const dismiss = () => {
    // Make sure the day key + today's index get persisted together.
    markTipSeen(today.index);
  };

  const seenCount = state.tipsSeen.length;
  const totalCount = tips.length;

  return (
    <article className="lx-card relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--lx-accent-glow)] blur-3xl"
        aria-hidden
      />
      <div className="flex items-center gap-2">
        <Pill tone="accent">
          <LightbulbIcon size={12} />{' '}
          {onToday ? 'Tip of the day' : 'Tip explorer'}
        </Pill>
        <span className="text-xs text-[var(--lx-muted)]">
          {onToday ? today.dayKey : `Tip ${currentIndex + 1} / ${totalCount}`}
        </span>
        <span
          className="ml-auto text-[0.65rem] uppercase tracking-wider text-[var(--lx-muted)]"
          // Re-read when shuffle happens so the count refreshes.
          data-version={seenVersion}
        >
          <span suppressHydrationWarning>{seenCount}</span> seen
        </span>
      </div>
      <h2 className="mt-3 text-lg font-semibold sm:text-xl">
        {currentTip.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--lx-muted)]">
        {currentTip.body}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-3 py-2 font-mono text-xs text-[var(--lx-fg)]">
        <code>{currentTip.example}</code>
      </pre>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onToday ? (
          <button
            type="button"
            onClick={dismiss}
            className="lx-btn lx-btn-secondary lx-btn-sm"
          >
            Got it
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="lx-btn lx-btn-secondary lx-btn-sm"
          >
            <RotateCcwIcon size={12} /> Back to today
          </button>
        )}
        <button
          type="button"
          onClick={shuffle}
          disabled={tips.length <= 1}
          className="lx-btn lx-btn-secondary lx-btn-sm"
          aria-label="Show a different tip"
        >
          <ShuffleIcon size={12} /> Shuffle
        </button>
        <Link
          href="/cheatsheet"
          className="inline-flex items-center gap-1 text-xs text-[var(--lx-accent)] hover:underline"
        >
          See the cheatsheet <ArrowRightIcon size={12} />
        </Link>
      </div>
    </article>
  );
}

function DailyTipSkeleton() {
  return (
    <div className="lx-card h-48 animate-pulse p-5 sm:p-6" aria-hidden />
  );
}
