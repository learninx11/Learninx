import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLessons } from '@/lib/lessons';
import { TRACK_DESCRIPTION, TRACK_LABEL, TRACK_ORDER } from '@/lib/lesson-tracks';
import { TrackMenu } from '@/components/TrackMenu';
import type { LessonTrack } from '@/lib/types';
import { LessonsIndexClient } from '../../_lessons-index-client';

interface PageProps {
  params: { track: string };
}

function isLessonTrack(value: string): value is LessonTrack {
  return (TRACK_ORDER as string[]).includes(value);
}

export function generateStaticParams() {
  return TRACK_ORDER.map((track) => ({ track }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isLessonTrack(params.track)) return { title: 'Lessons' };
  return {
    title: `${TRACK_LABEL[params.track]} Lessons`,
    description: TRACK_DESCRIPTION[params.track],
  };
}

export default function TrackLessonsPage({ params }: PageProps) {
  if (!isLessonTrack(params.track)) notFound();
  const track = params.track;
  const lessons = getAllLessons().filter((l) => l.track === track);

  return (
    <div className="space-y-6">
      <TrackMenu activeTrack={track} />
      <LessonsIndexClient lessons={lessons} track={track} />
    </div>
  );
}
