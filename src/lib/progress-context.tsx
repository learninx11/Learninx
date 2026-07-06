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
  markLessonComplete as storeMarkLessonComplete,
  markTipSeen as storeMarkTipSeen,
  normalizeAnswer,
  normalizeCommand,
  recordQuizScore as storeRecordQuizScore,
  resetProgress as storeResetProgress,
  subscribeProgress,
} from './progress-client';
import type { ProgressState, QuizScore } from './progress-types';
import type { QuizAnswerResult } from './types';

const PASS_THRESHOLD = 80;

interface ProgressContextValue {
  state: ProgressState;
  /** True once the store has been hydrated from localStorage. */
  ready: boolean;
  isCompleted: (lessonId: string) => boolean;
  completedSet: Set<string>;
  markComplete: (lessonId: string) => void;
  reset: () => void;
  /** Mark the daily tip as seen for today. */
  markTipSeen: () => void;
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
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Stable empty state for SSR/static export. We hydrate on mount.
  const [state, setState] = useState<ProgressState>({
    v: 1,
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
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readProgress());
    setReady(true);
    return subscribeProgress(setState);
  }, []);

  const completedSet = useMemo(() => new Set(state.completed), [state.completed]);

  const isCompleted = useCallback(
    (lessonId: string) => state.completed.includes(lessonId),
    [state.completed],
  );

  const markComplete = useCallback((lessonId: string) => {
    const next = storeMarkLessonComplete(lessonId);
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const next = storeResetProgress();
    setState(next);
  }, []);

  const markTipSeen = useCallback(() => {
    const next = storeMarkTipSeen();
    setState(next);
  }, []);

  const submitChallenge = useCallback<ProgressContextValue['submitChallenge']>(
    (lessonId, solution, command) => {
      if (!solution) {
        return { ok: false, message: 'This lesson has no challenge.' };
      }
      const expected = normalizeCommand(solution);
      const accepted = expected.split('||').map((p) => p.trim());
      if (accepted.includes(normalizeCommand(command))) {
        const next = storeMarkLessonComplete(lessonId);
        setState(next);
        return {
          ok: true,
          message: 'Nice work — that is the expected command.',
        };
      }
      return {
        ok: false,
        message: 'Not quite — try again, or peek at the hint in the sandbox.',
      };
    },
    [],
  );

  const submitQuiz = useCallback<ProgressContextValue['submitQuiz']>(
    (lessonId, questions, answers) => {
      if (questions.length === 0) {
        const next = storeMarkLessonComplete(lessonId);
        setState(next);
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
      setState(next);

      return { results, correct, total, score, passed };
    },
    [],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ready,
      isCompleted,
      completedSet,
      markComplete,
      reset,
      markTipSeen,
      submitChallenge,
      submitQuiz,
    }),
    [state, ready, isCompleted, completedSet, markComplete, reset, markTipSeen, submitChallenge, submitQuiz],
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
