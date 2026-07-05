import { notFound } from 'next/navigation';
import { getAllLessons, getQuestionsForLesson } from '@/lib/lessons';
import { LessonDetailClient } from './_lesson-detail-client';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ slug: l.slug }));
}

export default function LessonPage({ params }: PageProps) {
  const lessons = getAllLessons();
  const idx = lessons.findIndex((l) => l.slug === params.slug);
  if (idx === -1) notFound();
  const lesson = lessons[idx];
  const previous = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const questions = getQuestionsForLesson(lesson.id);

  return (
    <LessonDetailClient
      lesson={lesson}
      neighbours={{ previous, next }}
      position={{ index: idx, total: lessons.length }}
      questions={questions}
    />
  );
}
