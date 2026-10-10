'use client';

import { useState } from 'react';
import { CheckCheckIcon, CopyIcon } from '@/components/ui/Icon';

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
      await navigator.clipboard.writeText(text.replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
        {lang && (
          <span className="pointer-events-none rounded border border-lx-border bg-lx-surface-strong px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-lx-subtle">
            {lang}
          </span>
        )}
        {/* Hover-only on devices that can hover; always visible on touch screens. */}
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded border border-lx-border bg-lx-surface-strong px-1.5 py-1 text-[0.7rem] text-lx-muted transition hover:border-lx-accent hover:text-lx-accent focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0"
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
      </div>
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
