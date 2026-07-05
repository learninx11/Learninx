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

export interface ProgressState {
  v: 1;
  /** Set of lesson ids the visitor has completed. */
  completed: string[];
  /** Latest quiz score per lesson id. */
  quiz: Record<string, QuizScore>;
}
