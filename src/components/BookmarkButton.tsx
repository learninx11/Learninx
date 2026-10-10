'use client';

import { useEffect, useState } from 'react';
import { BookmarkIcon } from '@/components/ui/Icon';
import { useProgress } from '@/lib/progress-context';

interface Props {
  lessonId: string;
  /** Optional className for layout placement. */
  className?: string;
}

/**
 * Toggle button for bookmarking a lesson. Bookmarking is per-browser
 * via the localStorage progress store, so it works on the static
 * GitHub Pages build with no server.
 */
export function BookmarkButton({ lessonId, className }: Props) {
  const { isBookmarked, toggleBookmark, ready } = useProgress();
  // Until we hydrate, render the "off" state so the static HTML
  // matches the first client render.
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (ready) setBookmarked(isBookmarked(lessonId));
  }, [ready, isBookmarked, lessonId]);

  return (
    <button
      type="button"
      onClick={() => setBookmarked(toggleBookmark(lessonId))}
      className={
        className ??
        `lx-btn lx-btn-secondary lx-btn-sm ${bookmarked ? 'border-lx-accent/50 text-lx-accent' : ''}`
      }
      aria-pressed={bookmarked}
      title={bookmarked ? 'Remove from saved lessons' : 'Save this lesson for later'}
    >
      <BookmarkIcon size={14} fill={bookmarked ? 'currentColor' : 'none'} />
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
