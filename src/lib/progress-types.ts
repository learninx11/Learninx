/**
 * Pure type definitions for per-visitor progress.
 *
 * Shared by the cookie-backed `progress.ts` (used by the standalone
 * Node.js server) and the localStorage-backed `progress-client.ts`
 * (used by the static export on GitHub Pages). Keep this file
 * dependency-free so it can be imported from either side.
 */

export interface QuizScore {
  score: number;
  correct: number;
  total: number;
  /** Epoch ms. */
  at: number;
}

export interface StreakState {
  /** Consecutive calendar days (UTC) with at least one completed lesson. */
  current: number;
  /** All-time best streak. */
  best: number;
  /** Last calendar day (UTC, YYYY-MM-DD) the learner had activity. */
  lastActiveDay: string | null;
  /** Total lessons completed across the lifetime of this profile. */
  totalCompletions: number;
  /** Aggregate quiz-correct count across the lifetime. */
  totalCorrect: number;
  /** Lifetime points. 10 per lesson complete, 1 per correct quiz answer. */
  points: number;
}

export interface LessonNote {
  /** Plain text. Kept short on purpose — localStorage quota. */
  text: string;
  /** Epoch ms. */
  updatedAt: number;
}

export interface TypingScore {
  /** Words typed per minute. */
  wpm: number;
  /** Accuracy as a 0-100 percentage. */
  accuracy: number;
  /** Total characters in the snippet. */
  length: number;
  /** Epoch ms. */
  at: number;
}

export interface ProgressState {
  v: 2;
  /** Set of lesson ids the visitor has completed. */
  completed: string[];
  /** Latest quiz score per lesson id. */
  quiz: Record<string, QuizScore>;
  /** Streak + lifetime stats. */
  streak: StreakState;
  /** YYYY-MM-DD (UTC) the visitor last dismissed or saw the daily tip. */
  lastTipDay: string | null;
  /** Set of lesson ids the visitor has bookmarked. */
  bookmarks: string[];
  /** Per-lesson notes. */
  notes: Record<string, LessonNote>;
  /** Set of achievement ids the visitor has unlocked. */
  achievements: string[];
  /** Best typing-test score so far. */
  bestTyping: TypingScore | null;
  /** Set of boss-level ids the visitor has completed. */
  bossesCompleted: string[];
}
