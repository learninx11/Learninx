'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { NoteIcon, PencilIcon, TrashIcon } from '@/components/ui/Icon';
import { useProgress } from '@/lib/progress-context';
import type { LessonNote } from '@/lib/progress-types';

interface Props {
  lessonId: string;
}

/**
 * Per-lesson scratchpad. Notes are stored in the localStorage progress
 * store, which is what the GitHub Pages build uses, so the notes live
 * entirely on the visitor's machine.
 */
export function LessonNoteEditor({ lessonId }: Props) {
  const { state, setNote, ready } = useProgress();
  const initial: LessonNote | null = ready ? state.notes[lessonId] ?? null : null;
  const [text, setText] = useState<string>(initial?.text ?? '');
  const [savedAt, setSavedAt] = useState<number | null>(initial?.updatedAt ?? null);
  const [editing, setEditing] = useState<boolean>(!initial);
  const textareaId = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when the lesson changes (e.g. nav between
  // lessons with the back/forward buttons without a full reload).
  useEffect(() => {
    const note = state.notes[lessonId] ?? null;
    setText(note?.text ?? '');
    setSavedAt(note?.updatedAt ?? null);
    setEditing(!note);
  }, [lessonId, state.notes]);

  // Debounced save — typing should not pound localStorage on every key.
  useEffect(() => {
    if (!ready) return;
    if (text === (state.notes[lessonId]?.text ?? '')) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setNote(lessonId, text);
      setSavedAt(Date.now());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, lessonId, ready, setNote, state.notes]);

  function clear() {
    setText('');
    setNote(lessonId, '');
    setSavedAt(null);
    setEditing(false);
  }

  const savedLabel = savedAt
    ? `Saved ${formatTimeAgo(savedAt)}`
    : 'Notes are kept on this browser only.';

  return (
    <section className="lx-card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <NoteIcon size={14} />
          <h3 className="font-semibold">Your notes</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {editing ? null : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md px-2 py-1 text-[var(--lx-accent)] transition hover:bg-[var(--lx-accent-glow)]"
            >
              <PencilIcon size={12} /> Edit
            </button>
          )}
          {text.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="rounded-md px-2 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <TrashIcon size={12} /> Clear
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <textarea
          id={textareaId}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your notes here. Anything you write stays on your device — no servers involved."
          className="lx-input w-full resize-y font-mono text-sm"
          maxLength={4000}
        />
      ) : (
        <p className="whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/50 p-3 text-sm leading-relaxed text-slate-200">
          {text.trim().length === 0
            ? 'No notes yet — click Edit to add some.'
            : text}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">{savedLabel}</p>
    </section>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return new Date(ts).toLocaleDateString();
}
