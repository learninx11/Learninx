import {
  AwardIcon,
  BookIcon,
  BrainIcon,
  CodeIcon,
  KeyboardIcon,
  ListIcon,
  TargetIcon,
  TerminalIcon,
  UserIcon,
} from '@/components/ui/Icon';

/**
 * Every top-level page, grouped the way the header menu, the footer, and
 * the command palette present them — one list so they never drift apart.
 */

export interface SiteNavItem {
  href: string;
  label: string;
  /** Shorter label for the header bar, where space is tight. */
  barLabel?: string;
  blurb: string;
  icon: typeof BookIcon;
  /** Second key of the `g <key>` jump shortcut. */
  shortcut: string;
}

export interface SiteNavGroup {
  label: string;
  items: SiteNavItem[];
}

export const NAV_GROUPS: SiteNavGroup[] = [
  {
    label: 'Learn',
    items: [
      { href: '/lessons', label: 'Lessons', blurb: 'Nine tracks, Linux to Kubernetes', icon: BookIcon, shortcut: 'l' },
      { href: '/boss', label: 'Boss levels', blurb: 'Multi-step scenarios', icon: TargetIcon, shortcut: 'b' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { href: '/terminal', label: 'Terminal', blurb: 'A free-practice sandbox', icon: TerminalIcon, shortcut: 's' },
      { href: '/flashcards', label: 'Flashcards', blurb: 'Spaced-repetition review', icon: BrainIcon, shortcut: 'f' },
      { href: '/typing', label: 'Typing test', barLabel: 'Typing', blurb: 'Real commands, against the clock', icon: KeyboardIcon, shortcut: 't' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { href: '/cheatsheet', label: 'Cheatsheet', blurb: 'Every sandbox command', icon: ListIcon, shortcut: 'c' },
      { href: '/explain', label: 'Explain a command', barLabel: 'Explain', blurb: 'Break down any one-liner', icon: CodeIcon, shortcut: 'e' },
    ],
  },
  {
    label: 'You',
    items: [
      { href: '/profile', label: 'Profile', blurb: 'Stats, backup, and restore', icon: UserIcon, shortcut: 'p' },
      { href: '/achievements', label: 'Achievements', blurb: 'Badges you have earned', icon: AwardIcon, shortcut: 'a' },
    ],
  },
];

export const GITHUB_URL = 'https://github.com/learninx11/Learninx';

/** True when `pathname` is `href` or a page nested under it. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Pages that sit a sandbox next to their content get a wider container
 * so the reading column isn't squeezed: a lesson, a boss level, and the
 * free-practice terminal.
 */
export function isWideRoute(pathname: string): boolean {
  return (
    /^\/lessons\/(?!track\/)[^/]+\/?$/.test(pathname) ||
    /^\/boss\/[^/]+\/?$/.test(pathname) ||
    pathname === '/terminal'
  );
}
