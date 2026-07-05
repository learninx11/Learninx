'use client';

import { useState } from 'react';
import { submitQuizAction } from '@/app/lessons/[slug]/actions';
import type { QuizAnswerResult } from '@/lib/types';
import { CheckCheckIcon, CheckIcon, CloseIcon, SparklesIcon } from '@/components/ui/Icon';

interface Question {
  id: string;
  prompt: string;
}

const PASS_THRESHOLD = 80;

export function LessonQuiz({
  lessonId,
  questions,
  previousScore,
}: {
  lessonId: string;
  questions: Question[];
  previousScore: number | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    score: number;
    passed: boolean;
    results: QuizAnswerResult[];
  } | null>(null);

  async function submit(): Promise<void> {
    setSubmitting(true);
    try {
      const payload = {
        lessonId,
        answers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? '',
        })),
      };
      const r = await submitQuizAction(payload);
      setResult({
        ...r,
        passed: r.passed,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function reset(): void {
    setResult(null);
    setAnswers({});
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-4">
        {questions.map((q, i) => {
          const r = result?.results.find((rr) => rr.questionId === q.id);
          const correct = r?.correct === true;
          const wrong = r && r.correct === false;
          const inputId = `q-${q.id}`;
          return (
            <li key={q.id}>
              <label
                htmlFor={inputId}
                className="mb-1.5 flex items-start gap-2 text-slate-200"
              >
                <span className="font-mono text-xs text-slate-500">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span>{q.prompt}</span>
              </label>
              <div className="relative">
                <input
                  id={inputId}
                  value={answers[q.id] ?? ''}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                  }
                  disabled={!!result}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`lx-input pr-9 ${correct ? 'border-[var(--lx-success)]/50' : wrong ? 'border-red-500/50' : ''}`}
                  placeholder="your answer…"
                  aria-describedby={r ? `q-${q.id}-feedback` : undefined}
                />
                {r && (
                  <span
                    aria-hidden
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                      correct ? 'text-[var(--lx-success)]' : 'text-red-400'
                    }`}
                  >
                    {correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
                  </span>
                )}
              </div>
              {r && (
                <p
                  id={`q-${q.id}-feedback`}
                  className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                    correct ? 'text-[var(--lx-success)]' : 'text-red-300'
                  }`}
                  role="status"
                >
                  {correct ? (
                    'Correct'
                  ) : (
                    <>
                      Not quite — expected:{' '}
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
                        {r.expected}
                      </code>
                    </>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={submit}
          disabled={submitting || !!result}
          className="lx-btn lx-btn-primary"
        >
          {submitting ? 'Grading…' : result ? 'Submitted' : 'Submit quiz'}
        </button>
        {result && (
          <button onClick={reset} className="lx-btn lx-btn-ghost text-slate-400">
            Try again
          </button>
        )}
        {previousScore !== null && !result && (
          <span className="text-xs text-slate-500">
            Previous attempt:{' '}
            <span
              className={
                previousScore >= PASS_THRESHOLD
                  ? 'text-[var(--lx-success)]'
                  : 'text-slate-300'
              }
            >
              {previousScore}%
            </span>
          </span>
        )}
      </div>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`flex flex-wrap items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${
            result.passed
              ? 'border-[var(--lx-success)]/30 bg-[var(--lx-success)]/10 text-[var(--lx-success)]'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          <span className="font-mono text-base font-semibold">{result.score}%</span>
          <span className="text-slate-300">
            {result.correct} of {result.total} correct
          </span>
          {result.passed ? (
            <span className="inline-flex items-center gap-1">
              <CheckCheckIcon size={14} /> Lesson complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-200">
              <SparklesIcon size={14} /> Need {PASS_THRESHOLD}% to pass — try
              again
            </span>
          )}
        </div>
      )}
    </div>
  );
}
