import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pill } from '@/components/ui/Pill';
import { TargetIcon } from '@/components/ui/Icon';
import { getAllBosses, getBossBySlug } from '@/lib/bosses';
import { BossClient } from './_boss-client';

export function generateStaticParams() {
  return getAllBosses().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const boss = getBossBySlug(params.slug);
  if (!boss) return { title: 'Boss level · Learninx' };
  return {
    title: `${boss.title} · Boss level · Learninx`,
    description: boss.description,
  };
}

export default function BossPage({ params }: { params: { slug: string } }) {
  const boss = getBossBySlug(params.slug);
  if (!boss) notFound();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/boss"
          className="inline-flex items-center gap-1 text-sm text-[var(--lx-muted)] transition hover:text-[var(--lx-accent)]"
        >
          ← All boss levels
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="accent">
            <TargetIcon size={12} /> Boss level
          </Pill>
          <Pill tone={boss.difficulty}>{boss.difficulty}</Pill>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {boss.title}
        </h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">{boss.description}</p>
      </header>
      {/* Client component looks the boss up by slug (so verifier
          functions and seed callbacks never cross the RSC boundary). */}
      <BossClient slug={boss.slug} />
    </div>
  );
}
