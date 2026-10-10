'use client';

import { useEffect, useMemo, useRef } from 'react';
import { addDays, utcDayKey } from '@/lib/progress-client';

const WEEKS = 53;
const CELL = 11;
const GAP = 3;
const LEFT = 26;
const TOP = 16;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Opacity steps for 0, 1, 2-3, 4-6, and 7+ actions in a day. */
function level(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n <= 3) return 2;
  if (n <= 6) return 3;
  return 4;
}
const FILL = ['var(--lx-border)', '0.35', '0.55', '0.78', '1'];

/**
 * GitHub-style calendar of the last year of learning activity. Each
 * square is one UTC day; columns are weeks starting on Sunday.
 */
export function ActivityHeatmap({
  activity,
  today = utcDayKey(),
}: {
  activity: Record<string, number>;
  today?: string;
}) {
  const { cells, months, total, activeDays, longest } = useMemo(() => {
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
    const start = addDays(today, -((WEEKS - 1) * 7 + weekday));
    const cells: { day: string; n: number; x: number; y: number }[] = [];
    const months: { label: string; x: number }[] = [];
    let total = 0;
    let activeDays = 0;
    let run = 0;
    let longest = 0;
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w += 1) {
      for (let d = 0; d < 7; d += 1) {
        const day = addDays(start, w * 7 + d);
        if (day > today) continue;
        const n = activity[day] ?? 0;
        total += n;
        if (n > 0) {
          activeDays += 1;
          run += 1;
          longest = Math.max(longest, run);
        } else {
          run = 0;
        }
        const x = LEFT + w * (CELL + GAP);
        cells.push({ day, n, x, y: TOP + d * (CELL + GAP) });
        const month = Number(day.slice(5, 7)) - 1;
        if (d === 0 && month !== lastMonth) {
          // Skip a label squeezed into the first column.
          if (w > 0 || Number(day.slice(8, 10)) <= 7) months.push({ label: MONTHS[month]!, x });
          lastMonth = month;
        }
      }
    }
    return { cells, months, total, activeDays, longest };
  }, [activity, today]);

  const width = LEFT + WEEKS * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // On a narrow screen the calendar scrolls sideways; start at the most
  // recent weeks rather than a year ago.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div className="space-y-3">
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-[var(--lx-muted)]">Actions this year</dt>
          <dd className="font-semibold">{total}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[var(--lx-muted)]">Active days</dt>
          <dd className="font-semibold">{activeDays}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[var(--lx-muted)]">Longest run</dt>
          <dd className="font-semibold">
            {longest} day{longest === 1 ? '' : 's'}
          </dd>
        </div>
      </dl>
      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Learning activity over the last year: ${total} actions on ${activeDays} days.`}
          className="block"
        >
          {months.map((m) => (
            <text key={`${m.label}-${m.x}`} x={m.x} y={10} fontSize={10} fill="var(--lx-muted)">
              {m.label}
            </text>
          ))}
          {['Mon', 'Wed', 'Fri'].map((label, i) => (
            <text
              key={label}
              x={0}
              y={TOP + (i * 2 + 1) * (CELL + GAP) + CELL - 2}
              fontSize={9}
              fill="var(--lx-muted)"
            >
              {label}
            </text>
          ))}
          {cells.map((c) => {
            const lv = level(c.n);
            return (
              <rect
                key={c.day}
                x={c.x}
                y={c.y}
                width={CELL}
                height={CELL}
                rx={2}
                fill={lv === 0 ? FILL[0] : 'var(--lx-accent)'}
                fillOpacity={lv === 0 ? 0.6 : Number(FILL[lv])}
                stroke={c.day === today ? 'var(--lx-fg)' : 'none'}
                strokeWidth={c.day === today ? 1 : 0}
              >
                <title>
                  {c.n === 0 ? 'No activity' : `${c.n} action${c.n === 1 ? '' : 's'}`} on {c.day}
                </title>
              </rect>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--lx-muted)]" aria-hidden>
        Less
        {[0, 1, 2, 3, 4].map((lv) => (
          <span
            key={lv}
            className="inline-block h-[10px] w-[10px] rounded-sm"
            style={{
              background: lv === 0 ? FILL[0] : 'var(--lx-accent)',
              opacity: lv === 0 ? 0.6 : Number(FILL[lv]),
            }}
          />
        ))}
        More
      </div>
    </div>
  );
}
