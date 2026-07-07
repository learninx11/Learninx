'use client';

import { useEffect, useRef } from 'react';

/**
 * Client-side video player. Renders the autoplaying, muted, looping MP4 from
 * `public/` and re-invokes `play()` on `canplay` / `visibilitychange` so it
 * works on mobile browsers that pause offscreen tabs.
 */
export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Encode the filename the same way `next build` copies it to `out/`.
  const src = '/Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4';

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
