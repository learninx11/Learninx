import Link from 'next/link';
import { ArrowRightIcon, TerminalIcon } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
        <TerminalIcon size={12} /> 404
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        No such command.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-slate-400">
        We could not find that page. The link might be stale, or the lesson may
        have been renamed.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/lessons" className="lx-btn lx-btn-primary">
          Browse lessons <ArrowRightIcon size={14} />
        </Link>
        <Link href="/" className="lx-btn lx-btn-secondary">
          Back home
        </Link>
      </div>

      <pre className="mt-10 inline-block rounded-md border border-slate-800 bg-slate-950/80 px-4 py-3 text-left font-mono text-xs text-slate-400">
{`$ open ${'{path}'}
bash: ${'{path}'}: No such file or directory`}
      </pre>
    </div>
  );
}
