import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLessons, getLessonBySlug, getQuestionsForLesson } from '@/lib/lessons';
import { LessonDetailClient } from './_lesson-detail-client';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const lesson = getLessonBySlug(params.slug);
  if (!lesson) return { title: 'Lesson' };
  return { title: lesson.title, description: lesson.description.replace(/`/g, '') };
}

export default function LessonPage({ params }: PageProps) {
  const lessons = getAllLessons();
  const idx = lessons.findIndex((l) => l.slug === params.slug);
  if (idx === -1) notFound();
  const lesson = lessons[idx];
  const previous = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const questions = getQuestionsForLesson(lesson.id);
  const trackLessons = lessons.filter((l) => l.track === lesson.track);

  return (
    <LessonDetailClient
      lesson={lesson}
      neighbours={{
        previous: previous && { slug: previous.slug, title: previous.title, track: previous.track },
        next: next && { slug: next.slug, title: next.title, track: next.track },
      }}
      trackPosition={{
        index: trackLessons.findIndex((l) => l.id === lesson.id),
        total: trackLessons.length,
      }}
      questions={questions}
    />
  );
}
