import type { Metadata } from 'next';
import { Pill } from '@/components/ui/Pill';
import { CodeIcon } from '@/components/ui/Icon';
import { ExplainClient } from './_explain-client';

export const metadata: Metadata = {
  title: 'Explain a command',
  description:
    'Paste a shell one-liner and see what every command, flag, pipe, and redirect does. Built from the Learninx cheatsheet, runs entirely in your browser.',
};

export default function ExplainPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Pill tone="accent">
          <CodeIcon size={12} /> ~/explain
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explain a command</h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          Paste a command you found in a tutorial, a README, or a colleague&apos;s
          script. Each command, flag, pipe, and redirect gets a plain-English
          explanation. Nothing is executed and nothing leaves your browser.
        </p>
      </header>
      <ExplainClient />
    </div>
  );
}
