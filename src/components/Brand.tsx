import Link from 'next/link';

/** The `~$ learninx` wordmark, linking home. */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Learninx home"
      className={`group inline-flex shrink-0 items-center gap-2 rounded-md text-lg font-semibold tracking-tight ${className}`}
    >
      <span
        aria-hidden
        className="font-mono text-lx-accent transition-transform group-hover:translate-x-0.5"
      >
        ~$
      </span>
      <span aria-hidden>
        learn<span className="text-lx-accent">inx</span>
      </span>
    </Link>
  );
}
