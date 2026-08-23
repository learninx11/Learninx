import type { Metadata } from 'next';
import { AchievementsClient } from './_achievements-client';

export const metadata: Metadata = {
  title: 'Achievements — Learninx',
  description:
    'Unlock badges for streaks, perfect quizzes, bookmarks, and more. All progress lives in your browser.',
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}
