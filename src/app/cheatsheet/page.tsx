import { Pill } from '@/components/ui/Pill';
import { TerminalIcon } from '@/components/ui/Icon';
import { CheatsheetClient } from './_cheatsheet-client';

export const metadata = {
  title: 'Cheatsheet · Learninx',
  description:
    'A searchable quick-reference for every command the Learninx in-browser shell supports.',
};

export default function CheatsheetPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Pill tone="accent">
          <TerminalIcon size={12} /> ~/cheatsheet
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cheatsheet
        </h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          A quick reference for every command the in-browser sandbox supports.
          Search by command name, concept, or task — works offline and on GitHub
          Pages. Press <span className="lx-kbd">/</span> anywhere to focus search.
        </p>
      </header>
      <CheatsheetClient />
    </div>
  );
}
