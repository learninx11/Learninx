'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { CloseIcon, KeyboardIcon } from '@/components/ui/Icon';
import { NAV_GROUPS } from '@/lib/site-nav';
import { OPEN_SHORTCUTS_EVENT, openShortcuts } from '@/lib/ui-events';
import { useModal } from '@/lib/use-modal';
import { useModKey } from '@/lib/use-mod-key';

interface Row {
  keys: string[][];
  label: string;
}

/** Keyboard reference sheet, opened with `?`, from the palette, or from the footer. */
export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const mod = useModKey();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
  }, []);

  useModal(open, () => setOpen(false), panelRef);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const sections: { title: string; hint?: string; rows: Row[] }[] = [
    {
      title: 'Anywhere',
      rows: [
        { keys: [[mod, 'K']], label: 'Open the command palette' },
        { keys: [['/']], label: 'Search this page, or open the palette' },
        { keys: [['?']], label: 'Show this list' },
        { keys: [['Esc']], label: 'Close a dialog or menu' },
      ],
    },
    {
      title: 'Jump to a page',
      hint: 'Press g, then the letter.',
      rows: [
        { keys: [['g', 'h']], label: 'Home' },
        ...NAV_GROUPS.flatMap((g) => g.items).map((item) => ({
          keys: [['g', item.shortcut]],
          label: item.label,
        })),
      ],
    },
    {
      title: 'On a lesson',
      rows: [
        { keys: [['['], [']']], label: 'Previous / next lesson' },
        { keys: [['t']], label: 'Put the cursor in the sandbox' },
      ],
    },
    {
      title: 'In the sandbox',
      rows: [
        { keys: [['Tab']], label: 'Complete a command or path' },
        { keys: [['↑'], ['↓']], label: 'Walk through history' },
        { keys: [['→']], label: 'Accept the dimmed suggestion' },
        { keys: [['Ctrl', 'L']], label: 'Clear the screen' },
        { keys: [['Ctrl', 'C']], label: 'Abandon the current line' },
        { keys: [['Ctrl', 'Shift', 'V']], label: 'Paste' },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-[110] overflow-y-auto px-3 py-[6vh] sm:px-4"
    >
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-lx-overlay backdrop-blur-sm animate-lx-fade-in"
      />
      <div ref={panelRef} className="lx-popover relative mx-auto w-full max-w-3xl p-5 animate-lx-pop-in sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="shortcuts-title" className="flex items-center gap-2 text-lg font-semibold">
            <KeyboardIcon size={18} className="text-lx-accent" /> Keyboard shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="lx-icon-btn"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="lx-eyebrow">{section.title}</h3>
              {section.hint && <p className="mt-1 text-xs text-lx-subtle">{section.hint}</p>}
              <dl className="mt-2 divide-y divide-lx-border">
                {section.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-1.5 text-sm">
                    <dt className="text-lx-prose-body">{row.label}</dt>
                    <dd className="flex shrink-0 items-center gap-1.5">
                      {row.keys.map((combo, i) => (
                        <Fragment key={i}>
                          {i > 0 && <span className="text-xs text-lx-subtle">/</span>}
                          <KeyCombo keys={combo} />
                        </Fragment>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((k) => (
        <kbd key={k} className="lx-kbd">
          {k}
        </kbd>
      ))}
    </span>
  );
}

/** Footer link that opens the shortcuts sheet. */
export function ShortcutsButton() {
  return (
    <button
      type="button"
      onClick={openShortcuts}
      className="inline-flex items-center gap-2 text-xs text-lx-subtle transition hover:text-lx-accent"
    >
      <KeyboardIcon size={14} /> Keyboard shortcuts <kbd className="lx-kbd">?</kbd>
    </button>
  );
}
