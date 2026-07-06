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

export interface ProgressState {
  v: 1;
  /** Set of lesson ids the visitor has completed. */
  completed: string[];
  /** Latest quiz score per lesson id. */
  quiz: Record<string, QuizScore>;
  /** Streak + lifetime stats. */
  streak: StreakState;
  /** YYYY-MM-DD (UTC) the visitor last dismissed or saw the daily tip. */
  lastTipDay: string | null;
}
