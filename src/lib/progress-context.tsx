'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getProgress as readProgress,
  importProgress as storeImportProgress,
  isBookmarked as storeIsBookmarked,
  markLessonComplete as storeMarkLessonComplete,
  markTipSeen as storeMarkTipSeen,
  markBossComplete as storeMarkBossComplete,
  normalizeAnswer,
  normalizeCommand,
  recordFlashcardAnswer as storeRecordFlashcardAnswer,
  recordAchievements as storeRecordAchievements,
  recordQuizScore as storeRecordQuizScore,
  recordTipSeen as storeRecordTipSeen,
  recordTypingScore as storeRecordTypingScore,
  resetFlashcards as storeResetFlashcards,
  resetProgress as storeResetProgress,
  setLessonNote as storeSetLessonNote,
  subscribeProgress,
  toggleBookmark as storeToggleBookmark,
  unlockAchievement as storeUnlockAchievement,
} from './progress-client';
import type { ProgressState, QuizScore, TypingScore } from './progress-types';
import type { QuizAnswerResult } from './types';
import { diffAchievements } from './achievements';

const PASS_THRESHOLD = 80;
const EMPTY_ACHIEVEMENTS: string[] = [];

interface ProgressContextValue {
  state: ProgressState;
  /** True once the store has been hydrated from localStorage. */
  ready: boolean;
  isCompleted: (lessonId: string) => boolean;
  completedSet: Set<string>;
  markComplete: (lessonId: string) => void;
  reset: () => void;
  /** Mark the daily tip as seen for today. */
  markTipSeen: (tipIndex?: number) => void;
  /**
   * Record that the visitor has surfaced a specific tip (by index in
   * the catalogue) without changing the day-key. Used by the home
   * page when the visitor shuffles to a different tip.
   */
  recordTipSeen: (tipIndex: number) => void;
  /**
   * Client-side replacement for `submitChallengeAction`. Validates
   * the user's command against the lesson's accepted solutions and,
   * on a match, marks the lesson complete.
   */
  submitChallenge: (
    lessonId: string,
    solution: string | undefined,
    command: string,
  ) => { ok: boolean; message: string };
  /**
   * Client-side replacement for `submitQuizAction`. Returns graded
   * results and updates the store (quiz score, and lesson completion
   * on pass).
   */
  submitQuiz: (
    lessonId: string,
    questions: { id: string; prompt: string; answer: string }[],
    answers: { questionId: string; answer: string }[],
  ) => {
    results: QuizAnswerResult[];
    correct: number;
    total: number;
    score: number;
    passed: boolean;
  };
  /** Bookmark a lesson (toggles). */
  toggleBookmark: (lessonId: string) => boolean;
  isBookmarked: (lessonId: string) => boolean;
  /** Save a free-form note for a lesson. */
  setNote: (lessonId: string, text: string) => void;
  /** Mark a boss-level id as completed. */
  markBossComplete: (bossId: string) => void;
  /** Record a typing-test result. */
  recordTyping: (score: TypingScore) => void;
  /** Grade one flashcard answer and reschedule the card. */
  answerFlashcard: (cardId: string, correct: boolean) => void;
  /** Wipe flashcard scheduling only. */
  resetFlashcards: () => void;
  /** Replace the whole progress snapshot from an imported JSON string. */
  importJson: (json: string) => ProgressState;
  /** Achievements that were unlocked on the most recent write. */
  newlyUnlocked: string[];
  /** Dismiss the "newly unlocked" banner (called after the UI shows it). */
  clearNewlyUnlocked: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Read the progress state, re-evaluating derived achievements. */
function applyDerivedAchievements(state: ProgressState): ProgressState {
  const fresh = diffAchievements(state);
  if (fresh.length === 0) return state;
  const achievements = [...state.achievements, ...fresh];
  return { ...state, achievements };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Stable empty state for SSR/static export. We hydrate on mount.
  const [state, setState] = useState<ProgressState>({
    v: 2,
    completed: [],
    quiz: {},
    streak: {
      current: 0,
      best: 0,
      lastActiveDay: null,
      totalCompletions: 0,
      totalCorrect: 0,
      points: 0,
    },
    lastTipDay: null,
    bookmarks: EMPTY_ACHIEVEMENTS,
    notes: {},
    achievements: EMPTY_ACHIEVEMENTS,
    bestTyping: null,
    bossesCompleted: [],
    tipsSeen: [],
    flashcards: {},
    flashcardReviews: 0,
    activity: {},
  });
  const [ready, setReady] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    // Badges earned before unlocks were saved are recorded quietly: no
    // toasts and no bonus points for old news.
    const initial = readProgress();
    const earned = diffAchievements(initial);
    setState(earned.length > 0 ? storeRecordAchievements(earned) : initial);
    setReady(true);
    return subscribeProgress((next) =>
      setState(applyDerivedAchievements(next)),
    );
  }, []);

  const completedSet = useMemo(() => new Set(state.completed), [state.completed]);

  const isCompleted = useCallback(
    (lessonId: string) => state.completed.includes(lessonId),
    [state.completed],
  );

  /**
   * Publish a freshly written snapshot. Any achievement it newly earns is
   * saved (each awards its +5 points) and queued for the unlock toast.
   */
  const commit = useCallback((next: ProgressState): ProgressState => {
    const fresh = diffAchievements(next);
    let latest = next;
    for (const id of fresh) latest = storeUnlockAchievement(id).state;
    if (fresh.length > 0) setNewlyUnlocked((prev) => [...prev, ...fresh]);
    setState(latest);
    return latest;
  }, []);

  const markComplete = useCallback(
    (lessonId: string) => {
      commit(storeMarkLessonComplete(lessonId));
    },
    [commit],
  );

  const reset = useCallback(() => {
    const next = storeResetProgress();
    setState(next);
    setNewlyUnlocked([]);
  }, []);

  const markTipSeen = useCallback(
    (tipIndex?: number) => {
      commit(storeMarkTipSeen(tipIndex));
    },
    [commit],
  );

  const recordTipSeen = useCallback(
    (tipIndex: number) => {
      commit(storeRecordTipSeen(tipIndex));
    },
    [commit],
  );

  const submitChallenge = useCallback<ProgressContextValue['submitChallenge']>(
    (lessonId, solution, command) => {
      if (!solution) {
        return { ok: false, message: 'This lesson has no challenge.' };
      }
      const expected = normalizeCommand(solution);
      const accepted = expected.split('||').map((p) => p.trim());
      if (accepted.includes(normalizeCommand(command))) {
        commit(storeMarkLessonComplete(lessonId));
        return {
          ok: true,
          message: 'Nice work — that is the expected command.',
        };
      }
      return {
        ok: false,
        message: 'Not quite. Compare it with the task above, or reveal the hint below.',
      };
    },
    [commit],
  );

  const submitQuiz = useCallback<ProgressContextValue['submitQuiz']>(
    (lessonId, questions, answers) => {
      if (questions.length === 0) {
        commit(storeMarkLessonComplete(lessonId));
        return { results: [], correct: 0, total: 0, score: 0, passed: true };
      }

      let correct = 0;
      const results: QuizAnswerResult[] = questions.map((q) => {
        const given = answers.find((a) => a.questionId === q.id)?.answer ?? '';
        const isCorrect = normalizeAnswer(given) === normalizeAnswer(q.answer);
        if (isCorrect) correct += 1;
        return {
          questionId: q.id,
          prompt: q.prompt,
          given,
          expected: q.answer,
          correct: isCorrect,
        };
      });

      const total = questions.length;
      const score = Math.round((correct / total) * 100);
      const passed = score >= PASS_THRESHOLD;

      const quizScore: QuizScore = { score, correct, total, at: Date.now() };
      let next = storeRecordQuizScore(lessonId, quizScore);
      if (passed) {
        next = storeMarkLessonComplete(lessonId);
      }
      commit(next);

      return { results, correct, total, score, passed };
    },
    [commit],
  );

  const toggleBookmark = useCallback(
    (lessonId: string) => {
      const result = storeToggleBookmark(lessonId);
      // Saving a fifth lesson earns the Bookworm badge.
      commit(result.state);
      return result.added;
    },
    [commit],
  );

  const isBookmarked = useCallback(
    (lessonId: string) =>
      state.bookmarks.includes(lessonId) || (!ready && storeIsBookmarked(lessonId)),
    [state.bookmarks, ready],
  );

  const setNote = useCallback(
    (lessonId: string, text: string) => {
      commit(storeSetLessonNote(lessonId, text));
    },
    [commit],
  );

  const markBoss = useCallback(
    (bossId: string) => {
      commit(storeMarkBossComplete(bossId));
    },
    [commit],
  );

  const recordTyping = useCallback(
    (score: TypingScore) => {
      commit(storeRecordTypingScore(score));
    },
    [commit],
  );

  const answerFlashcard = useCallback(
    (cardId: string, correct: boolean) => {
      commit(storeRecordFlashcardAnswer(cardId, correct));
    },
    [commit],
  );

  const resetFlashcards = useCallback(() => {
    setState(storeResetFlashcards());
  }, []);

  const importJson = useCallback((json: string): ProgressState => {
    // A restored backup's badges are history, not fresh unlocks.
    const imported = storeImportProgress(json);
    const earned = diffAchievements(imported);
    const next = earned.length > 0 ? storeRecordAchievements(earned) : imported;
    setState(next);
    setNewlyUnlocked([]);
    return next;
  }, []);

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ready,
      isCompleted,
      completedSet,
      markComplete,
      reset,
      markTipSeen,
      recordTipSeen,
      submitChallenge,
      submitQuiz,
      toggleBookmark,
      isBookmarked,
      setNote,
      markBossComplete: markBoss,
      recordTyping,
      answerFlashcard,
      resetFlashcards,
      importJson,
      newlyUnlocked,
      clearNewlyUnlocked,
    }),
    [
      state,
      ready,
      isCompleted,
      completedSet,
      markComplete,
      reset,
      markTipSeen,
      recordTipSeen,
      submitChallenge,
      submitQuiz,
      toggleBookmark,
      isBookmarked,
      setNote,
      markBoss,
      recordTyping,
      answerFlashcard,
      resetFlashcards,
      importJson,
      newlyUnlocked,
      clearNewlyUnlocked,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside <ProgressProvider>.');
  }
  return ctx;
}
