import { getAllLessons } from '@/lib/lessons';
import { LessonsIndexClient } from './_lessons-index-client';

export default function LessonsIndexPage() {
  const lessons = getAllLessons();
  return <LessonsIndexClient lessons={lessons} />;
}
