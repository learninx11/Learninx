import Link from 'next/link';
import { TrackIcon } from '@/components/TrackIcon';
import { TRACK_LABEL, TRACK_ORDER } from '@/lib/lesson-tracks';
import type { LessonTrack } from '@/lib/types';

/**
 * The primary "pick a track" navigation — each track is its own page
 * (`/lessons/track/<track>`), not a client-side filter, so this is a real
 * nav menu (bold, link-styled) rather than the lighter filter `Chip`s used
 * for difficulty/status within a track page. Rendered above the page's own
 * heading on every lessons-related page, with the current track (if any)
 * highlighted.
 */
export function TrackMenu({ activeTrack }: { activeTrack?: LessonTrack }) {
  return (
    <nav aria-label="Lesson tracks" className="flex flex-wrap gap-2">
      {TRACK_ORDER.map((t) => {
        const active = t === activeTrack;
        return (
          <Link
            key={t}
            href={`/lessons/track/${t}`}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              active
                ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]'
                : 'border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-fg)] hover:border-[var(--lx-accent)]/50 hover:text-[var(--lx-accent)]'
            }`}
          >
            <TrackIcon track={t} size={13} />
            {TRACK_LABEL[t]}
          </Link>
        );
      })}
    </nav>
  );
}
