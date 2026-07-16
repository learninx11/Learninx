import type { Metadata } from 'next';
import { ProfileClient } from './_profile-client';

export const metadata: Metadata = {
  title: 'Profile — Learninx',
  description:
    'Your lifetime Learninx stats, plus tools to back up and restore your progress on another device.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
