'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRightIcon, LightbulbIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';
import { getDailyTip } from '@/lib/tips';

export function DailyTipCard() {
  const { ready, state, markTipSeen } = useProgress();
  // Render an empty card on the server / before hydration so the static
  // HTML matches the first client render. We compute the real tip on
  // mount in the user's local time.
  const [tip, setTip] = useState<{ title: string; body: string; example: string } | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);

  useEffect(() => {
    const t = getDailyTip();
    setTip(t.tip);
    setDayKey(t.dayKey);
  }, []);

  // Once the user has seen today's tip on this browser, we hide the
  // card. (It comes back tomorrow because the day key changes.)
  const seenToday = ready && dayKey != null && state.lastTipDay === dayKey;

  if (tip == null) {
    return <DailyTipSkeleton />;
  }

  if (seenToday) {
    return null;
  }

  return (
    <article className="lx-card relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--lx-accent-glow)] blur-3xl"
        aria-hidden
      />
      <div className="flex items-center gap-2">
        <Pill tone="accent">
          <LightbulbIcon size={12} /> Tip of the day
        </Pill>
        <span className="text-xs text-[var(--lx-muted)]">{dayKey}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold sm:text-xl">{tip.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--lx-muted)]">
        {tip.body}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-3 py-2 font-mono text-xs text-[var(--lx-fg)]">
        <code>{tip.example}</code>
      </pre>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={markTipSeen}
          className="lx-btn lx-btn-secondary lx-btn-sm"
        >
          Got it
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
