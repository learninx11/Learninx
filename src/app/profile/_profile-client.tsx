'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
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

export function ProfileClient() {
  const { state, ready, reset, importJson } = useProgress();
  const lessons = getAllLessons();
  const bosses = getAllBosses();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

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

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportOk(null);
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const next = importJson(text);
        setImportOk(
          `Imported ${next.completed.length} completed lesson${next.completed.length === 1 ? '' : 's'} and ${next.achievements.length} achievement${next.achievements.length === 1 ? '' : 's'}.`,
        );
      } catch (err) {
        setImportError(
          err instanceof Error ? err.message : 'Could not import that file.',
        );
      }
    };
    reader.onerror = () => setImportError('Could not read that file.');
    reader.readAsText(file);
  }

  return (
    <div className="space-y-12">
      <header className="space-y-3 pt-6 text-center sm:pt-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
          <UserIcon size={12} /> ~/profile $ whoami
        </div>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Your profile</h1>
        <p className="mx-auto max-w-2xl text-pretty text-sm text-slate-400 sm:text-base">
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
              <TargetIcon size={12} /> Progress
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Where you are</h2>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="lx-card p-5 sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Lessons</span>
              <span className="text-slate-400">
                {completedLessons} / {totalLessons}
              </span>
            </div>
            <ProgressBar value={completedLessons} max={totalLessons} label="Lessons" className="mt-3" />
            <p className="mt-3 text-xs text-slate-500">
              {lessonCompletionPct}% of the catalogue complete.
            </p>
            <Link href="/lessons" className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--lx-accent)]">
              Find the next one →
            </Link>
          </div>
          <div className="lx-card p-5 sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Boss levels</span>
              <span className="text-slate-400">
                {completedBosses} / {totalBosses}
              </span>
            </div>
            <ProgressBar value={completedBosses} max={totalBosses} label="Bosses" className="mt-3" />
            <p className="mt-3 text-xs text-slate-500">
              {bossCompletionPct}% of bosses defeated. Bosses award 25 points each.
            </p>
            <Link href="/boss" className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--lx-accent)]">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToolStat label="Bookmarks" value={bookmarkCount} href="/lessons" />
          <ToolStat label="Notes" value={noteCount} href="/lessons" />
          <ToolStat label="Quizzes taken" value={quizCount} href="/lessons" />
          <ToolStat label="Perfect quizzes" value={perfectQuizCount} href="/lessons" />
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
          <Link href="/achievements" className="text-xs text-[var(--lx-accent)]">
            See all →
          </Link>
        </div>
        <div className="lx-card flex flex-col items-center justify-between gap-2 p-5 sm:flex-row sm:p-6">
          <div>
            <p className="text-sm text-slate-400">Unlocked so far</p>
            <p className="text-2xl font-semibold">
              {ready ? achievementCount : 0} <span className="text-sm text-slate-500">achievements</span>
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
                className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2"
              >
                <span className="truncate">{r.title}</span>
                <span className="text-xs text-slate-500">{formatTime(r.at)}</span>
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
            <p className="text-sm text-slate-400">
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
            <p className="text-sm text-slate-400">
              Restore a previously-exported file. This replaces the current progress
              on this browser, so make sure you want to overwrite first.
            </p>
            <button
              type="button"
              onClick={handleImportClick}
              className="lx-btn lx-btn-secondary self-start"
            >
              <UploadIcon size={14} /> Import a backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            {importError && (
              <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200">
                {importError}
              </p>
            )}
            {importOk && (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-200">
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
        <div className="lx-card flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="max-w-xl text-sm text-slate-400">
            Erase all of your progress, bookmarks, notes, and achievements on this
            browser. There is no undo. Export first if you want a backup.
          </p>
          {showReset ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowReset(false);
                }}
                className="rounded-md border border-rose-500/50 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
              >
                Yes, wipe
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="lx-btn lx-btn-ghost text-rose-300"
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
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
        <span>{label}</span>
        <span aria-hidden className="text-[var(--lx-accent)]">
          {icon}
        </span>
      </div>
      <span className="text-2xl font-semibold">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
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
    <Link href={href} className="lx-card flex flex-col gap-1 p-5 transition hover:border-[var(--lx-accent)]/40">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
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
