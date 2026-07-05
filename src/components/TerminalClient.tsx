'use client';

import dynamic from 'next/dynamic';
import { TerminalIcon } from '@/components/ui/Icon';

// Lazy-load the xterm-based Terminal with SSR disabled.
// xterm touches `self` at module-load time, so it cannot be imported
// from a server component (the lesson page).
const Terminal = dynamic(() => import('./Terminal').then((m) => m.Terminal), {
  ssr: false,
  loading: () => <SandboxSkeleton />,
});

export function TerminalClient(
  props: React.ComponentProps<typeof Terminal>,
) {
  return <Terminal {...props} />;
}

function SandboxSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading sandbox"
      className="lx-card flex h-full flex-col overflow-hidden border-slate-800/80"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500/40" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-500/40 [animation-delay:120ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500/40 [animation-delay:240ms]" />
          <span className="ml-3 font-mono text-slate-500">learner@learninx:~</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[var(--lx-bg)] text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <TerminalIcon size={12} />
          <span className="font-mono">booting sandbox…</span>
        </span>
      </div>
    </div>
  );
}
