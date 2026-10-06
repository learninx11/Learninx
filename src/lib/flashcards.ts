/**
 * Command flashcards, built from the cheatsheet catalogue.
 *
 * Each card shows a command's one-line description and asks the
 * learner to type the command. Scheduling is a five-box Leitner
 * system stored in the progress snapshot (`state.flashcards`), with
 * the intervals defined in `progress-client.ts`.
 *
 * Dependency-free apart from the cheatsheet so it works in the
 * static export.
 */

import { CHEATSHEET, type CheatCategory, type CheatEntry } from './cheatsheet';
import type { FlashcardState } from './progress-types';

export interface Flashcard {
  /** Stable id: the cheatsheet `cmd` string. */
  id: string;
  /** Prompt shown on the front, with the command name masked out. */
  prompt: string;
  /** Every answer we accept, lower-cased. */
  answers: string[];
  /** The canonical answer shown on the back. */
  display: string;
  entry: CheatEntry;
}

/**
 * Cheatsheet entries that are follow-ups to another entry ("tar
 * (advanced)", "stat (extended)") or describe shell syntax rather
 * than a command make poor flashcards.
 */
const SKIP = /\((extended|advanced|flags)\)$/;
const SKIP_IDS = new Set(['chain', 'ss -tunap', 'test / [ ]', 'source / .']);

function answersFor(cmd: string): string[] {
  return cmd
    .replace(/\(.*?\)/g, '')
    .split('/')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0 && part !== '.');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Hide the command name if the tagline happens to include it. */
function maskPrompt(text: string, answers: string[]): string {
  let out = text;
  // Two-letter names like `at` or `cd` collide with ordinary English
  // words, so only longer names are masked.
  for (const a of answers.filter((x) => x.length >= 3)) {
    out = out.replace(new RegExp(`\\b${escapeRegExp(a)}\\b`, 'gi'), '____');
  }
  return out;
}

export const FLASHCARDS: Flashcard[] = CHEATSHEET.filter(
  (e) => !SKIP.test(e.cmd) && !SKIP_IDS.has(e.cmd),
).map((entry) => {
  const answers = answersFor(entry.cmd);
  return {
    id: entry.cmd,
    prompt: maskPrompt(entry.short, answers),
    answers,
    display: entry.cmd,
    entry,
  };
});

const BY_ID = new Map(FLASHCARDS.map((c) => [c.id, c]));

export function getFlashcard(id: string): Flashcard | undefined {
  return BY_ID.get(id);
}

/** Normalise a typed answer: lower-case, collapse whitespace, drop a leading `$ `. */
function normalizeGuess(s: string): string {
  return s.trim().toLowerCase().replace(/^\$\s*/, '').replace(/\s+/g, ' ');
}

/**
 * True if the guess names the command. We accept the bare command
 * ("grep") and also a full invocation that starts with it
 * ("grep -r foo .") because typing an example is a fine answer.
 */
export function isCorrectGuess(card: Flashcard, guess: string): boolean {
  const g = normalizeGuess(guess);
  if (!g) return false;
  const firstWord = g.split(' ')[0] ?? '';
  return card.answers.some((a) => g === a || firstWord === a || g.startsWith(`${a} `));
}

export interface DeckStats {
  total: number;
  /** Never reviewed. */
  fresh: number;
  /** Boxes 1-4. */
  learning: number;
  /** Box 5. */
  mastered: number;
  /** Seen before and due today or earlier. */
  due: number;
  /** Count per Leitner box, index 0 = unseen, 1..5 = boxes. */
  boxes: number[];
}

export function deckStats(
  cards: Flashcard[],
  state: Record<string, FlashcardState>,
  today: string,
): DeckStats {
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const c of cards) {
    const s = state[c.id];
    if (!s) {
      boxes[0]! += 1;
      continue;
    }
    boxes[s.box]! += 1;
    if (s.due <= today) due += 1;
  }
  return {
    total: cards.length,
    fresh: boxes[0]!,
    learning: boxes[1]! + boxes[2]! + boxes[3]! + boxes[4]!,
    mastered: boxes[5]!,
    due,
    boxes,
  };
}

/**
 * Build a review queue: every due card (weakest box first, then the
 * oldest due date), followed by up to `newLimit` unseen cards in
 * catalogue order. Ties are shuffled with the supplied random source
 * so sessions don't always open on the same card.
 */
export function buildSession(
  cards: Flashcard[],
  state: Record<string, FlashcardState>,
  today: string,
  newLimit: number,
  random: () => number = Math.random,
): Flashcard[] {
  const due = cards
    .filter((c) => state[c.id] && state[c.id]!.due <= today)
    .map((c) => ({ c, r: random() }))
    .sort((a, b) => {
      const sa = state[a.c.id]!;
      const sb = state[b.c.id]!;
      if (sa.box !== sb.box) return sa.box - sb.box;
      if (sa.due !== sb.due) return sa.due < sb.due ? -1 : 1;
      return a.r - b.r;
    })
    .map((x) => x.c);
  const fresh = cards.filter((c) => !state[c.id]).slice(0, Math.max(0, newLimit));
  return [...due, ...fresh];
}

export function cardsInCategory(category: CheatCategory | 'All'): Flashcard[] {
  return category === 'All'
    ? FLASHCARDS
    : FLASHCARDS.filter((c) => c.entry.category === category);
}
