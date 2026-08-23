'use client';

import { useEffect, useState } from 'react';
import { ShareIcon, CheckIcon, CopyIcon } from '@/components/ui/Icon';

interface Props {
  /** Absolute path of the page to share (e.g. `/lessons/intro`). */
  path: string;
  /** Optional title used by the Web Share API when available. */
  title?: string;
  /** Optional className for layout placement. */
  className?: string;
}

type ShareState = 'idle' | 'copied' | 'shared' | 'unsupported';

/**
 * Copy / system-share button. Uses the Web Share API when available
 * (mobile, modern desktop browsers) and falls back to copying the
 * full URL to the clipboard. Shows a brief confirmation badge so the
 * user knows the action succeeded.
 *
 * The button is rendered as `idle` on the server and during the
 * first client paint to avoid hydration mismatches; state updates
 * after mount via `useEffect`.
 */
export function ShareButton({ path, title, className }: Props) {
  const [state, setState] = useState<ShareState>('idle');
  const [url, setUrl] = useState<string>('');

  // Resolve the absolute URL on the client. Doing it lazily means
  // server-rendered HTML and the static export don't need to know
  // the deployment hostname.
  useEffect(() => {
    setUrl(new URL(path, window.location.origin).toString());
  }, [path]);

  // Auto-reset the "copied/shared" badge after a short delay so it
  // reverts to the default label without user interaction.
  useEffect(() => {
    if (state === 'idle' || state === 'unsupported') return;
    const t = window.setTimeout(() => setState('idle'), 1800);
    return () => window.clearTimeout(t);
  }, [state]);

  async function handleShare() {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: title ?? document.title,
      text: title ?? document.title,
      url: url || path,
    };

    // Prefer the native share sheet when the browser exposes it.
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        setState('shared');
        return;
      } catch {
        // User dismissed the share sheet — fall through to copy.
      }
    }

    // Fallback: copy to clipboard. Use the modern async API when
    // available, otherwise fall back to a hidden textarea so the
    // button still works on http:// and older browsers.
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareData.url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('copied');
    } catch {
      setState('unsupported');
    }
  }

  const label =
    state === 'copied'
      ? 'Link copied'
      : state === 'shared'
        ? 'Shared'
        : state === 'unsupported'
          ? 'Copy failed'
          : 'Share';

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        'lx-btn lx-btn-secondary lx-btn-sm'
      }
      title="Copy a shareable link to this lesson"
      aria-live="polite"
    >
      {state === 'copied' ? (
        <>
          <CheckIcon size={14} /> Link copied
        </>
      ) : state === 'shared' ? (
        <>
          <CheckIcon size={14} /> Shared
        </>
      ) : state === 'unsupported' ? (
        <>
          <CopyIcon size={14} /> Copy failed
        </>
      ) : (
        <>
          <ShareIcon size={14} /> Share
        </>
      )}
    </button>
  );
}
