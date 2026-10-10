import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { ShortcutsButton } from '@/components/ShortcutsDialog';
import { GithubIcon } from '@/components/ui/Icon';
import { GITHUB_URL, NAV_GROUPS } from '@/lib/site-nav';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-lx-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <Brand />
          <p className="max-w-xs text-sm leading-relaxed text-lx-muted">
            Learn the command line and the DevOps toolchain in a safe, in-browser
            sandbox. No signup and no tracking — your progress stays on this device.
          </p>
          <ShortcutsButton />
        </div>
        {NAV_GROUPS.map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <h2 className="lx-eyebrow mb-3">{group.label}</h2>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-lx-muted transition hover:text-lx-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-lx-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-lx-subtle">
          <span>Open source · free forever · built for learning DevOps</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-lx-accent"
          >
            <GithubIcon size={13} /> Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
