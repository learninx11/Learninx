'use client';

import { useId, useState } from 'react';
import { useProgress } from '@/lib/progress-context';
import type { QuizAnswerResult } from '@/lib/types';
import { CheckCheckIcon, CheckIcon, CloseIcon, ResetIcon, SparklesIcon } from '@/components/ui/Icon';
import { RichText } from '@/components/ui/RichText';

interface Question {
  id: string;
  prompt: string;
  /** Lower-cased + trimmed expected answer. */
  answer: string;
}

interface QuizResult {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
  results: QuizAnswerResult[];
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
  const { submitQuiz } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const formId = useId();
  const inputId = (questionId: string) => `${formId}-${questionId}`;
  const answered = questions.filter((q) => (answers[q.id] ?? '').trim()).length;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (result || answered === 0) return;
    setResult(
      submitQuiz(
        lessonId,
        questions,
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? '' })),
      ),
    );
  }

  /** Start over. After a fail, keep the right answers so only the misses need retyping. */
  function retry() {
    if (!result) return;
    const kept: Record<string, string> = {};
    if (!result.passed) {
      for (const r of result.results) if (r.correct) kept[r.questionId] = answers[r.questionId] ?? r.given;
    }
    const firstToFix = result.results.find((r) => !kept[r.questionId]);
    setAnswers(kept);
    setResult(null);
    if (firstToFix) requestAnimationFrame(() => document.getElementById(inputId(firstToFix.questionId))?.focus());
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <ol className="space-y-5">
        {questions.map((q, i) => {
          const r = result?.results.find((rr) => rr.questionId === q.id);
          const correct = r?.correct === true;
          const wrong = r !== undefined && !r.correct;
          const id = inputId(q.id);
          return (
            <li key={q.id}>
              <label htmlFor={id} className="mb-2 flex items-start gap-2.5 text-lx-fg">
                <span className="mt-0.5 font-mono text-xs text-lx-subtle">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span>
                  <RichText text={q.prompt} />
                </span>
              </label>
              <div className="relative">
                <input
                  id={id}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  disabled={!!result}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={wrong || undefined}
                  aria-describedby={r ? `${id}-feedback` : undefined}
                  className={`lx-input pr-9 ${correct ? 'border-lx-success/60' : ''}`}
                  placeholder="your answer…"
                />
                {r && (
                  <span
                    aria-hidden
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                      correct ? 'text-lx-success' : 'text-lx-danger'
                    }`}
                  >
                    {correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
                  </span>
                )}
              </div>
              {r && (
                <p
                  id={`${id}-feedback`}
                  className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-xs ${
                    correct ? 'text-lx-success' : 'text-lx-danger'
                  }`}
                >
                  {correct ? (
                    'Correct'
                  ) : (
                    <>
                      Not quite — expected
                      <code className="rounded border border-lx-border bg-lx-code-bg px-1.5 py-0.5 font-mono text-lx-fg">
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

      {result ? (
        <div
          role="status"
          aria-live="polite"
          className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border px-4 py-3 text-sm ${
            result.passed
              ? 'border-lx-success/30 bg-lx-success/10 text-lx-success'
              : 'border-lx-warning/30 bg-lx-warning/10 text-lx-warning'
          }`}
        >
          <span className="font-mono text-xl font-semibold tabular-nums">{result.score}%</span>
          <span className="text-lx-fg">
            {result.correct} of {result.total} correct
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            {result.passed ? (
              <>
                <CheckCheckIcon size={14} /> Passed — lesson complete
              </>
            ) : (
              <>
                <SparklesIcon size={14} /> {PASS_THRESHOLD}% passes — so close
              </>
            )}
          </span>
          <button type="button" onClick={retry} className="lx-btn lx-btn-secondary lx-btn-sm ml-auto">
            <ResetIcon size={13} /> {result.passed ? 'Take it again' : 'Fix the misses'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={answered === 0} className="lx-btn lx-btn-primary">
            Check answers
          </button>
          <span className="text-xs text-lx-subtle">
            {answered} of {questions.length} answered
            {previousScore !== null && (
              <>
                {' · '}last score{' '}
                <span className={previousScore >= PASS_THRESHOLD ? 'text-lx-success' : 'text-lx-fg'}>
                  {previousScore}%
                </span>
              </>
            )}
          </span>
        </div>
      )}
    </form>
  );
}
