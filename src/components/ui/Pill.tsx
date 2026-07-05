// Small visual primitives used across the app. Tailwind utility classes are
// kept here so the components read declaratively at the call site.

import * as React from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export function Pill({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'lx-pill-success'
      : tone === 'accent'
        ? 'lx-pill-accent'
        : tone === 'beginner'
          ? 'lx-pill-beginner'
          : tone === 'intermediate'
            ? 'lx-pill-intermediate'
            : tone === 'advanced'
              ? 'lx-pill-advanced'
              : '';
  return <span className={`lx-pill ${toneClass} ${className}`}>{children}</span>;
}

export function difficultyToTone(d: Difficulty) {
  return d;
}

export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span className="font-mono text-slate-300">
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
        aria-label={label}
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
