// Small visual primitives used across the app. Tailwind utility classes are
// kept here so the components read declaratively at the call site.

import * as React from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PillTone = 'default' | 'accent' | 'success' | 'warning' | Difficulty;

const TONE_CLASS: Record<PillTone, string> = {
  default: '',
  accent: 'lx-pill-accent',
  success: 'lx-pill-success',
  warning: 'lx-pill-warning',
  beginner: 'lx-pill-beginner',
  intermediate: 'lx-pill-intermediate',
  advanced: 'lx-pill-advanced',
  expert: 'lx-pill-expert',
};

export function Pill({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return <span className={`lx-pill ${TONE_CLASS[tone]} ${className}`}>{children}</span>;
}

export function difficultyToTone(d: Difficulty) {
  return d;
}

export function ProgressBar({
  value,
  max,
  label,
  showLabel = true,
  className,
}: {
  value: number;
  max: number;
  label?: string;
  /** False keeps `label` for screen readers only, when the count is already shown nearby. */
  showLabel?: boolean;
  className?: string;
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className ? `space-y-1.5 ${className}` : 'space-y-1.5'}>
      {label && showLabel && (
        <div className="flex justify-between text-xs text-lx-muted">
          <span>{label}</span>
          <span className="font-mono tabular-nums text-lx-fg">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        className="lx-progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Progress'}
      >
        <div className="lx-progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Card({
  children,
  className = '',
  as: As = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <As className={`lx-card ${className}`}>{children}</As>;
}
