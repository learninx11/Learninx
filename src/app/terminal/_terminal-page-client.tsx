'use client';

import { useState } from 'react';
import { TerminalClient } from '@/components/TerminalClient';
import { ResetIcon, TerminalIcon } from '@/components/ui/Icon';

/**
 * A dedicated, lesson-free terminal. Unlike the sandbox embedded on a
 * lesson page, this one has no challenge and no suggested command — it's
 * just a shell to practice in. "New session" remounts <TerminalClient>
 * (via `key`) to get a fresh filesystem, history, and job list.
 */
export function TerminalPageClient() {
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[var(--lx-accent)]">
            <TerminalIcon size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Free practice
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Terminal
          </h1>
          <p className="max-w-2xl text-sm text-[var(--lx-muted)]">
            No lesson, no challenge — just a Linux-flavored shell to explore,
            break, and rebuild. Everything runs in your browser; nothing is
            sent anywhere. Type{' '}
            <code className="rounded bg-slate-800/80 px-1 py-0.5 font-mono text-[0.85em] text-slate-300">
              help
            </code>{' '}
            to see every simulated command.
          </p>
        </div>
        <button
          onClick={() => setSessionKey((k) => k + 1)}
          className="lx-btn lx-btn-secondary lx-btn-sm shrink-0"
          title="Start a fresh session — resets the filesystem and history"
        >
          <ResetIcon size={14} />
          New session
        </button>
      </header>

      <div className="h-[65vh] min-h-[460px] lg:h-[calc(100vh-16rem)]">
        <TerminalClient key={sessionKey} className="h-full" />
      </div>
    </div>
  );
}
