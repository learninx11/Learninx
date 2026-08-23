/**
 * Achievement definitions for Learninx.
 *
 * Achievements are awarded client-side based on the visitor's
 * progress snapshot. They live in a separate file so the catalogue is
 * easy to extend without touching the progress store or context.
 *
 * Every achievement is purely derived from the `ProgressState` plus
 * the lesson catalogue / boss catalogue. Nothing in here touches the
 * network or filesystem.
 */

import { getAllBosses } from './bosses';
import { getAllLessons } from './lessons';
import type { ProgressState, TypingScore } from './progress-types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Simple emoji-style badge rendered as an inline-SVG inside the card. */
  glyph: 'rocket' | 'book' | 'streak' | 'quiz' | 'boss' | 'bookmark' | 'note' | 'trophy' | 'share' | 'typing' | 'first' | 'perfectionist';
  /** Optional hidden achievement — not shown until unlocked. */
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'First step',
    description: 'Complete your first lesson.',
    glyph: 'rocket',
  },
  {
    id: 'halfway',
    title: 'Halfway there',
    description: 'Complete half of the lessons in the catalogue.',
    glyph: 'book',
  },
  {
    id: 'graduate',
    title: 'Graduate',
    description: 'Complete every lesson in the catalogue.',
    glyph: 'trophy',
  },
  {
    id: 'streak-3',
    title: 'On a roll',
    description: 'Maintain a 3-day streak.',
    glyph: 'streak',
  },
  {
    id: 'streak-7',
    title: 'Week-long learner',
    description: 'Maintain a 7-day streak.',
    glyph: 'streak',
  },
  {
    id: 'streak-30',
    title: 'Lunar cycle',
    description: 'Maintain a 30-day streak.',
    glyph: 'streak',
  },
  {
    id: 'quiz-ace',
    title: 'Quiz ace',
    description: 'Get 100% on any quiz.',
    glyph: 'quiz',
  },
  {
    id: 'perfect-ten',
    title: 'Perfect ten',
    description: 'Get 100% on ten different quizzes.',
    glyph: 'perfectionist',
  },
  {
    id: 'first-boss',
    title: 'Boss slayer',
    description: 'Complete your first boss level.',
    glyph: 'boss',
  },
  {
    id: 'all-bosses',
    title: 'Boss hunter',
    description: 'Complete every boss level.',
    glyph: 'boss',
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Bookmark five lessons.',
    glyph: 'bookmark',
  },
  {
    id: 'note-taker',
    title: 'Note taker',
    description: 'Save a note on any lesson.',
    glyph: 'note',
  },
  {
    id: 'fast-fingers',
    title: 'Fast fingers',
    description: 'Score 30+ WPM in the typing test.',
    glyph: 'typing',
  },
  {
    id: 'lightning',
    title: 'Lightning',
    description: 'Score 60+ WPM in the typing test.',
    glyph: 'typing',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Unlock every other achievement.',
    glyph: 'trophy',
    hidden: true,
  },
];

const ALL_OTHER_IDS = ACHIEVEMENTS.filter((a) => a.id !== 'completionist').map(
  (a) => a.id,
);

export interface DerivedAchievement {
  id: string;
  unlocked: boolean;
}

/**
 * Pure function: given a progress state, return the unlock status for
 * every achievement. Does NOT write to the store; callers can use
 * this to surface "newly unlocked" toasts.
 */
export function evaluateAchievements(
  state: ProgressState,
): DerivedAchievement[] {
  const lessons = getAllLessons();
  const bosses = getAllBosses();
  const totalLessons = lessons.length;
  const completedCount = state.completed.length;
  const quizPerfect = Object.values(state.quiz).filter(
    (q) => q.total > 0 && q.correct === q.total,
  ).length;
  const streak = state.streak.current;
  const streakBest = state.streak.best;
  const bossesCount = state.bossesCompleted.length;
  const bookmarkCount = state.bookmarks.length;
  const noteCount = Object.values(state.notes).filter(
    (n) => n.text.trim().length > 0,
  ).length;
  const bestTyping = state.bestTyping;

  const byId = new Map<string, boolean>();
  const set = (id: string, ok: boolean) => byId.set(id, ok);

  set('first-step', completedCount >= 1);
  set('halfway', totalLessons > 0 && completedCount >= Math.ceil(totalLessons / 2));
  set('graduate', totalLessons > 0 && completedCount >= totalLessons);
  set('streak-3', streakBest >= 3);
  set('streak-7', streakBest >= 7);
  set('streak-30', streakBest >= 30);
  set('quiz-ace', quizPerfect >= 1);
  set('perfect-ten', quizPerfect >= 10);
  set('first-boss', bossesCount >= 1);
  set('all-bosses', bosses.length > 0 && bossesCount >= bosses.length);
  set('bookworm', bookmarkCount >= 5);
  set('note-taker', noteCount >= 1);
  set('fast-fingers', !!bestTyping && bestTyping.wpm >= 30);
  set('lightning', !!bestTyping && bestTyping.wpm >= 60);

  // `completionist` is satisfied once every other achievement is unlocked.
  const othersUnlocked = ALL_OTHER_IDS.every((id) =>
    (state.achievements as string[]).includes(id),
  );
  set('completionist', othersUnlocked);

  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    unlocked: state.achievements.includes(a.id) || !!byId.get(a.id),
  }));
}

/**
 * Compare the stored achievements with the freshly derived ones and
 * return the list of *newly* unlocked ids (so the UI can show a toast).
 */
export function diffAchievements(
  state: ProgressState,
): string[] {
  const derived = evaluateAchievements(state);
  const known = new Set(state.achievements);
  return derived.filter((d) => d.unlocked && !known.has(d.id)).map((d) => d.id);
}

/** Public helper used by the typing-test page to award a single record. */
export function typingWpm(score: TypingScore): number {
  return Math.max(0, Math.round(score.wpm));
}
