'use client';

import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/Icon';
import { useTheme, type ThemePreference } from '@/lib/theme';

/**
 * Header button that flips between light and dark. Both icons are
 * rendered and CSS picks one, so the button is right on first paint
 * whichever theme the pre-paint script chose.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, setPreference } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className={`lx-icon-btn ${className}`}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <SunIcon size={17} className="block [.light_&]:hidden" />
      <MoonIcon size={17} className="hidden [.light_&]:block" />
    </button>
  );
}

const OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: 'system', label: 'System', icon: MonitorIcon },
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
];

/** Three-way System / Light / Dark control for the site menu. */
export function ThemeSwitcher() {
  const { preference, mounted, setPreference } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-lg border border-lx-border bg-lx-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = mounted && preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setPreference(value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              checked
                ? 'bg-lx-surface-strong text-lx-fg shadow-lx-sm ring-1 ring-lx-border-strong'
                : 'text-lx-muted hover:text-lx-fg'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        );
      })}
    </div>
  );
}
