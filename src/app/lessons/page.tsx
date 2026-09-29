import type { Metadata } from 'next';
import { getAllLessons } from '@/lib/lessons';
import { LessonsIndexClient } from './_lessons-index-client';

export const metadata: Metadata = {
  title: 'Lessons',
  description:
    'Browse the full lesson catalogue — beginner through expert, with hands-on challenges and quizzes.',
};

export default function LessonsIndexPage() {
  const lessons = getAllLessons();
  return <LessonsIndexClient lessons={lessons} />;
}
