import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
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

export function Markdown({ content }: { content: string }) {
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
              <h2 id={id} className="scroll-mt-24">
                {children}
              </h2>
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
          pre({ children }) {
            // react-markdown wraps fenced code blocks in <pre><code>...
            // unwrap to get the <code> child (so we can read its className)
            // and forward to our CodeBlock for the copy button.
            if (
              children &&
              Array.isArray(children) &&
              children[0] &&
              typeof children[0] === 'object' &&
              'props' in children[0]
            ) {
              const child = children[0] as React.ReactElement<{
                className?: string;
                children?: React.ReactNode;
              }>;
              return (
                <CodeBlock className={child.props.className}>
                  {child.props.children}
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
