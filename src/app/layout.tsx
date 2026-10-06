import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { GithubIcon, SearchIcon, TerminalIcon } from '@/components/ui/Icon';
import { ResetProgressButton } from '@/components/ResetProgressButton';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { CommandPalette } from '@/components/CommandPalette';
import { AchievementToaster } from '@/components/AchievementToaster';
import { ProgressProvider } from '@/lib/progress-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learninx',
  description:
    'Learn DevOps the easy way — an interactive learning platform with in-browser terminal, lessons, and quizzes. No signup required.',
  // Icons are provided by `src/app/icon.svg` and `src/app/apple-icon.svg`,
  // which Next.js automatically wires up at the correct basePath (e.g.
  // `/Learninx/icon.svg` on GitHub Pages). Do NOT use `icons.icon: '/favicon.svg'`
  // here — the hardcoded path ignores basePath and 404s on GitHub Pages.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0f12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (e.g. Dark Reader) inject extra attributes into
    // <html>/<body> at runtime. `suppressHydrationWarning` tells React the
    // mismatch is expected, so the dev console stops shouting.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#main" className="lx-skip-link">
          Skip to content
        </a>
        <ProgressProvider>
          <KeyboardShortcuts />
          <CommandPalette />

        <header className="sticky top-0 z-30 border-b border-[var(--lx-border)] bg-[var(--lx-nav-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--lx-nav-bg)]">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
          >
            <Link
              href="/"
              className="group flex items-center gap-2 font-semibold text-lg"
            >
              <span
                aria-hidden
                className="font-mono text-[var(--lx-accent)] transition-transform group-hover:translate-x-0.5"
              >
                ~$
              </span>
              <span>
                learn
                <span className="text-[var(--lx-accent)]">inx</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 text-sm sm:gap-2">
              <Link
                href="/lessons"
                className="rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)]"
              >
                <span className="hidden sm:inline">Lessons</span>
                <TerminalIcon size={16} className="sm:hidden" />
              </Link>
              <Link
                href="/terminal"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block"
              >
                Terminal
              </Link>
              <Link
                href="/cheatsheet"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block"
              >
                Cheatsheet
              </Link>
              <Link
                href="/typing"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block"
              >
                Typing
              </Link>
              <Link
                href="/flashcards"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] lg:inline-block"
              >
                Cards
              </Link>
              <Link
                href="/explain"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] lg:inline-block"
              >
                Explain
              </Link>
              <Link
                href="/achievements"
                className="hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block"
              >
                Badges
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)]"
              >
                <span className="hidden sm:inline">Profile</span>
                <SearchIcon size={16} className="sm:hidden" />
              </Link>
              <a
                href="https://github.com/learninx11/Learninx"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-flex"
              >
                <GithubIcon size={14} /> GitHub
              </a>
              <div className="hidden md:block">
                <ResetProgressButton />
              </div>
            </div>
          </nav>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
          {children}
        </main>

        <footer className="mx-auto mt-12 max-w-6xl px-4 py-8 text-center text-xs text-slate-500">
          <p>
            Built for learning DevOps · open source · no signup, no tracking
          </p>
          <p className="mt-1 text-slate-600">
            Press <span className="lx-kbd">g</span> then{' '}
            <span className="lx-kbd">l</span> to jump to lessons
          </p>
        </footer>
        <AchievementToaster />
        </ProgressProvider>
      </body>
    </html>
  );
}
