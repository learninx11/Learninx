'use client';

import { ShareButton } from '@/components/ShareButton';

interface Props {
  path: string;
  title: string;
}

/** Tiny client island so a server component can mount a ShareButton. */
export function BossShareIsland({ path, title }: Props) {
  return <ShareButton path={path} title={title} />;
}
