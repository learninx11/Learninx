'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIcon,
  AwardIcon,
  ChartIcon,
  ClockIcon,
  DownloadIcon,
  FireIcon,
  MedalIcon,
  NoteIcon,
  StarIcon,
  TargetIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';
import { exportProgress } from '@/lib/progress-client';
import { getAllLessons } from '@/lib/lessons';
import { getAllBosses } from '@/lib/bosses';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { masteredFlashcards } from '@/lib/achievements';

export function ProfileClient() {
  const { state, ready, reset, importJson } = useProgress();
  const lessons = getAllLessons();
  const bosses = getAllBosses();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    text: string;
    fileName: string;
    exportedAt: string | null;
    lessons: number;
    badges: number;
  } | null>(null);

  const totalLessons = lessons.length;
  const totalBosses = bosses.length;
  const completedLessons = state.completed.length;
  const completedBosses = state.bossesCompleted.length;
  const bookmarkCount = state.bookmarks.length;
  const noteCount = Object.values(state.notes).filter((n) => n.text.trim().length > 0).length;
  const quizCount = Object.keys(state.quiz).length;
  const perfectQuizCount = Object.values(state.quiz).filter(
    (q) => q.total > 0 && q.correct === q.total,
  ).length;
  const achievementCount = state.achievements.length;
  const lessonCompletionPct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const bossCompletionPct = totalBosses === 0 ? 0 : Math.round((completedBosses / totalBosses) * 100);
  const recent = useMemo(() => {
    const items: { id: string; title: string; at: number; kind: 'lesson' | 'boss' }[] = [];
    state.completed.forEach((id) => {
      const l = lessons.find((x) => x.id === id);
      if (l) items.push({ id, title: l.title, at: 0, kind: 'lesson' });
    });
    Object.entries(state.quiz).forEach(([id, q]) => {
      const l = lessons.find((x) => x.id === id);
      if (l) items.push({ id, title: `Quiz: ${l.title}`, at: q.at, kind: 'lesson' });
    });
    return items
      .filter((i) => i.at > 0)
      .sort((a, b) => b.at - a.at)
      .slice(0, 5);
  }, [state, lessons]);

  function handleExport() {
    const json = exportProgress(state);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learninx-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fall back to clipboard.
      navigator.clipboard?.writeText(json).catch(() => undefined);
    }
  }

  function handleImportClick() {
    setImportError(null);
    setImportOk(null);
    fileInputRef.current?.click();
  }

  // Read the chosen file and show what it holds; nothing is replaced
  // until the learner confirms.
  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportOk(null);
    setPendingImport(null);
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      try {
        const parsed = JSON.parse(text) as {
          app?: string;
          exportedAt?: string;
          state?: { completed?: unknown[]; achievements?: unknown[] };
        };
        if (!parsed || parsed.app !== 'learninx' || !parsed.state) {
          throw new Error('That file is not a Learninx backup.');
        }
        setPendingImport({
          text,
          fileName: file.name,
          exportedAt: parsed.exportedAt ?? null,
          lessons: Array.isArray(parsed.state.completed) ? parsed.state.completed.length : 0,
          badges: Array.isArray(parsed.state.achievements) ? parsed.state.achievements.length : 0,
        });
      } catch (err) {
        setImportError(
          err instanceof SyntaxError
            ? 'That file is not valid JSON.'
            : err instanceof Error
              ? err.message
              : 'Could not read that file.',
        );
      }
    };
    reader.onerror = () => setImportError('Could not read that file.');
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!pendingImport) return;
    try {
      const next = importJson(pendingImport.text);
      setImportOk(
        `Restored ${next.completed.length} completed lesson${next.completed.length === 1 ? '' : 's'} and ${next.achievements.length} badge${next.achievements.length === 1 ? '' : 's'}.`,
      );
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not import that file.');
    }
    setPendingImport(null);
  }

  return (
    <div className="space-y-12">
      <header className="space-y-3 pt-6 text-center sm:pt-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lx-border bg-lx-surface px-3 py-1 font-mono text-xs text-lx-accent">
          <UserIcon size={12} /> ~/profile $ whoami
        </div>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Your profile</h1>
        <p className="mx-auto max-w-2xl text-pretty text-sm text-lx-muted sm:text-base">
          Lifetime stats, plus tools to back up and restore your progress on another
          device. Everything is computed from the snapshot stored in your browser.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <ChartIcon size={12} /> Lifetime stats
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Numbers</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Points"
            value={ready ? state.streak.points : 0}
            icon={<StarIcon size={16} />}
            sub="10 per lesson · 1 per correct quiz"
          />
          <StatCard
            label="Current streak"
            value={ready ? state.streak.current : 0}
            icon={<FireIcon size={16} />}
            sub={state.streak.lastActiveDay ? `Last day: ${state.streak.lastActiveDay}` : 'No day yet'}
          />
          <StatCard
            label="Best streak"
            value={ready ? state.streak.best : 0}
            icon={<FireIcon size={16} />}
            sub="consecutive days"
          />
          <StatCard
            label="Lessons done"
            value={ready ? state.streak.totalCompletions : 0}
            icon={<TargetIcon size={16} />}
            sub="across the catalogue"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <ActivityIcon size={12} /> Activity
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Your year</h2>
          </div>
        </div>
        <div className="lx-card p-5 sm:p-6">
          {ready ? (
            <ActivityHeatmap activity={state.activity} />
          ) : (
            <div className="h-[130px]" aria-hidden />
          )}
          <p className="mt-3 text-xs text-lx-subtle">
            Each square is a day (UTC). Lessons, quizzes, bosses, typing tests, and
            flashcard answers all count.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <TargetIcon size={12} /> Progress
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Where you are</h2>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="lx-card p-5 sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Lessons</span>
              <span className="font-mono tabular-nums text-lx-muted">
                {completedLessons} / {totalLessons}
              </span>
            </div>
            <ProgressBar value={completedLessons} max={totalLessons} label="Lessons completed" showLabel={false} className="mt-3" />
            <p className="mt-3 text-xs text-lx-subtle">
              {lessonCompletionPct}% of the catalogue complete.
            </p>
            <Link href="/lessons" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-lx-accent hover:underline">
              Find the next one →
            </Link>
          </div>
          <div className="lx-card p-5 sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Boss levels</span>
              <span className="font-mono tabular-nums text-lx-muted">
                {completedBosses} / {totalBosses}
              </span>
            </div>
            <ProgressBar value={completedBosses} max={totalBosses} label="Boss levels defeated" showLabel={false} className="mt-3" />
            <p className="mt-3 text-xs text-lx-subtle">
              {bossCompletionPct}% of bosses defeated. Bosses award 25 points each.
            </p>
            <Link href="/boss" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-lx-accent hover:underline">
              Open a boss →
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <NoteIcon size={12} /> Tools
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Study tools</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToolStat label="Bookmarks" value={bookmarkCount} href="/lessons#bookmarks" />
          <ToolStat label="Notes" value={noteCount} href="/lessons" />
          <ToolStat label="Quizzes taken" value={quizCount} href="/lessons" />
          <ToolStat label="Perfect quizzes" value={perfectQuizCount} href="/lessons" />
          <ToolStat label="Flashcard answers" value={state.flashcardReviews} href="/flashcards" />
          <ToolStat label="Commands mastered" value={masteredFlashcards(state)} href="/flashcards" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <MedalIcon size={12} /> Achievements
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Badges</h2>
          </div>
          <Link href="/achievements" className="text-xs font-medium text-lx-accent hover:underline">
            See all →
          </Link>
        </div>
        <div className="lx-card flex flex-col items-center justify-between gap-2 p-5 sm:flex-row sm:p-6">
          <div>
            <p className="text-sm text-lx-muted">Unlocked so far</p>
            <p className="text-2xl font-semibold">
              {ready ? achievementCount : 0} <span className="text-sm text-lx-subtle">achievements</span>
            </p>
          </div>
          <Link href="/achievements" className="lx-btn lx-btn-secondary">
            <AwardIcon size={14} /> View all
          </Link>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <Pill tone="accent">
                <ClockIcon size={12} /> Recent activity
              </Pill>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Last five attempts</h2>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => (
              <li
                key={`${r.kind}-${r.id}-${r.at}`}
                className="flex items-center justify-between gap-2 rounded-md border border-lx-border bg-lx-surface px-3 py-2"
              >
                <span className="truncate">{r.title}</span>
                <span className="shrink-0 text-xs text-lx-subtle">{formatTime(r.at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <DownloadIcon size={12} /> Back up &amp; restore
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Move your progress</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="lx-card flex flex-col gap-3 p-5 sm:p-6">
            <h3 className="font-semibold">Export</h3>
            <p className="text-sm text-lx-muted">
              Save a JSON file containing your completions, streaks, bookmarks, notes,
              and achievements. You can keep it as a backup, or move it to another
              browser.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="lx-btn lx-btn-primary self-start"
            >
              <DownloadIcon size={14} /> Download backup
            </button>
          </div>
          <div className="lx-card flex flex-col gap-3 p-5 sm:p-6">
            <h3 className="font-semibold">Import</h3>
            <p className="text-sm text-lx-muted">
              Restore a previously-exported file. You&apos;ll see what it contains and
              confirm before it replaces the progress on this browser.
            </p>
            {pendingImport ? (
              <div
                role="alertdialog"
                aria-labelledby="import-confirm-title"
                className="space-y-3 rounded-lg border border-lx-warning/40 bg-lx-warning/10 p-3 text-sm"
              >
                <p id="import-confirm-title" className="font-semibold text-lx-fg">
                  Replace your progress with this backup?
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  <dt className="text-lx-subtle">File</dt>
                  <dd className="truncate text-lx-fg">{pendingImport.fileName}</dd>
                  {pendingImport.exportedAt && (
                    <>
                      <dt className="text-lx-subtle">Saved</dt>
                      <dd className="text-lx-fg">{new Date(pendingImport.exportedAt).toLocaleString()}</dd>
                    </>
                  )}
                  <dt className="text-lx-subtle">Backup</dt>
                  <dd className="text-lx-fg">
                    {pendingImport.lessons} lessons · {pendingImport.badges} badges
                  </dd>
                  <dt className="text-lx-subtle">Now</dt>
                  <dd className="text-lx-fg">
                    {completedLessons} lessons · {achievementCount} badges
                  </dd>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={confirmImport} className="lx-btn lx-btn-primary lx-btn-sm">
                    Replace progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingImport(null)}
                    className="lx-btn lx-btn-ghost lx-btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImportClick}
                className="lx-btn lx-btn-secondary self-start"
              >
                <UploadIcon size={14} /> Import a backup
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            {importError && (
              <p role="alert" className="rounded-md border border-lx-danger/30 bg-lx-danger/10 p-2 text-xs text-lx-danger">
                {importError}
              </p>
            )}
            {importOk && (
              <p role="status" className="rounded-md border border-lx-success/30 bg-lx-success/10 p-2 text-xs text-lx-success">
                {importOk}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="default">
              <TrashIcon size={12} /> Danger zone
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Reset progress</h2>
          </div>
        </div>
        <div className="lx-card flex flex-col items-start justify-between gap-3 border-lx-danger/25 p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="max-w-xl text-sm text-lx-muted">
            Erase all of your progress, bookmarks, notes, and achievements on this
            browser. There is no undo. Export first if you want a backup.
          </p>
          {showReset ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm reset">
              <span className="text-sm font-medium text-lx-danger">Erase everything?</span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowReset(false);
                }}
                className="lx-btn lx-btn-danger lx-btn-sm"
              >
                Yes, erase
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="lx-btn lx-btn-secondary lx-btn-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="lx-btn lx-btn-ghost text-lx-danger"
            >
              <TrashIcon size={14} /> Reset progress
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="lx-card flex flex-col gap-1 p-5 sm:p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-lx-subtle">
        <span>{label}</span>
        <span aria-hidden className="text-lx-accent">
          {icon}
        </span>
      </div>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
      {sub && <span className="text-xs text-lx-muted">{sub}</span>}
    </div>
  );
}

function ToolStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="lx-card lx-card-interactive flex flex-col gap-1 p-5">
      <span className="text-xs uppercase tracking-wide text-lx-subtle">{label}</span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
    </Link>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return new Date(ts).toLocaleDateString();
}
