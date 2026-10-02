import type { Metadata } from 'next';
import { getAllLessons } from '@/lib/lessons';
import { LessonsHubClient } from './_lessons-hub-client';

export const metadata: Metadata = {
  title: 'Lessons',
  description:
    'Pick a track — Linux fundamentals, Git, CI/CD & Jenkins, Infrastructure as Code, Cloud, Security, Observability, SRE, or Containers & Kubernetes — each with hands-on challenges and quizzes.',
};

export default function LessonsIndexPage() {
  const lessons = getAllLessons();
  return <LessonsHubClient lessons={lessons} />;
}
