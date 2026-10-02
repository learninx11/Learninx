import type { Metadata } from 'next';
import { TerminalPageClient } from './_terminal-page-client';

export const metadata: Metadata = {
  title: 'Terminal',
  description:
    'A dedicated, full-screen terminal sandbox for free practice — no lesson, no challenge, just a shell to experiment in.',
};

export default function TerminalPage() {
  return <TerminalPageClient />;
}
