import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { CommandPalette } from '@/components/CommandPalette';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { AchievementToaster } from '@/components/AchievementToaster';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteMain } from '@/components/SiteMain';
import { SiteFooter } from '@/components/SiteFooter';
import { ProgressProvider } from '@/lib/progress-context';
import { THEME_INIT_SCRIPT } from '@/lib/theme-script';
import './globals.css';

// Self-hosted at build time by next/font — no request to Google at runtime.
const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'Learninx — learn DevOps in your browser',
    template: '%s · Learninx',
  },
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0f12' },
    { media: '(prefers-color-scheme: light)', color: '#f6f8fa' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (e.g. Dark Reader) inject extra attributes into
    // <html>/<body> at runtime, and the theme script below adds the
    // `light` class before hydration. `suppressHydrationWarning` tells
    // React both are expected.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <a href="#main" className="lx-skip-link">
          Skip to content
        </a>
        <ProgressProvider>
          <KeyboardShortcuts />
          <CommandPalette />
          <ShortcutsDialog />
          <SiteHeader />
          <SiteMain>{children}</SiteMain>
          <SiteFooter />
          <AchievementToaster />
        </ProgressProvider>
      </body>
    </html>
  );
}
