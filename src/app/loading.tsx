export default function Loading() {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-24 text-lx-muted">
      <div className="flex items-center gap-1.5 font-mono text-sm" aria-hidden>
        <span className="text-lx-accent">~</span>
        <span className="text-lx-subtle">$</span>
        <span className="inline-block h-4 w-2 animate-lx-blink bg-lx-accent" />
      </div>
      <p className="text-xs text-lx-subtle">Loading…</p>
    </div>
  );
}
