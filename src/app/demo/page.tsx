import type { Metadata } from 'next';
import { DemoPlayer } from './_demo-player';

export const metadata: Metadata = {
  title: 'Learninx — Demo',
  description:
    'A short autoplaying walkthrough of Learninx: lessons, the in-browser terminal, and the boss-level sandbox.',
};

/**
 * /demo — autoplaying video player used by the README.
 *
 * Why this exists as a Next route instead of a static .html file in /docs:
 *   - The GitHub Pages workflow only deploys the Next.js `out/` folder, so
 *     a hand-written file under `docs/` is not served on the live site.
 *   - This page is built by `next build` and exported to `out/demo.html`,
 *     reachable on GitHub Pages at `/Learninx/demo`.
 *   - Because it's a real Next.js page, the MP4 ships from `public/` and is
 *     served at the site root — no CORS or relative-path issues.
 */
export default function DemoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Learninx — Demo
        </h1>
        <p className="max-w-2xl text-sm text-[var(--lx-muted)]">
          A short walkthrough of the lessons, the in-browser terminal, and the
          boss-level sandbox. The video starts automatically — tap it to unmute
          or pause.
        </p>
      </header>
      <DemoPlayer />
    </div>
  );
}
