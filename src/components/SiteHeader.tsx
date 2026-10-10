'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from '@/components/Brand';
import { ThemeSwitcher, ThemeToggle } from '@/components/ThemeToggle';
import {
  CloseIcon,
  ExternalLinkIcon,
  FireIcon,
  GithubIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from '@/components/ui/Icon';
import { useProgress } from '@/lib/progress-context';
import { GITHUB_URL, NAV_GROUPS, isActivePath, isWideRoute } from '@/lib/site-nav';
import { openCommandPalette } from '@/lib/ui-events';
import { useModal } from '@/lib/use-modal';
import { useModKey } from '@/lib/use-mod-key';

/** Always in the bar from `md` up. */
const PRIMARY = ['/lessons', '/terminal', '/boss', '/cheatsheet'];
/** Joins the bar at `xl`, where there is room; the menu holds them below that. */
const SECONDARY = ['/flashcards', '/typing', '/explain'];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
const byHref = (href: string) => ALL_ITEMS.find((i) => i.href === href)!;

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const mod = useModKey();
  const wide = isWideRoute(pathname);

  useModal(menuOpen, () => setMenuOpen(false), headerRef);

  // Close the menu whenever the route changes (a link inside it was used).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // The menu button is hidden from `xl` up; don't leave an open menu stranded.
  useEffect(() => {
    if (!menuOpen) return;
    const media = window.matchMedia('(min-width: 1280px)');
    const onChange = () => media.matches && setMenuOpen(false);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40">
      <div className="border-b border-lx-border bg-[var(--lx-nav-bg)] backdrop-blur-md">
        <nav
          aria-label="Primary"
          className={`mx-auto flex h-14 items-center gap-2 px-4 ${wide ? 'max-w-[88rem]' : 'max-w-6xl'}`}
        >
          <Brand className="mr-2 lg:mr-4" />

          <ul className="hidden items-center gap-0.5 md:flex">
            {PRIMARY.map((href) => (
              <BarLink key={href} href={href} pathname={pathname} />
            ))}
            {SECONDARY.map((href) => (
              <BarLink key={href} href={href} pathname={pathname} className="hidden xl:block" />
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-keyshortcuts="Control+K Meta+K"
              className="hidden h-9 w-48 items-center gap-2 rounded-lg border border-lx-border bg-lx-surface px-3 text-sm text-lx-subtle transition hover:border-lx-accent/40 hover:text-lx-fg lg:inline-flex xl:w-44"
            >
              <SearchIcon size={14} />
              <span className="flex-1 text-left">Search…</span>
              <span className="flex items-center gap-0.5" aria-hidden>
                <kbd className="lx-kbd">{mod}</kbd>
                <kbd className="lx-kbd">K</kbd>
              </span>
            </button>
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search"
              aria-keyshortcuts="Control+K Meta+K"
              className="lx-icon-btn lg:hidden"
            >
              <SearchIcon size={17} />
            </button>

            <StreakChip />
            <ThemeToggle />

            <Link
              href="/profile"
              aria-label="Your profile"
              title="Your profile"
              aria-current={isActivePath(pathname, '/profile') ? 'page' : undefined}
              className={`lx-icon-btn hidden md:inline-flex ${
                isActivePath(pathname, '/profile') ? 'bg-lx-accent-glow text-lx-accent' : ''
              }`}
            >
              <UserIcon size={17} />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Learninx on GitHub (opens in a new tab)"
              title="Learninx on GitHub"
              className="lx-icon-btn hidden lg:inline-flex"
            >
              <GithubIcon size={17} />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className={`lx-icon-btn xl:hidden ${menuOpen ? 'bg-lx-accent-glow text-lx-accent' : ''}`}
            >
              {menuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[57px] bg-lx-overlay backdrop-blur-[2px] animate-lx-fade-in"
          />
          <div
            id="site-menu"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-57px)] overflow-y-auto border-b border-lx-border-strong bg-lx-surface-strong shadow-lx-lg animate-lx-pop-in"
          >
            <div className="mx-auto max-w-6xl px-4 py-5">
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                {NAV_GROUPS.map((group) => (
                  <section key={group.label} aria-labelledby={`menu-${group.label}`}>
                    <h2 id={`menu-${group.label}`} className="lx-eyebrow mb-1.5 px-2">
                      {group.label}
                    </h2>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => {
                        const active = isActivePath(pathname, item.href);
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={active ? 'page' : undefined}
                              onClick={() => setMenuOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-2 py-2 transition ${
                                active ? 'bg-lx-accent-glow' : 'hover:bg-lx-surface'
                              }`}
                            >
                              <span
                                aria-hidden
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                  active
                                    ? 'border-lx-accent/40 text-lx-accent'
                                    : 'border-lx-border text-lx-muted'
                                }`}
                              >
                                <Icon size={15} />
                              </span>
                              <span className="min-w-0">
                                <span
                                  className={`block text-sm font-medium ${active ? 'text-lx-accent' : 'text-lx-fg'}`}
                                >
                                  {item.label}
                                </span>
                                <span className="block truncate text-xs text-lx-subtle">
                                  {item.blurb}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-lx-border pt-4">
                <ThemeSwitcher />
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-lx-muted transition hover:text-lx-accent"
                >
                  <GithubIcon size={15} /> GitHub <ExternalLinkIcon size={12} />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function BarLink({
  href,
  pathname,
  className = '',
}: {
  href: string;
  pathname: string;
  className?: string;
}) {
  const item = byHref(href);
  const active = isActivePath(pathname, href);
  return (
    <li className={className}>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`relative block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition xl:px-3 ${
          active ? 'font-medium text-lx-fg' : 'text-lx-muted hover:bg-lx-surface hover:text-lx-fg'
        }`}
      >
        {item.barLabel ?? item.label}
        {active && (
          <span
            aria-hidden
            className="absolute inset-x-2.5 -bottom-[13px] h-0.5 rounded-full bg-lx-accent xl:inset-x-3"
          />
        )}
      </Link>
    </li>
  );
}

/** Current streak, shown once the learner has one. Links to the profile. */
function StreakChip() {
  const { state, ready } = useProgress();
  const days = state.streak.current;
  if (!ready || days <= 0) return null;
  return (
    <Link
      href="/profile"
      title={`${days}-day streak · ${state.streak.points} points`}
      aria-label={`${days}-day streak, ${state.streak.points} points. Open your profile.`}
      className="hidden h-9 items-center gap-1 rounded-lg px-2.5 font-mono text-sm font-semibold text-lx-warning transition hover:bg-lx-warning/10 sm:inline-flex"
    >
      <FireIcon size={15} /> {days}
    </Link>
  );
}
