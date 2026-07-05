'use client';

import { useState } from 'react';
import { CheckCheckIcon, CheckIcon, CopyIcon } from '@/components/ui/Icon';

/**
 * Renders a fenced code block with a small "Copy" button in the top-right
 * corner and a language label. react-markdown passes the inner <code>
 * element as children; we extract its className to read the language tag.
 */
export function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  // react-markdown passes className like "language-bash". Strip the prefix.
  const lang = (className ?? '').match(/language-(\w+)/)?.[1];

  // children is the raw string of code; coerce to plain text.
  const text = extractText(children);

  async function copy(): Promise<void> {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="group relative">
      {lang && (
        <span className="pointer-events-none absolute right-12 top-2 z-10 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-slate-400">
          {lang}
        </span>
      )}
      <button
        onClick={copy}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-1 text-[0.7rem] text-slate-300 opacity-0 transition hover:border-[var(--lx-accent)] hover:text-[var(--lx-accent)] focus:opacity-100 group-hover:opacity-100"
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? (
          <>
            <CheckCheckIcon size={12} /> Copied
          </>
        ) : (
          <>
            <CopyIcon size={12} /> Copy
          </>
        )}
      </button>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return '';
}
