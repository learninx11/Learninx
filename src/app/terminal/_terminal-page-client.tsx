'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TerminalClient } from '@/components/TerminalClient';
import { ListIcon, ResetIcon, TerminalIcon } from '@/components/ui/Icon';

/**
 * A dedicated, lesson-free terminal. Unlike the sandbox embedded on a
 * lesson page, this one has no challenge and no suggested command — it's
 * just a shell to practice in. "New session" remounts <TerminalClient>
 * (via `key`) to get a fresh filesystem, history, and job list.
 */
export function TerminalPageClient() {
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lx-accent">
            <TerminalIcon size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Free practice</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Terminal</h1>
          <p className="max-w-2xl text-sm text-lx-muted">
            No lesson, no challenge — just a Linux-flavored shell to explore, break, and
            rebuild. Everything runs in your browser and nothing is sent anywhere. Type{' '}
            <code className="rounded border border-lx-border bg-lx-code-bg px-1 py-0.5 font-mono text-[0.85em] text-lx-fg">
              help
            </code>{' '}
            to see every simulated command.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/cheatsheet" className="lx-btn lx-btn-ghost lx-btn-sm">
            <ListIcon size={14} /> Cheatsheet
          </Link>
          <button
            type="button"
            onClick={() => setSessionKey((k) => k + 1)}
            className="lx-btn lx-btn-secondary lx-btn-sm"
            title="Start a fresh session — resets the filesystem and history"
          >
            <ResetIcon size={14} /> New session
          </button>
        </div>
      </header>

      <div data-lx-sandbox className="h-[70vh] min-h-[440px] lg:h-[calc(100vh-15rem)]">
        <TerminalClient key={sessionKey} className="h-full" autoFocus />
      </div>
    </div>
  );
}
