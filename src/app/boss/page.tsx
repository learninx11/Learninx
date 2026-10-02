import { BossIndexClient } from './_boss-index-client';

export const metadata = {
  title: 'Boss levels',
  description:
    'Multi-step DevOps challenges. Restore a broken service, sort a messy log folder, and more — all in the in-browser sandbox.',
};

export default function BossIndexPage() {
  return <BossIndexClient />;
}
