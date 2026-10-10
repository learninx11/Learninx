import Link from 'next/link';
import { ArrowRightIcon, TerminalIcon } from '@/components/ui/Icon';
import { NotFoundSearch, NotFoundTranscript } from './_not-found-client';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lx-border bg-lx-surface px-3 py-1 font-mono text-xs text-lx-accent">
        <TerminalIcon size={12} /> 404
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">No such page.</h1>
      <p className="mx-auto mt-3 max-w-md text-lx-muted">
        The link might be stale, or the lesson may have been renamed. Search for it, or
        head back to the lessons.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <NotFoundSearch />
        <Link href="/lessons" className="lx-btn lx-btn-secondary">
          Browse lessons <ArrowRightIcon size={14} />
        </Link>
      </div>

      <NotFoundTranscript />
    </div>
  );
}
