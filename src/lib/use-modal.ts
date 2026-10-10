'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared behaviour for anything that floats over the page: Escape closes
 * it, Tab cycles focus inside `panelRef` instead of escaping to the page
 * behind, the page stops scrolling underneath, and focus returns to
 * whatever opened it.
 */
export function useModal(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement>,
  { lockScroll = true, trapFocus = true }: { lockScroll?: boolean; trapFocus?: boolean } = {},
): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panelAtOpen = panelRef.current;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    if (lockScroll) {
      // Reserve the scrollbar's width so the page doesn't jump sideways.
      // (Bounded: on a zoomed mobile viewport the difference isn't a
      // scrollbar at all.)
      const scrollbar = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      if (scrollbar > 0 && scrollbar < 40) document.body.style.paddingRight = `${scrollbar}px`;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== 'Tab' || !trapFocus || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    // Capture phase, so Escape closes the dialog before any page-level
    // Escape handler (fullscreen terminal, zen mode) also reacts to it.
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (lockScroll) {
        html.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPadding;
      }
      // Hand focus back to the opener — unless something else (say, a
      // second dialog this one opened) has already taken it.
      const active = document.activeElement;
      const focusIsLost = !active || active === document.body || !!panelAtOpen?.contains(active);
      if (opener && opener.isConnected && focusIsLost) opener.focus({ preventScroll: true });
    };
  }, [open, panelRef, lockScroll, trapFocus]);
}
