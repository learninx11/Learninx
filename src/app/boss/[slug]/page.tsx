import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { ChevronRightIcon, TargetIcon } from '@/components/ui/Icon';
import { getAllBosses, getBossBySlug } from '@/lib/bosses';
import { BossClient } from './_boss-client';
import { BossShareIsland } from './_share-island';

export function generateStaticParams() {
  return getAllBosses().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const boss = getBossBySlug(params.slug);
  if (!boss) return { title: 'Boss level' };
  return {
    title: `${boss.title} · Boss level`,
    description: boss.description.replace(/`/g, ''),
  };
}

export default function BossPage({ params }: { params: { slug: string } }) {
  const boss = getBossBySlug(params.slug);
  if (!boss) notFound();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="text-sm text-lx-subtle">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/boss" className="transition hover:text-lx-accent">
                Boss levels
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRightIcon size={13} />
            </li>
            <li aria-current="page" className="text-lx-muted">
              {boss.title}
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="accent">
            <TargetIcon size={12} /> Boss level
          </Pill>
          <Pill tone={boss.difficulty}>{boss.difficulty}</Pill>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {boss.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-lx-muted">
            <RichText text={boss.description} />
          </p>
          <BossShareIsland path={`/boss/${boss.slug}`} title={boss.title} />
        </div>
      </header>
      {/* Client component looks the boss up by slug (so verifier
          functions and seed callbacks never cross the RSC boundary). */}
      <BossClient slug={boss.slug} />
    </div>
  );
}
