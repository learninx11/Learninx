import type { Metadata } from 'next';
import { TypingTestClient } from './_typing-test-client';

export const metadata: Metadata = {
  title: 'Typing test — Learninx',
  description:
    'Practice typing real shell commands against the clock. Trains muscle memory for the terminal.',
};

export default function TypingPage() {
  return <TypingTestClient />;
}
