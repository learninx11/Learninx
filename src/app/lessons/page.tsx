import type { Metadata } from 'next';
import { getAllLessons } from '@/lib/lessons';
import { TrackMenu } from '@/components/TrackMenu';
import { LessonsHubClient } from './_lessons-hub-client';

export const metadata: Metadata = {
  title: 'Lessons',
  description:
    'Pick a track — Linux fundamentals, Git, CI/CD & Jenkins, Infrastructure as Code, Cloud, Observability, or Containers & Kubernetes — each with hands-on challenges and quizzes.',
};

export default function LessonsIndexPage() {
  const lessons = getAllLessons();
  return (
    <div className="space-y-6">
      <TrackMenu />
      <LessonsHubClient lessons={lessons} />
    </div>
  );
}
