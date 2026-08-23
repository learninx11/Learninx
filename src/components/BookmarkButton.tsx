'use client';

import { useEffect, useState } from 'react';
import { BookmarkIcon, CheckCheckIcon } from '@/components/ui/Icon';
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
      onClick={() => {
        const added = toggleBookmark(lessonId);
        setBookmarked(added);
      }}
      className={
        className ??
        'lx-btn lx-btn-secondary lx-btn-sm'
      }
      aria-pressed={bookmarked}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
    >
      {bookmarked ? (
        <>
          <CheckCheckIcon size={14} /> Bookmarked
        </>
      ) : (
        <>
          <BookmarkIcon size={14} /> Bookmark
        </>
      )}
    </button>
  );
}
