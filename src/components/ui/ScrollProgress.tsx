'use client';

import { useEffect, useRef } from 'react';

/** Thin reading-position bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const ratio = max <= 0 ? 0 : Math.min(1, h.scrollTop / max);
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return <div ref={barRef} className="lx-scroll-progress" style={{ transform: 'scaleX(0)' }} aria-hidden />;
}
