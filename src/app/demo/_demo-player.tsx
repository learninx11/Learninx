'use client';

import { useEffect, useRef } from 'react';

const MP4_FILENAME = 'Learninx — Learn Linux the Easy Way.mp4';
// Filename with spaces, em-dash, and other characters that need to be
// percent-encoded for use in a URL.
const MP4_HREF = 'Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4';

// The static export sets `basePath: '/Learninx'` for the GitHub Pages build,
// so the deployed MP4 lives at `https://learninx11.github.io/Learninx/<file>`.
// In Docker / local dev the file is served at the root, so the path is just
// `/<file>`. The two `next.config.js` branches keep these in lock-step.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Build the URL of the demo MP4.
 *
 * The static export and the browser resolve `<video src>` independently of
 * Next's `basePath` setting — Next rewrites `<Link href>` but not raw `src`
 * strings. So we have to assemble the URL ourselves.
 *
 *   - On the server (SSR / SSG): return the path with the basePath prefix
 *     embedded. The exported HTML is served from the same origin as the
 *     MP4, so a root-relative `/<basePath>/<file>` URL is correct.
 *   - On the client: same logic; a root-relative URL always resolves
 *     against the origin root, so it is correct in every environment.
 */
function buildSrc(): string {
  return `${BASE_PATH}/${MP4_HREF}`;
}

/**
 * Client-side video player. Renders the autoplaying, muted, looping MP4 from
 * `public/` and re-invokes `play()` on `canplay` / `visibilitychange` so it
 * works on mobile browsers that pause offscreen tabs.
 */
export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const src = buildSrc();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      v.play().catch(() => {
        /* user gesture may be required; controls are visible */
      });
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
  }, []);

  return (
    <div className="lx-card overflow-hidden p-0">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls
        controlsList="nodownload noplaybackrate"
        className="block w-full bg-black"
        style={{ aspectRatio: '16 / 9' }}
      >
        Your browser does not support embedded video. You can{' '}
        <a href={src}>download the demo MP4</a> instead.
      </video>
    </div>
  );
}
