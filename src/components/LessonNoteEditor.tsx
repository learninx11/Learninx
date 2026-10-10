'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CheckIcon, NoteIcon, PencilIcon, TrashIcon } from '@/components/ui/Icon';
import { useProgress } from '@/lib/progress-context';
import type { LessonNote } from '@/lib/progress-types';

const MAX_LENGTH = 4000;

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
  const [confirmClear, setConfirmClear] = useState(false);
  const textareaId = useId();
  const headingId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when the lesson changes (e.g. nav between
  // lessons with the back/forward buttons without a full reload).
  useEffect(() => {
    const note = state.notes[lessonId] ?? null;
    setText(note?.text ?? '');
    setSavedAt(note?.updatedAt ?? null);
    setEditing(!note);
    setConfirmClear(false);
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

  function startEditing() {
    setEditing(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function clear() {
    setText('');
    setNote(lessonId, '');
    setSavedAt(null);
    setEditing(true);
    setConfirmClear(false);
  }

  const hasText = text.trim().length > 0;

  return (
    <section aria-labelledby={headingId} className="lx-card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="flex items-center gap-2 font-semibold">
          <NoteIcon size={15} className="text-lx-accent" /> Your notes
        </h2>
        <div className="flex items-center gap-1 text-xs">
          {confirmClear ? (
            <>
              <span className="mr-1 text-lx-muted">Delete this note?</span>
              <button type="button" onClick={clear} className="lx-btn lx-btn-danger lx-btn-sm py-1">
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="lx-btn lx-btn-ghost lx-btn-sm py-1"
              >
                Keep
              </button>
            </>
          ) : (
            <>
              {!editing && (
                <button type="button" onClick={startEditing} className="lx-btn lx-btn-ghost lx-btn-sm py-1">
                  <PencilIcon size={12} /> Edit
                </button>
              )}
              {hasText && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="lx-btn lx-btn-ghost lx-btn-sm py-1 text-lx-muted"
                >
                  <TrashIcon size={12} /> Clear
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {editing ? (
        <>
          <label htmlFor={textareaId} className="sr-only">
            Notes for this lesson
          </label>
          <textarea
            id={textareaId}
            ref={textareaRef}
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Jot down commands, gotchas, or questions. Notes stay on this device."
            className="lx-input w-full resize-y text-sm leading-relaxed"
            maxLength={MAX_LENGTH}
          />
        </>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="block w-full whitespace-pre-wrap rounded-md border border-lx-border bg-lx-surface p-3 text-left text-sm leading-relaxed text-lx-prose-body transition hover:border-lx-accent/40"
          aria-label="Edit your notes"
        >
          {hasText ? text : 'No notes yet — click to add some.'}
        </button>
      )}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-lx-subtle">
        <span className="inline-flex items-center gap-1">
          {savedAt ? (
            <>
              <CheckIcon size={12} className="text-lx-success" /> Saved {formatTimeAgo(savedAt)}
            </>
          ) : (
            'Kept on this browser only.'
          )}
        </span>
        {editing && text.length > MAX_LENGTH * 0.8 && (
          <span className="tabular-nums">
            {text.length} / {MAX_LENGTH}
          </span>
        )}
      </div>
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
