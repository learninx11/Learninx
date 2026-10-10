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
      className="lx-theme-dark lx-terminal flex h-full flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-lx-border bg-lx-bg-elevated/70 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/40" />
          <span className="ml-3 font-mono text-lx-subtle">learner@learninx:~</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center text-xs text-lx-subtle">
        <span className="flex items-center gap-2">
          <TerminalIcon size={12} />
          <span className="font-mono">booting sandbox…</span>
          <span className="inline-block h-3.5 w-1.5 animate-lx-blink bg-lx-accent/70" aria-hidden />
        </span>
      </div>
    </div>
  );
}
