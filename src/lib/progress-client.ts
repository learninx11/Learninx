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

import type { ProgressState, QuizScore, StreakState } from './progress-types';

const STORAGE_KEY = 'learninx_progress';
/** One year, in milliseconds. Matches the previous cookie maxAge. */
const MAX_AGE_MS = 60 * 60 * 24 * 365 * 1000;

const EMPTY_STREAK: StreakState = {
  current: 0,
  best: 0,
  lastActiveDay: null,
  totalCompletions: 0,
  totalCorrect: 0,
  points: 0,
};

const EMPTY: ProgressState = {
  v: 1,
  completed: [],
  quiz: {},
  streak: { ...EMPTY_STREAK },
  lastTipDay: null,
};

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
    streak: normalizeStreak(input.streak),
    lastTipDay:
      typeof input.lastTipDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.lastTipDay)
        ? input.lastTipDay
        : null,
  };
}

function normalizeStreak(input: Partial<StreakState> | undefined): StreakState {
  if (!input || typeof input !== 'object') return { ...EMPTY_STREAK };
  return {
    current: clampInt(input.current, 0, 9999),
    best: clampInt(input.best, 0, 9999),
    lastActiveDay:
      typeof input.lastActiveDay === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.lastActiveDay)
        ? input.lastActiveDay
        : null,
    totalCompletions: clampInt(input.totalCompletions, 0, 999_999),
    totalCorrect: clampInt(input.totalCorrect, 0, 999_999),
    points: clampInt(input.points, 0, 9_999_999),
  };
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? Math.floor(value) : NaN;
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

// ──────────────────────────────────────────── date helpers ──

/** YYYY-MM-DD in UTC. */
export function utcDayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Number of whole calendar days between two YYYY-MM-DD strings (b - a). */
export function dayDiff(a: string, b: string): number {
  const ad = Date.UTC(
    Number(a.slice(0, 4)),
    Number(a.slice(5, 7)) - 1,
    Number(a.slice(8, 10)),
  );
  const bd = Date.UTC(
    Number(b.slice(0, 4)),
    Number(b.slice(5, 7)) - 1,
    Number(b.slice(8, 10)),
  );
  return Math.round((bd - ad) / 86_400_000);
}

function bumpStreak(streak: StreakState, today: string): StreakState {
  if (streak.lastActiveDay === today) {
    return streak;
  }
  if (streak.lastActiveDay && dayDiff(streak.lastActiveDay, today) === 1) {
    const current = streak.current + 1;
    return {
      ...streak,
      current,
      best: Math.max(streak.best, current),
      lastActiveDay: today,
    };
  }
  return {
    ...streak,
    current: 1,
    best: Math.max(streak.best, 1),
    lastActiveDay: today,
  };
}

// ──────────────────────────────────────────── public API ──

/** Read the current progress snapshot. Always returns a valid state. */
export function getProgress(): ProgressState {
  return readRaw();
}

/** Mark a lesson as completed (idempotent). Awards points + streak. */
export function markLessonComplete(lessonId: string): ProgressState {
  const state = readRaw();
  const already = state.completed.includes(lessonId);
  if (!already) {
    state.completed.push(lessonId);
  }
  const today = utcDayKey();
  const streak = bumpStreak(state.streak, today);
  if (!already) {
    streak.totalCompletions += 1;
    streak.points += 10;
  }
  writeRaw({ ...state, streak });
  return { ...state, streak };
}

/** Record the latest quiz score for a lesson. Awards points for new correct answers. */
export function recordQuizScore(lessonId: string, score: QuizScore): ProgressState {
  const state = readRaw();
  const previous = state.quiz[lessonId];
  state.quiz[lessonId] = score;
  // Only award points for *new* correct answers (not re-takes at the same level).
  const prevCorrect = previous?.correct ?? 0;
  const delta = Math.max(0, score.correct - prevCorrect);
  if (delta > 0) {
    const streak = { ...state.streak, totalCorrect: state.streak.totalCorrect + delta };
    streak.points += delta; // 1 point per correct answer
    const next = { ...state, streak };
    writeRaw(next);
    return next;
  }
  writeRaw(state);
  return state;
}

/** Mark the daily tip as seen for today. Idempotent. */
export function markTipSeen(): ProgressState {
  const state = readRaw();
  const today = utcDayKey();
  if (state.lastTipDay === today) return state;
  const next = { ...state, lastTipDay: today };
  writeRaw(next);
  return next;
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
