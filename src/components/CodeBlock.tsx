'use client';

import { useState } from 'react';
import { CheckCheckIcon, CopyIcon } from '@/components/ui/Icon';

/**
 * Renders a fenced code block under a slim toolbar with the language label
 * and a "Copy" button, so neither ever covers the code. react-markdown
 * passes the inner <code> element as children; we extract its className to
 * read the language tag.
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
    <div className="lx-codeblock">
      <div className="flex items-center gap-2 border-b border-lx-border px-3 py-1">
        {lang && (
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-lx-subtle">
            {lang}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          className={`-mr-1.5 ml-auto inline-flex items-center gap-1 rounded px-1.5 py-1 text-[0.7rem] transition hover:text-lx-accent ${
            copied ? 'text-lx-success' : 'text-lx-muted'
          }`}
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
