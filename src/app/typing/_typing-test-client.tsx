'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  GamepadIcon,
  MaximizeIcon,
  MinimizeIcon,
  ResetIcon,
  TargetIcon,
  TrophyIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { TYPING_SNIPPETS, type TypingSnippet } from '@/lib/typing-snippets';
import { useProgress } from '@/lib/progress-context';
import type { TypingScore } from '@/lib/progress-types';
import type { Difficulty } from '@/lib/types';

type Mode = 'practice' | 'test';
type Status = 'idle' | 'running' | 'finished';

/** Take Test always runs for exactly this long, however many snippets get through. */
const TEST_DURATION_MS = 3 * 60_000;

/** Same scale and labels as lessons/boss levels (`@/lib/types`), reused here for consistency. */
const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};
/** How many snippets/rounds spent at each tier before ramping up to the next. */
const ROUNDS_PER_TIER = 3;

/** Maps "how many snippets completed so far" to a difficulty tier — ramps up, then holds at expert. */
function difficultyForRound(roundsCompleted: number): Difficulty {
  const tier = Math.min(
    Math.floor(roundsCompleted / ROUNDS_PER_TIER),
    DIFFICULTY_ORDER.length - 1,
  );
  return DIFFICULTY_ORDER[tier]!;
}

const FALLBACK_SNIPPET: TypingSnippet = {
  text: 'ls -la',
  usage: 'List every file in the current directory, including hidden ones.',
  difficulty: 'beginner',
};

function pickSnippet(previous?: TypingSnippet, difficulty: Difficulty = 'beginner'): TypingSnippet {
  const pool = TYPING_SNIPPETS.filter((s) => s.difficulty === difficulty);
  const candidates = pool.length > 0 ? pool : TYPING_SNIPPETS;
  if (candidates.length === 0) return FALLBACK_SNIPPET;
  if (candidates.length === 1) return candidates[0]!;
  let next: TypingSnippet | undefined = previous;
  // Roll a few times to avoid repeating the previous one.
  for (let i = 0; i < 4 && next?.text === previous?.text; i += 1) {
    next = candidates[Math.floor(Math.random() * candidates.length)];
  }
  return next ?? candidates[0]!;
}

/**
 * Standard "5 characters = 1 word" approximation used by every typing
 * tutor, applied to a raw character count so both modes (one snippet in
 * Practice, many stitched together in Take Test) can share it.
 */
function wordsFromChars(chars: number): number {
  return chars === 0 ? 0 : Math.max(1, Math.ceil(chars / 5));
}

function countCorrect(typed: string, target: string): number {
  let correct = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  return correct;
}

export function TypingTestClient() {
  const { state, ready, recordTyping } = useProgress();
  const [mode, setMode] = useState<Mode>('practice');

  // Deterministic on first render (server and client agree), then
  // randomized once mounted — picking randomly during the initial render
  // would differ between the server and client passes and trip a
  // hydration mismatch.
  const [snippet, setSnippet] = useState<TypingSnippet>(
    () => TYPING_SNIPPETS.find((s) => s.difficulty === 'beginner') ?? FALLBACK_SNIPPET,
  );
  useEffect(() => {
    setSnippet(pickSnippet(undefined, 'beginner'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [typed, setTyped] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');

  // Practice mode: one snippet, timer counts up, ends the moment it's typed.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [lastScore, setLastScore] = useState<TypingScore | null>(null);
  // How many practice snippets have been completed this session — shown
  // as "Round N" so the counter means something (and, unlike the
  // Math.random() flavor text this replaced, matches on server and
  // client so it doesn't trip a hydration mismatch).
  const [practiceRoundsDone, setPracticeRoundsDone] = useState(0);

  // Take Test mode: a fixed 3-minute clock counting down, snippets advance
  // automatically as each is finished, and stats accumulate across all of them.
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);
  const [testRemainingMs, setTestRemainingMs] = useState(TEST_DURATION_MS);
  const [testTotalChars, setTestTotalChars] = useState(0);
  const [testCorrectChars, setTestCorrectChars] = useState(0);
  const [testSnippetsDone, setTestSnippetsDone] = useState(0);
  const [testResult, setTestResult] = useState<{
    wpm: number;
    accuracy: number;
    snippets: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against double-firing the end of whichever mode is active —
  // only one mode is ever running at a time, so one flag is enough.
  const finishedRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [soundOn, setSoundOn] = useState(false);
  const [isZen, setIsZen] = useState(false);

  // Restore the keystroke-sound preference (persisted per browser).
  useEffect(() => {
    try {
      if (window.localStorage.getItem('lx-typing-sound') === '1') setSoundOn(true);
    } catch {
      /* localStorage blocked (private mode, etc.) — default stays off */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem('lx-typing-sound', soundOn ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [soundOn]);

  // Escape exits zen mode. A plain <input> (unlike the xterm-based
  // terminal) never swallows the keydown, so a window listener is enough.
  useEffect(() => {
    if (!isZen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsZen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isZen]);
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isZen]);

  /** A soft, short oscillator blip for keystroke feedback. No-op when muted or blocked by autoplay policy. */
  function playTone(freq: number, duration = 0.03, volume = 0.05): void {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* ignore — autoplay policies may block audio until user gesture */
    }
  }

  // Practice-mode ticker: elapsed time, counting up.
  useEffect(() => {
    if (mode !== 'practice' || status !== 'running') {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(() => {
      if (startedAt != null) setElapsedMs(Date.now() - startedAt);
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [mode, status, startedAt]);

  // Take-Test ticker: just refreshes the countdown. Deliberately kept
  // dumb (no decisions here) so the "what happens at zero" logic below
  // always runs with a fresh render's state instead of whatever was
  // captured when this interval was created three minutes ago.
  useEffect(() => {
    if (mode !== 'test' || status !== 'running' || testStartedAt == null) return;
    const id = setInterval(() => {
      setTestRemainingMs(Math.max(0, TEST_DURATION_MS - (Date.now() - testStartedAt)));
    }, 100);
    return () => clearInterval(id);
  }, [mode, status, testStartedAt]);

  // Fires the instant the countdown reaches zero. Because this effect
  // re-runs on every `testRemainingMs` tick, `finishTest` below is
  // always a fresh closure over the current typed/snippet/totals — no
  // stale-closure risk despite the long-lived interval above.
  useEffect(() => {
    if (mode === 'test' && status === 'running' && testRemainingMs <= 0) {
      finishTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testRemainingMs, mode, status]);

  const remaining = snippet.text.length - typed.length;

  const accuracy = useMemo(() => {
    if (mode === 'practice') {
      if (typed.length === 0) return 100;
      return Math.round((countCorrect(typed, snippet.text) / typed.length) * 100);
    }
    const totalTyped = testTotalChars + typed.length;
    if (totalTyped === 0) return 100;
    const correctSoFar = testCorrectChars + countCorrect(typed, snippet.text);
    return Math.round((correctSoFar / totalTyped) * 100);
  }, [mode, typed, snippet, testTotalChars, testCorrectChars]);

  const liveWpm = useMemo(() => {
    if (mode === 'practice') {
      if (elapsedMs <= 0) return 0;
      const minutes = elapsedMs / 60_000;
      return Math.round(wordsFromChars(typed.length) / minutes);
    }
    const elapsedTestMs = TEST_DURATION_MS - testRemainingMs;
    if (elapsedTestMs <= 0) return 0;
    const totalChars = testTotalChars + typed.length;
    const minutes = elapsedTestMs / 60_000;
    return Math.round(wordsFromChars(totalChars) / minutes);
  }, [mode, typed, elapsedMs, testRemainingMs, testTotalChars]);

  const resetPractice = useCallback(
    (nextSnippet?: TypingSnippet) => {
      finishedRef.current = false;
      setSnippet(nextSnippet ?? pickSnippet(undefined, difficultyForRound(practiceRoundsDone)));
      setTyped('');
      setStatus('idle');
      setStartedAt(null);
      setElapsedMs(0);
      setLastScore(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [practiceRoundsDone],
  );

  const resetTest = useCallback(() => {
    finishedRef.current = false;
    setTestTotalChars(0);
    setTestCorrectChars(0);
    setTestSnippetsDone(0);
    setTestResult(null);
    setTestRemainingMs(TEST_DURATION_MS);
    setTestStartedAt(null);
    setSnippet(pickSnippet(undefined, difficultyForRound(0)));
    setTyped('');
    setStatus('idle');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Practice keeps ramping from wherever practiceRoundsDone left off;
    // test always restarts its own ramp at the top since its counter is
    // about to be zeroed below.
    const nextDifficulty =
      next === 'practice' ? difficultyForRound(practiceRoundsDone) : difficultyForRound(0);
    resetPractice(pickSnippet(undefined, nextDifficulty));
    // resetPractice already clears the shared bits (status/typed/etc);
    // just also zero out the other mode's session so switching back
    // and forth never carries stale progress with it.
    setTestTotalChars(0);
    setTestCorrectChars(0);
    setTestSnippetsDone(0);
    setTestResult(null);
    setTestRemainingMs(TEST_DURATION_MS);
    setTestStartedAt(null);
  }

  function startPractice() {
    setStatus('running');
    const t = Date.now();
    setStartedAt(t);
    setElapsedMs(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function startTest() {
    setStatus('running');
    const t = Date.now();
    setTestStartedAt(t);
    setTestRemainingMs(TEST_DURATION_MS);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function commitPractice() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const totalMs = startedAt == null ? 0 : Date.now() - startedAt;
    const minutes = totalMs / 60_000 || 1 / 60_000;
    const wpm = Math.round(wordsFromChars(typed.length) / minutes);
    const correct = countCorrect(typed, snippet.text);
    const finalAccuracy =
      typed.length === 0 ? 0 : Math.round((correct / typed.length) * 100);
    const score: TypingScore = {
      wpm,
      accuracy: finalAccuracy,
      length: snippet.text.length,
      at: Date.now(),
    };
    setLastScore(score);
    setStatus('finished');
    setPracticeRoundsDone((n) => n + 1);
    if (ready) recordTyping(score);
  }

  /** Current snippet finished with time still on the clock — credit it and load the next one. */
  function advanceTestSnippet() {
    // The 3-minute clock can run out in the same instant the last
    // snippet is completed (this runs from a deferred setTimeout, so
    // `finishTest` may already have ended the session by the time it
    // fires) — once finished, don't keep mutating session state.
    if (finishedRef.current) return;
    const nextDone = testSnippetsDone + 1;
    setTestTotalChars((n) => n + snippet.text.length);
    setTestCorrectChars((n) => n + countCorrect(typed, snippet.text));
    setTestSnippetsDone(nextDone);
    setSnippet(pickSnippet(snippet, difficultyForRound(nextDone)));
    setTyped('');
  }

  /** The 3-minute clock ran out — tally everything, including a partial credit for the in-flight snippet. */
  function finishTest() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const totalChars = testTotalChars + typed.length;
    const correctChars = testCorrectChars + countCorrect(typed, snippet.text);
    const minutes = TEST_DURATION_MS / 60_000;
    const wpm = Math.round(wordsFromChars(totalChars) / minutes);
    const finalAccuracy = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);
    setTestResult({ wpm, accuracy: finalAccuracy, snippets: testSnippetsDone });
    setStatus('finished');
    setTestRemainingMs(0);
    const score: TypingScore = { wpm, accuracy: finalAccuracy, length: totalChars, at: Date.now() };
    if (ready) recordTyping(score);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (status === 'finished') return;
    const value = e.target.value;
    if (status === 'idle' && value.length > 0) {
      if (mode === 'practice') startPractice();
      else startTest();
    }
    if (status === 'running' && value.length > snippet.text.length) return;

    if (value.length > typed.length) {
      const idx = value.length - 1;
      const correct = value[idx] === snippet.text[idx];
      playTone(correct ? 460 : 150, correct ? 0.02 : 0.05, correct ? 0.03 : 0.045);
    } else if (value.length < typed.length) {
      playTone(220, 0.02, 0.02);
    }

    setTyped(value);
    if (value === snippet.text) {
      // Matches the shell itself: finishing the line doesn't run it —
      // Enter does. See onInputKeyDown below.
      playTone(720, 0.06, 0.05);
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || status !== 'running' || typed !== snippet.text) return;
    e.preventDefault();
    if (mode === 'practice') commitPractice();
    else advanceTestSnippet();
  }

  return (
    <>
      {isZen && (
        <div
          className="fixed inset-0 z-[199] bg-slate-950/90 backdrop-blur-sm"
          onClick={() => setIsZen(false)}
          aria-hidden
        />
      )}
      <div className="space-y-12">
        <header className="space-y-3 pt-6 text-center sm:pt-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
            <GamepadIcon size={12} /> ~/typing $ time bash
          </div>
          <h1 className="text-balance text-3xl font-bold sm:text-4xl">Typing test</h1>
          <p className="mx-auto max-w-2xl text-pretty text-sm text-slate-400 sm:text-base">
            Type the command exactly as shown, as fast and as accurately as you can.
            <strong className="text-slate-300"> Practice</strong> is one snippet at a time,
            no pressure. <strong className="text-slate-300">Take Test</strong> is a focused
            3-minute sprint across as many snippets as you can get through. Commands start{' '}
            <strong className="text-slate-300">Beginner</strong> and ramp up through{' '}
            <strong className="text-slate-300">Intermediate</strong>,{' '}
            <strong className="text-slate-300">Advanced</strong>, and{' '}
            <strong className="text-slate-300">Expert</strong> as you clear rounds. Hitting 30
            WPM unlocks the <em>Fast fingers</em> badge; 60 WPM unlocks <em>Lightning</em> —
            either mode counts.
          </p>
        </header>

        <div className="mx-auto flex w-fit gap-1 rounded-full border border-[var(--lx-border)] bg-slate-900/40 p-1">
          <button
            type="button"
            onClick={() => switchMode('practice')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === 'practice'
                ? 'bg-[var(--lx-accent)] text-slate-950'
                : 'text-slate-400 hover:text-[var(--lx-fg)]'
            }`}
          >
            Practice
          </button>
          <button
            type="button"
            onClick={() => switchMode('test')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === 'test'
                ? 'bg-[var(--lx-accent)] text-slate-950'
                : 'text-slate-400 hover:text-[var(--lx-fg)]'
            }`}
          >
            Take Test · 3 min
          </button>
        </div>

        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="WPM" value={liveWpm} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
            <Stat
              label={mode === 'test' ? 'Time left' : 'Time'}
              value={formatSeconds(mode === 'test' ? testRemainingMs : elapsedMs)}
            />
          </div>
        </section>

        <section
          className={
            isZen
              ? 'lx-card fixed inset-3 z-[200] flex flex-col justify-center space-y-4 overflow-auto p-5 shadow-2xl sm:inset-6 sm:p-8'
              : 'lx-card space-y-4 p-5 sm:p-6'
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {mode === 'practice' ? (
                <Pill tone="accent">
                  <TargetIcon size={12} /> Round {practiceRoundsDone + 1}
                </Pill>
              ) : (
                <Pill tone="accent">
                  <ClockIcon size={12} /> {testSnippetsDone} snippet{testSnippetsDone === 1 ? '' : 's'} completed
                </Pill>
              )}
              <Pill tone={snippet.difficulty}>{DIFFICULTY_LABEL[snippet.difficulty]}</Pill>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundOn((v) => !v)}
                className="lx-btn lx-btn-ghost lx-btn-sm px-2"
                title={soundOn ? 'Mute keystroke sounds' : 'Enable keystroke sounds'}
                aria-label="Toggle keystroke sounds"
                aria-pressed={soundOn}
              >
                {soundOn ? <VolumeIcon size={13} /> : <VolumeOffIcon size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsZen((v) => !v)}
                className="lx-btn lx-btn-ghost lx-btn-sm px-2"
                title={isZen ? 'Exit zen mode (Esc)' : 'Zen mode — distraction-free fullscreen'}
                aria-label="Toggle zen mode"
                aria-pressed={isZen}
              >
                {isZen ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
              </button>
              <button
                type="button"
                onClick={() => (mode === 'practice' ? resetPractice() : resetTest())}
                className="lx-btn lx-btn-ghost lx-btn-sm"
                title={mode === 'practice' ? 'Pick a new snippet' : 'Restart the 3-minute test'}
              >
                <ResetIcon size={12} /> {mode === 'practice' ? 'New snippet' : 'Restart test'}
              </button>
            </div>
          </div>

          {isZen && (
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-slate-400">
              <span>{liveWpm} WPM</span>
              <span>{accuracy}% accuracy</span>
              <span>{formatSeconds(mode === 'test' ? testRemainingMs : elapsedMs)}</span>
            </div>
          )}

          <p
            className="font-mono text-lg leading-relaxed sm:text-2xl"
            aria-hidden
          >
            {snippet.text.split('').map((ch, idx) => {
              const userChar = typed[idx];
              const state =
                userChar == null
                  ? 'pending'
                  : userChar === ch
                    ? 'correct'
                    : 'wrong';
              const showCaret = status === 'running' && idx === typed.length;
              return (
                <span key={idx} className={showCaret ? 'relative' : undefined}>
                  {showCaret && (
                    <span
                      className="absolute -left-px top-0 h-full w-[2px] animate-pulse bg-[var(--lx-accent)]"
                      aria-hidden
                    />
                  )}
                  <span
                    className={
                      state === 'correct'
                        ? 'text-emerald-300'
                        : state === 'wrong'
                          ? 'text-rose-400 underline decoration-rose-500/60 underline-offset-2'
                          : 'text-slate-500'
                    }
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
            {status === 'running' && typed.length === snippet.text.length && (
              <span
                className="ml-px inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-[var(--lx-accent)]"
                aria-hidden
              />
            )}
          </p>

          <p className="text-sm text-slate-400">{snippet.usage}</p>

          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={onChange}
            onKeyDown={onInputKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={
              status === 'idle'
                ? mode === 'practice'
                  ? 'Start typing to begin…'
                  : 'Start typing to begin the 3-minute test…'
                : ''
            }
            aria-label="Type the command"
            className="lx-input w-full font-mono"
            disabled={status === 'finished'}
          />

          <p className="text-xs text-slate-500">
            {mode === 'practice' && status === 'idle' && 'Press a key to start the timer.'}
            {mode === 'practice' && status === 'running' && typed === snippet.text && (
              <>Press <kbd className="lx-kbd">Enter</kbd> to submit.</>
            )}
            {mode === 'practice' &&
              status === 'running' &&
              typed !== snippet.text &&
              `${remaining} character${remaining === 1 ? '' : 's'} left.`}
            {mode === 'practice' && status === 'finished' && lastScore && (
              <>
                Round over: <strong>{lastScore.wpm} WPM</strong> at{' '}
                <strong>{lastScore.accuracy}%</strong> accuracy.
              </>
            )}
            {mode === 'test' && status === 'idle' && 'Press a key to start the 3-minute test.'}
            {mode === 'test' && status === 'running' && typed === snippet.text && (
              <>Press <kbd className="lx-kbd">Enter</kbd> for the next snippet.</>
            )}
            {mode === 'test' &&
              status === 'running' &&
              typed !== snippet.text &&
              `${remaining} character${remaining === 1 ? '' : 's'} left in this snippet.`}
            {mode === 'test' && status === 'finished' && testResult && (
              <>
                Time&apos;s up: <strong>{testResult.wpm} WPM</strong> at{' '}
                <strong>{testResult.accuracy}%</strong> accuracy across{' '}
                <strong>{testResult.snippets}</strong> snippet{testResult.snippets === 1 ? '' : 's'}.
              </>
            )}
          </p>

          {status === 'finished' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => (mode === 'practice' ? resetPractice() : resetTest())}
                className="lx-btn lx-btn-primary"
              >
                <ArrowRightIcon size={14} /> {mode === 'practice' ? 'Try another' : 'Take test again'}
              </button>
              <Link href="/achievements" className="lx-btn lx-btn-secondary">
                <TrophyIcon size={14} /> See your badges
              </Link>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <Pill tone="default">
                <ClockIcon size={12} /> Best on this browser
              </Pill>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Personal best</h2>
            </div>
          </div>
          <div className="lx-card p-5 sm:p-6">
            {ready && state.bestTyping ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Best WPM" value={state.bestTyping.wpm} />
                <Stat label="Best accuracy" value={`${state.bestTyping.accuracy}%`} />
                <Stat label="Characters typed" value={state.bestTyping.length} />
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No runs yet on this browser. Finish a snippet (or a full test) to set a baseline.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="lx-card flex flex-col items-center gap-1 p-4 text-center">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-2xl font-semibold text-[var(--lx-fg)]">{value}</span>
    </div>
  );
}

function formatSeconds(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
