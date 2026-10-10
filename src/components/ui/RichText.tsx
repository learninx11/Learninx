import { Fragment } from 'react';

/**
 * Renders the `backticked` spans of a plain string as inline code. Lesson
 * descriptions, tips, challenges, and cheatsheet prose are all written
 * that way, and printing them raw leaves stray backticks on screen.
 */
export function RichText({ text, codeClassName }: { text: string; codeClassName?: string }) {
  const parts = text.split('`');
  // An odd number of backticks means an unclosed span — show it verbatim.
  if (parts.length < 3 || parts.length % 2 === 0) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className={
              codeClassName ??
              'rounded border border-lx-border bg-lx-code-bg px-1 py-px font-mono text-[0.88em] text-lx-prose-strong'
            }
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** The same text with its backticks dropped, for places that can't hold markup (titles, attributes). */
export function plainText(text: string): string {
  return text.replace(/`/g, '');
}
