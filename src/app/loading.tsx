import { TerminalIcon } from '@/components/ui/Icon';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="text-[var(--lx-accent)]">~</span>
        <span className="text-slate-500">$</span>
        <span className="ml-2 inline-flex">
          <span className="animate-pulse">.</span>
          <span className="animate-pulse [animation-delay:120ms]">.</span>
          <span className="animate-pulse [animation-delay:240ms]">.</span>
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <TerminalIcon size={12} /> Booting the sandbox
      </p>
    </div>
  );
}
