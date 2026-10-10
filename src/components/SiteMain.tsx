'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isWideRoute } from '@/lib/site-nav';

/** The page column — wider on pages that put a sandbox beside the content. */
export function SiteMain({ children }: { children: ReactNode }) {
  const wide = isWideRoute(usePathname() ?? '/');
  return (
    <main
      id="main"
      tabIndex={-1}
      className={`mx-auto w-full flex-1 px-4 py-8 outline-none md:py-10 ${
        wide ? 'max-w-[88rem]' : 'max-w-6xl'
      }`}
    >
      {children}
    </main>
  );
}
