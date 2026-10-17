import { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { ExternalLinkIcon } from './ui/Icon';
import { slugify } from '@/lib/toc';

/**
 * Strip the trailing `#`, `{#id}` style anchors, and inline markdown
 * (backticks, asterisks) from heading text before slugifying.
 */
function cleanHeading(text: string): string {
  return String(text)
    .replace(/\{#[\w-]+\}/g, '') // {#explicit-id}
    .replace(/`/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim();
}

/**
 * `afterHeading` maps an h2's text to something rendered right below it —
 * the lesson page uses it to point each "Try it" section at the practice
 * terminal.
 */
export function Markdown({
  content,
  afterHeading,
}: {
  content: string;
  afterHeading?: Record<string, ReactNode>;
}) {
  return (
    <div className="prose-lx">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1({ children }) {
            // The H1 is the lesson title — the page header already
            // renders it, so hide it inside the body to avoid the
            // duplicate.
            return null;
          },
          h2({ children }) {
            const text = cleanHeading(extractText(children));
            const id = text ? slugify(text) : undefined;
            return (
              <>
                <h2 id={id} className="scroll-mt-24">
                  {children}
                </h2>
                {text && afterHeading?.[text]}
              </>
            );
          },
          h3({ children }) {
            const text = cleanHeading(extractText(children));
            const id = text ? slugify(text) : undefined;
            return (
              <h3 id={id} className="scroll-mt-24">
                {children}
              </h3>
            );
          },
          a({ href, children }) {
            // Links in lesson text are references to read alongside the
            // lesson, so they open in a new tab and the reader keeps their place.
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
                <ExternalLinkIcon size={12} className="ml-1 inline-block align-[-0.1em]" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="lx-table-scroll">
                <table>{children}</table>
              </div>
            );
          },
          pre({ children }) {
            // react-markdown wraps fenced code blocks in <pre><code>...
            // unwrap to get the <code> child (so we can read its className)
            // and forward to our CodeBlock for the copy button. A lone child
            // arrives as the element itself, not a one-item array.
            const code = Array.isArray(children) ? children[0] : children;
            if (isValidElement<{ className?: string; children?: ReactNode }>(code)) {
              return (
                <CodeBlock className={code.props.className}>
                  {code.props.children}
                </CodeBlock>
              );
            }
            return <pre>{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}
