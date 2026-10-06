'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ShareIcon } from '@/components/ui/Icon';
import {
  EXPLAIN_EXAMPLES,
  explainCommand,
  isSegment,
  type ExplainedToken,
  type TokenKind,
} from '@/lib/explain';

const KIND_COLOR: Record<TokenKind, string> = {
  command: 'var(--lx-accent)',
  subcommand: 'var(--lx-accent)',
  flag: 'var(--lx-accent-2)',
  value: 'var(--lx-warning)',
  argument: 'var(--lx-fg)',
  operator: 'var(--lx-danger)',
  redirect: 'var(--lx-danger)',
  assignment: 'var(--lx-difficulty-expert)',
};

const KIND_LABEL: Record<TokenKind, string> = {
  command: 'command',
  subcommand: 'subcommand',
  flag: 'option',
  value: 'value',
  argument: 'argument',
  operator: 'operator',
  redirect: 'redirect',
  assignment: 'variable',
};

/** Same anchor scheme as the cheatsheet cards. */
function cheatAnchor(cmd: string): string {
  return `/cheatsheet#cmd-${cmd.replace(/[^a-z0-9]+/gi, '-')}`;
}

export function ExplainClient() {
  const [input, setInput] = useState(EXPLAIN_EXAMPLES[1]!);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // `/explain?cmd=...` pre-fills the box so explanations can be shared.
  // Read on mount rather than with useSearchParams so the static export
  // doesn't need a Suspense boundary.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('cmd');
    if (q) setInput(q);
  }, []);

  const explanation = useMemo(() => explainCommand(input), [input]);
  const hasContent = explanation.parts.length > 0;

  function share() {
    const url = `${window.location.origin}${window.location.pathname}?cmd=${encodeURIComponent(input.trim())}`;
    window.history.replaceState(null, '', url);
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  }

  return (
    <div className="space-y-8">
      <section className="lx-card space-y-4 p-5 sm:p-6">
        <label htmlFor="explain-input" className="text-sm font-semibold">
          Command
        </label>
        <div className="flex items-start gap-2 font-mono">
          <span aria-hidden className="pt-2 text-[var(--lx-accent)]">
            $
          </span>
          <textarea
            id="explain-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="lx-input min-h-[3rem] flex-1 resize-y font-mono"
            placeholder="ps aux | grep nginx"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[var(--lx-muted)]">Try</span>
          {EXPLAIN_EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setInput(ex);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-[var(--lx-border)] px-3 py-1 font-mono text-xs text-[var(--lx-muted)] transition hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {!hasContent ? (
        <div className="lx-card p-10 text-center text-sm text-[var(--lx-muted)]">
          Type or paste a command above to see it explained.
        </div>
      ) : (
        <>
          <section aria-label="Highlighted command" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Breakdown</h2>
              <button type="button" onClick={share} className="lx-btn lx-btn-sm lx-btn-secondary">
                {copied ? <CheckIcon size={12} /> : <ShareIcon size={12} />}
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-4 py-3 font-mono text-sm">
              <span className="text-[var(--lx-muted)]">$ </span>
              {explanation.parts
                .flatMap((p) => (isSegment(p) ? p.tokens : [p]))
                .map((t, i) => (
                  <span key={i} style={{ color: KIND_COLOR[t.kind] }}>
                    {i > 0 ? ' ' : ''}
                    {t.text}
                  </span>
                ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--lx-muted)]">
              {(['command', 'flag', 'value', 'argument', 'operator'] as TokenKind[]).map((k) => (
                <li key={k} className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} />
                  {KIND_LABEL[k]}
                </li>
              ))}
            </ul>
          </section>

          <ol className="space-y-3">
            {explanation.parts.map((part, i) =>
              isSegment(part) ? (
                <li key={i} className="lx-card space-y-3 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <code className="font-mono text-lg font-semibold text-[var(--lx-accent)]">
                      {part.command || 'environment'}
                    </code>
                    {part.entry && (
                      <Link
                        href={cheatAnchor(part.entry.cmd)}
                        className="text-xs text-[var(--lx-accent)] hover:underline"
                      >
                        Cheatsheet entry →
                      </Link>
                    )}
                  </div>
                  {part.entry && (
                    <p className="text-sm text-[var(--lx-prose-body)]">
                      <InlineCode text={part.entry.long} />
                    </p>
                  )}
                  {!part.entry && part.command && (
                    <p className="text-sm text-[var(--lx-muted)]">
                      This command isn&apos;t in the Learninx cheatsheet yet, so only its
                      options and operators are described.
                    </p>
                  )}
                  <TokenTable tokens={part.tokens.filter((t) => t.kind !== 'command')} />
                </li>
              ) : (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-dashed border-[var(--lx-border)] px-5 py-3 text-sm"
                >
                  <code className="font-mono font-semibold" style={{ color: KIND_COLOR.operator }}>
                    {part.text}
                  </code>
                  <span className="text-[var(--lx-muted)]">{part.note}</span>
                </li>
              ),
            )}
          </ol>
        </>
      )}
    </div>
  );
}

/** Render `backticked` spans from cheatsheet prose as inline code. */
function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-[var(--lx-code-bg)] px-1 py-0.5 font-mono text-[0.85em] text-[var(--lx-fg)]"
          >
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function TokenTable({ tokens }: { tokens: ExplainedToken[] }) {
  if (tokens.length === 0) return null;
  return (
    <dl className="divide-y divide-[var(--lx-border)] rounded-md border border-[var(--lx-border)] text-sm">
      {tokens.map((t, i) => (
        <div key={i} className="grid gap-1 px-3 py-2 sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-4">
          <dt className="flex items-baseline gap-2">
            <code className="break-all font-mono" style={{ color: KIND_COLOR[t.kind] }}>
              {t.text}
            </code>
            <span className="text-[10px] uppercase tracking-wider text-[var(--lx-muted)]">
              {KIND_LABEL[t.kind]}
            </span>
          </dt>
          <dd className="text-[var(--lx-muted)]">
            <InlineCode text={t.note || (t.kind === 'argument' ? 'Argument passed to the command.' : '')} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
