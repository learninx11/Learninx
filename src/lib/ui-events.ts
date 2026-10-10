/**
 * Window-level events that let unrelated client components talk without
 * prop drilling: the header's search button opens the palette, the
 * palette opens the shortcuts sheet, the global key handler focuses a
 * lesson's sandbox, and so on.
 */

export const OPEN_PALETTE_EVENT = 'lx:open-palette';
export const OPEN_SHORTCUTS_EVENT = 'lx:open-shortcuts';

export function openCommandPalette(): void {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

export function openShortcuts(): void {
  window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT));
}

/**
 * Bring the page's sandbox (marked `data-lx-sandbox`) into view and put the
 * cursor in its terminal. Returns false when the page has no sandbox.
 */
export function focusSandbox(): boolean {
  const sandbox = document.querySelector<HTMLElement>('[data-lx-sandbox]');
  if (!sandbox) return false;
  const rect = sandbox.getBoundingClientRect();
  if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sandbox.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }
  sandbox.querySelector<HTMLElement>('.xterm-helper-textarea')?.focus({ preventScroll: true });
  return true;
}

/** True when a keystroke is headed into a text field and must not trigger a shortcut. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * The page's own search box, if it has one. Pages mark their search input
 * with `data-lx-page-search`; `/` focuses it instead of opening the
 * site-wide command palette.
 */
export function pageSearchInput(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('[data-lx-page-search]');
}

/** True while a modal dialog (palette, shortcuts sheet, …) is open. */
export function isModalOpen(): boolean {
  return document.querySelector('[aria-modal="true"]') !== null;
}
