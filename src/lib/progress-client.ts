/**
 * Client-side per-visitor progress store.
 *
 * The previous version of the project used a signed cookie written by
 * server actions. That works in a Node.js environment but is not
 * available in a static export on GitHub Pages. This module replaces
 * the cookie with a `localStorage` entry. The data lives in the
 * visitor's own browser, so no signing is required.
 *
 * Storage key: `learninx_progress`
 * Payload:     JSON `{ ...state, savedAt }`
 *
 * The public API intentionally mirrors the old cookie-backed module so
 * the swap stays mechanical.
 */

import type { ProgressState, QuizScore } from './progress-types';

const STORAGE_KEY = 'learninx_progress';
/** One year, in milliseconds. Matches the previous cookie maxAge. */
const MAX_AGE_MS = 60 * 60 * 24 * 365 * 1000;

const EMPTY: ProgressState = { v: 1, completed: [], quiz: {} };

// ──────────────────────────────────────────── storage helpers ──

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readRaw(): ProgressState {
  if (!isBrowser()) return clone(EMPTY);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(EMPTY);
    const parsed = JSON.parse(raw) as Partial<ProgressState> & { savedAt?: number };
    if (
      typeof parsed.savedAt === 'number' &&
      Date.now() - parsed.savedAt > MAX_AGE_MS
    ) {
      return clone(EMPTY);
    }
    return normalize(parsed);
  } catch {
    return clone(EMPTY);
  }
}

function writeRaw(state: ProgressState): void {
  if (!isBrowser()) return;
  const payload = JSON.stringify({ ...state, savedAt: Date.now() });
  try {
    window.localStorage.setItem(STORAGE_KEY, payload);
    // Same-tab notification. The native `storage` event only fires
    // across tabs, so we dispatch our own for in-tab subscribers.
    window.dispatchEvent(
      new CustomEvent<ProgressState>('learninx:progress', { detail: state }),
    );
  } catch {
    // localStorage can throw in private mode or when full — ignore.
  }
}

function normalize(input: Partial<ProgressState>): ProgressState {
  return {
    v: 1,
    completed: Array.isArray(input.completed)
      ? input.completed.filter((s): s is string => typeof s === 'string')
      : [],
    quiz:
      input.quiz && typeof input.quiz === 'object' && !Array.isArray(input.quiz)
        ? (input.quiz as Record<string, QuizScore>)
        : {},
  };
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

// ──────────────────────────────────────────── public API ──

/** Read the current progress snapshot. Always returns a valid state. */
export function getProgress(): ProgressState {
  return readRaw();
}

/** Mark a lesson as completed (idempotent). */
export function markLessonComplete(lessonId: string): ProgressState {
  const state = readRaw();
  if (!state.completed.includes(lessonId)) {
    state.completed.push(lessonId);
  }
  writeRaw(state);
  return state;
}

/** Record the latest quiz score for a lesson. Does not change completion. */
export function recordQuizScore(lessonId: string, score: QuizScore): ProgressState {
  const state = readRaw();
  state.quiz[lessonId] = score;
  writeRaw(state);
  return state;
}

/** True if this lesson is in the completed set. */
export function isLessonCompleted(lessonId: string): boolean {
  return readRaw().completed.includes(lessonId);
}

/** Set form of completed lesson ids. */
export function getCompletedLessonIds(): Set<string> {
  return new Set(readRaw().completed);
}

/** Wipe all progress on this browser. */
export function resetProgress(): ProgressState {
  const fresh = clone(EMPTY);
  writeRaw(fresh);
  return fresh;
}

// ──────────────────────────────────────────── subscriptions ──

/**
 * Subscribe to progress changes. The callback fires once immediately
 * with the current state, then again every time the store is written
 * from the same tab (custom event) or from another tab (native storage
 * event).
 */
export function subscribeProgress(listener: (state: ProgressState) => void): () => void {
  if (!isBrowser()) {
    listener(clone(EMPTY));
    return () => undefined;
  }

  listener(readRaw());

  const onLocal = (event: Event) => {
    const detail = (event as CustomEvent<ProgressState>).detail;
    listener(detail ?? readRaw());
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener(readRaw());
  };
  window.addEventListener('learninx:progress', onLocal as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener('learninx:progress', onLocal as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}

// ──────────────────────────────────────────── pure helpers ──

/** Same normaliser the old server action used for free-text answers. */
export function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.;!?]$/g, '');
}

/** Same normaliser the old challenge action used for shell commands. */
export function normalizeCommand(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/;$/, '');
}
