import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-lx">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
