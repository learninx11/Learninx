'use client';

import { useEffect, useState } from 'react';
import { SearchIcon } from '@/components/ui/Icon';
import { openCommandPalette } from '@/lib/ui-events';

export function NotFoundSearch() {
  return (
    <button type="button" onClick={openCommandPalette} className="lx-btn lx-btn-primary">
      <SearchIcon size={14} /> Search Learninx
    </button>
  );
}

/**
 * A tiny shell transcript of the failed lookup. The 404 page is rendered
 * once at build time, so the real path is read after mount.
 */
export function NotFoundTranscript() {
  const [path, setPath] = useState('this-page');
  useEffect(() => {
    let current = window.location.pathname;
    try {
      current = decodeURIComponent(current);
    } catch {
      /* malformed escape — show it raw */
    }
    setPath(current);
  }, []);
  return (
    <pre
      aria-hidden
      className="mt-10 inline-block max-w-full overflow-x-auto rounded-lg border border-lx-border bg-lx-code-bg px-4 py-3 text-left font-mono text-xs text-lx-muted"
    >
      <span className="text-lx-accent">learner@learninx</span>:<span className="text-lx-accent-2">~</span>$ cd{' '}
      {path}
      {'\n'}bash: cd: {path}: No such file or directory
    </pre>
  );
}
