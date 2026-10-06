import type { Metadata } from 'next';
import { FlashcardsClient } from './_flashcards-client';

export const metadata: Metadata = {
  title: 'Flashcards',
  description:
    'Spaced-repetition flashcards for every command in the Learninx sandbox. Read what a command does, type its name, and let the schedule bring it back before you forget.',
};

export default function FlashcardsPage() {
  return <FlashcardsClient />;
}
