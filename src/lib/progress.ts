/**
 * Per-visitor progress store.
 *
 * The previous version of this project wrote lesson completions and quiz
 * scores to a SQLite database keyed off an anonymous `visitorId` cookie.
 * This module replaces the database with a **signed cookie** that holds the
 * same data inline. That keeps the app stateless server-side (no DB, no
 * volume mount, no migrations) while still giving each browser a persistent
 * "profile" that survives reloads.
 *
 * Cookie name: `learninx_progress`
 * Encoding:    base64url(JSON payload) + "." + base64url(HMAC-SHA256)
 *
 * The cookie is small (a few hundred bytes even for every lesson) because
 * it only stores:
 *   - completed lesson ids
 *   - last quiz score per lesson
 */

import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { ProgressState, QuizScore, StreakState } from './progress-types';

const COOKIE_NAME = 'learninx_progress';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const EMPTY_STREAK: StreakState = {
  current: 0,
  best: 0,
  lastActiveDay: null,
  totalCompletions: 0,
  totalCorrect: 0,
  points: 0,
};

const EMPTY: ProgressState = {
  v: 2,
  completed: [],
  quiz: {},
  streak: { ...EMPTY_STREAK },
  lastTipDay: null,
  bookmarks: [],
  notes: {},
  achievements: [],
  bestTyping: null,
  bossesCompleted: [],
};

// ─────────────────────────────────────────────── signing key ──

function getSecret(): string {
  // We need *some* stable per-process key. In production this should be
  // injected as `LEARNINX_SECRET` so cookies are still valid across deploys
  // / restarts. In dev we synthesise a per-process key (which means cookies
  // reset on every dev-server boot — that's fine for a learning app).
  const fromEnv = process.env.LEARNINX_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  // Fallback: derive a stable key from a runtime random if no env is set.
  // We attach it to globalThis so all calls in the same process agree.
  const g = globalThis as unknown as { __learninxSecret?: string };
  if (!g.__learninxSecret) {
    g.__learninxSecret = 'dev-' + randomBytes(24).toString('hex');
  }
  return g.__learninxSecret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function safeEqualB64(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function encode(state: ProgressState): string {
  const json = JSON.stringify(state);
  const body = Buffer.from(json, 'utf8').toString('base64url');
  const sig = sign(body);
  return `${body}.${sig}`;
}

function decode(raw: string | undefined): ProgressState {
  if (!raw) return cloneEmpty();
  const idx = raw.indexOf('.');
  if (idx <= 0) return cloneEmpty();
  const body = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (!safeEqualB64(sign(body), sig)) {
    // Tampered or signed with a different secret — start fresh.
    return cloneEmpty();
  }
  try {
    const json = Buffer.from(body, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as Partial<ProgressState>;
    return {
      v: 2,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      quiz:
        parsed.quiz && typeof parsed.quiz === 'object' ? parsed.quiz : {},
      streak: normalizeStreak(parsed.streak),
      lastTipDay:
        typeof parsed.lastTipDay === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastTipDay)
          ? parsed.lastTipDay
          : null,
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks.filter((s): s is string => typeof s === 'string')
        : [],
      notes:
        parsed.notes && typeof parsed.notes === 'object' && !Array.isArray(parsed.notes)
          ? (parsed.notes as Record<string, { text: string; updatedAt: number }>)
          : {},
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements.filter((s): s is string => typeof s === 'string')
        : [],
      bestTyping: null,
      bossesCompleted: Array.isArray(parsed.bossesCompleted)
        ? parsed.bossesCompleted.filter((s): s is string => typeof s === 'string')
        : [],
    };
  } catch {
    return cloneEmpty();
  }
}

function cloneEmpty(): ProgressState {
  return {
    v: 2,
    completed: [],
    quiz: {},
    streak: { ...EMPTY_STREAK },
    lastTipDay: null,
    bookmarks: [],
    notes: {},
    achievements: [],
    bestTyping: null,
    bossesCompleted: [],
  };
}

function normalizeStreak(input: unknown): StreakState {
  if (!input || typeof input !== 'object') return { ...EMPTY_STREAK };
  const s = input as Partial<StreakState>;
  return {
    current: clampInt(s.current, 0, 9999),
    best: clampInt(s.best, 0, 9999),
    lastActiveDay:
      typeof s.lastActiveDay === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(s.lastActiveDay)
        ? s.lastActiveDay
        : null,
    totalCompletions: clampInt(s.totalCompletions, 0, 999_999),
    totalCorrect: clampInt(s.totalCorrect, 0, 999_999),
    points: clampInt(s.points, 0, 9_999_999),
  };
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? Math.floor(value) : NaN;
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** YYYY-MM-DD in UTC. */
function utcDayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
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
  if (streak.lastActiveDay === today) return streak;
  if (streak.lastActiveDay && dayDiff(streak.lastActiveDay, today) === 1) {
    const current = streak.current + 1;
    return { ...streak, current, best: Math.max(streak.best, current), lastActiveDay: today };
  }
  return { ...streak, current: 1, best: Math.max(streak.best, 1), lastActiveDay: today };
}

// ─────────────────────────────────────────────── public API ──

/** Read the visitor's current progress. Always returns a valid state. */
export function getProgress(): ProgressState {
  return decode(cookies().get(COOKIE_NAME)?.value);
}

/** Persist the visitor's progress via a Set-Cookie header. */
function writeProgress(state: ProgressState): void {
  cookies().set(COOKIE_NAME, encode(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Mark a lesson as completed (idempotent). Awards points + streak. */
export function markLessonComplete(lessonId: string): ProgressState {
  const state = getProgress();
  const already = state.completed.includes(lessonId);
  if (!already) state.completed.push(lessonId);
  const today = utcDayKey();
  const streak = bumpStreak(state.streak, today);
  if (!already) {
    streak.totalCompletions += 1;
    streak.points += 10;
  }
  state.streak = streak;
  writeProgress(state);
  return state;
}

/** Record the latest quiz score for a lesson. Awards points for new correct answers. */
export function recordQuizScore(lessonId: string, score: QuizScore): ProgressState {
  const state = getProgress();
  const previous = state.quiz[lessonId];
  state.quiz[lessonId] = score;
  const prevCorrect = previous?.correct ?? 0;
  const delta = Math.max(0, score.correct - prevCorrect);
  if (delta > 0) {
    state.streak.totalCorrect += delta;
    state.streak.points += delta;
  }
  writeProgress(state);
  return state;
}

/** Mark the daily tip as seen for today. */
export function markTipSeen(): ProgressState {
  const state = getProgress();
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastTipDay === today) return state;
  state.lastTipDay = today;
  writeProgress(state);
  return state;
}

/** True if the visitor has marked this lesson complete. */
export function isLessonCompleted(lessonId: string): boolean {
  return getProgress().completed.includes(lessonId);
}

/** Set of completed lesson ids — convenient for the index page. */
export function getCompletedLessonIds(): Set<string> {
  return new Set(getProgress().completed);
}

/** Test helpers — currently unused at runtime, exported for completeness. */
export const __progressInternals = { encode, decode, getSecret };
