'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { createInitialFs, type FsDir } from '@/lib/shell/fs';
import { runCommand, type ShellContext } from '@/lib/shell/evaluator';
import { CopyIcon, HelpIcon, PlayIcon } from '@/components/ui/Icon';

const HOST = 'learninx';
const USER = 'learner';
const HOME = '/home/learner';

interface Suggestion {
  command: string;
  expected: string;
}

const HELP_TEXT = [
  'Available commands:',
  '  pwd, ls [-la], cd <dir>, cat <file>, echo <text>, clear, help, exit',
  '  mkdir [-p] <dir>, touch <file>, rm [-r] <path>, mv <src> <dst>, cp <src> <dst>',
  '  chmod <mode> <file>, ps [aux], whoami, date, uname, history',
  '',
  'Keyboard shortcuts:',
  '  \u2191 / \u2193    cycle through command history',
  '  Tab      autocomplete command name (basic)',
  '  Ctrl+L   clear the screen',
  '  Ctrl+C   abandon the current line',
  '  Ctrl+U   erase the current line',
  '  Ctrl+A   jump to start of line',
  '  Ctrl+E   jump to end of line',
  '  Ctrl+W   delete previous word',
  '  Ctrl+Shift+V  paste from clipboard',
].join('\r\n');

export function Terminal({
  suggestion,
  className = '',
  onRunExpected,
}: {
  /** A command the user should be encouraged to try (shown as a hint). */
  suggestion?: Suggestion;
  className?: string;
  onRunExpected?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const bufferRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const histIndexRef = useRef<number>(0);
  const ctxRef = useRef<ShellContext | null>(null);
  const completedRef = useRef(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Track disposal so async callbacks (rAF, ResizeObserver) can no-op
    // after the terminal has been torn down — otherwise Fast Refresh
    // (which remounts the component) triggers "Cannot read properties of
    // undefined (reading 'dimensions')" inside the xterm Viewport.
    let disposed = false;

    const fs: FsDir = createInitialFs();
    const ctx: ShellContext = {
      cwd: HOME,
      fs,
      user: USER,
      host: HOST,
      history: [],
      env: { PATH: '/usr/bin:/bin', HOME, USER, SHELL: '/bin/bash' },
    };
    ctxRef.current = ctx;

    const term = new XTerm({
      fontFamily: '"JetBrains Mono", Menlo, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.25,
      theme: {
        background: '#0b0f12',
        foreground: '#d6deeb',
        cursor: '#7fdbca',
        cursorAccent: '#0b0f12',
        selectionBackground: 'rgba(127, 219, 202, 0.25)',
        black: '#1e293b',
        red: '#f87171',
        green: '#7fdbca',
        yellow: '#fbbf24',
        blue: '#82aaff',
        magenta: '#c4b5fd',
        cyan: '#67e8f9',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#a7f3d0',
        brightYellow: '#fde68a',
        brightBlue: '#a5b4fc',
        brightMagenta: '#ddd6fe',
        brightCyan: '#a5f3fc',
        brightWhite: '#f8fafc',
      },
      cursorBlink: true,
      convertEol: true,
      allowProposedApi: true,
      scrollback: 2000,
      screenReaderMode: false,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);

    /**
     * xterm 5.3.0 has a known race: the Viewport's constructor schedules
     * a `setTimeout(..., 0)` that calls `syncScrollArea → _refresh → raf
     * (_innerRefresh)`. The first call to `_innerRefresh` reads
     * `this._renderer.value.dimensions`, but `_renderer.value` is only
     * populated by the RenderService's first frame paint — which can
     * run *after* the Viewport's setTimeout fires when `term.open()` is
     * called on a freshly-mounted container.
     *
     * Two-pronged fix:
     *   1. Defer `term.open()` until the container has a real layout
     *      size (skip if it's still 0x0 during the first paint).
     *   2. After `term.open()` returns, override `term.viewport._innerRefresh`
     *      on the instance to be a no-op when `_renderer.value` is
     *      undefined. The first successful `fit.fit()` restores the
     *      original method.
     */
    let opened = false;
    let viewportOriginal: ((start: number, end: number) => void) | null = null;

    const openAndStart = () => {
      if (disposed || opened) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width < 16 || rect.height < 16) return;
      opened = true;
      try {
        term.open(containerRef.current!);
      } catch {
        /* container was unmounted between the size check and open() */
        opened = false;
        return;
      }
      // Patch the Viewport's `_innerRefresh` instance method so the
      // first (or any) refresh is a no-op while the renderer isn't
      // ready. We restore the original method on the first successful
      // `fit.fit()` — see safeFit().
      try {
        const viewport = (term as unknown as {
          viewport?: {
            _innerRefresh?: (start: number, end: number) => void;
            _renderer?: { value?: { dimensions?: { css?: { cell?: { width?: number } } } } };
          };
        }).viewport;
        const original = viewport?._innerRefresh;
        if (typeof original === 'function') {
          viewportOriginal = original;
          viewport!._innerRefresh = function patched(
            this: { _renderer?: { value?: { dimensions?: { css?: { cell?: { width?: number } } } } } },
            start: number,
            end: number,
          ) {
            if (!this._renderer?.value?.dimensions?.css?.cell?.width) {
              // Renderer isn't ready yet — drop this refresh. The next
              // fit.fit() will trigger another refresh once everything
              // is wired up.
              return;
            }
            return original.call(this, start, end);
          };
        }
      } catch {
        /* if we can't patch, the renderer-ready guard in safeFit still
           prevents fit() from being called too early. */
      }
      xtermRef.current = term;
      fitRef.current = fit;
      // Defer the first fit/focus to the next frame so the canvas
      // has a chance to lay out.
      requestAnimationFrame(() => {
        if (disposed) return;
        safeFit();
        try {
          term.focus();
        } catch {
          /* ignore */
        }
      });
    };

    const ro = new ResizeObserver(() => {
      if (!opened) openAndStart();
      else safeFit();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    // Fallback in case the container is already sized on first paint
    // and the ResizeObserver doesn't fire.
    const raf = requestAnimationFrame(openAndStart);
    const initialFit = window.setTimeout(openAndStart, 50);

    /** Safe `fit.fit()` that bails out if the terminal was disposed. */
    const safeFit = () => {
      if (disposed) return;
      const core = (term as unknown as { _core?: { _renderService?: { _dimensions?: { css?: { cell?: { width?: number; height?: number } } } } } })
        ._core;
      const rendererReady = !!core?._renderService?._dimensions?.css?.cell?.width;
      if (!rendererReady) return;
      try {
        fit.fit();
      } catch {
        /* xterm not fully wired yet, or container has zero size */
      }
      // First successful fit: restore the original Viewport refresh.
      restoreViewportPatch();
    };

    function restoreViewportPatch() {
      if (!viewportOriginal) return;
      try {
        const viewport = (term as unknown as {
          viewport?: { _innerRefresh?: (start: number, end: number) => void };
        }).viewport;
        if (viewport?._innerRefresh) {
          viewport._innerRefresh = viewportOriginal;
        }
        viewportOriginal = null;
      } catch {
        /* ignore */
      }
    }

    const handleResize = () => {
      safeFit();
    };
    window.addEventListener('resize', handleResize);

    const greet = [
      `\x1b[36mLearninx Sandbox v0.1\x1b[0m`,
      `Try commands like \x1b[33mpwd\x1b[0m, \x1b[33mls\x1b[0m, \x1b[33mcd\x1b[0m, \x1b[33mmkdir\x1b[0m, \x1b[33mcat\x1b[0m.`,
      `Type \x1b[33mhelp\x1b[0m for the full list.`,
      ``,
    ].join('\r\n');
    term.write(greet);

    writePrompt();
    setMounted(true);

    function writePrompt(): void {
      const c = ctxRef.current!;
      const path = c.cwd === HOME ? '~' : c.cwd;
      term.write(`\r\n\x1b[32m${USER}@${HOST}\x1b[0m:\x1b[34m${path}\x1b[0m$ `);
    }

    function clearLine(): void {
      term.write('\r\x1b[2K');
      const c = ctxRef.current!;
      const path = c.cwd === HOME ? '~' : c.cwd;
      term.write(`\x1b[32m${USER}@${HOST}\x1b[0m:\x1b[34m${path}\x1b[0m$ ${bufferRef.current}`);
    }

    function submit(line: string): void {
      term.write('\r\n');
      const out = runCommand(line, ctxRef.current!);
      bufferRef.current = '';
      histIndexRef.current = historyRef.current.length;

      if (Array.isArray(out)) {
        for (const part of out) {
          term.write(part.replace(/\n/g, '\r\n') + '\r\n');
        }
      } else if (out === '__CLEAR__') {
        term.clear();
      } else if (out) {
        term.write(out.replace(/\n/g, '\r\n') + '\r\n');
      }

      // Notify parent if the user ran the expected suggestion.
      if (suggestion && onRunExpected && !completedRef.current) {
        const norm = (s: string) =>
          s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/;$/, '');
        const accepted = suggestion.expected
          .split('||')
          .map((p) => norm(p.trim()));
        if (accepted.includes(norm(line))) {
          completedRef.current = true;
          onRunExpected();
        }
      }

      writePrompt();
    }

    /** Best-effort paste from the system clipboard. */
    async function pasteFromClipboard(): Promise<void> {
      try {
        const text = await navigator.clipboard.readText();
        if (text) insertText(text);
      } catch {
        /* clipboard blocked — user must type */
      }
    }

    /** Insert text at the current cursor position. */
    function insertText(text: string): void {
      // Normalise line endings and write each char.
      const cleaned = text.replace(/\r\n?/g, '\n');
      const parts = cleaned.split('\n');
      parts.forEach((part, i) => {
        if (part) {
          term.write(part);
          bufferRef.current += part;
        }
        if (i < parts.length - 1) {
          submit(bufferRef.current);
        }
      });
    }

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      const code = ev.keyCode;

      // Ctrl+Shift+V: paste
      if (ev.ctrlKey && ev.shiftKey && (key === 'V' || code === 86)) {
        ev.preventDefault();
        void pasteFromClipboard();
        return;
      }

      // Ctrl+Shift+C: copy selection (xterm handles selection natively;
      // we just need to let the browser see the shortcut).
      if (ev.ctrlKey && ev.shiftKey && (key === 'C' || code === 67)) {
        return;
      }

      if (code === 13) {
        const line = bufferRef.current;
        if (line.trim()) {
          historyRef.current.push(line);
          histIndexRef.current = historyRef.current.length;
        }
        submit(line);
        return;
      }

      if (code === 8) {
        if (bufferRef.current.length > 0) {
          bufferRef.current = bufferRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      if (code === 38) {
        if (historyRef.current.length === 0) return;
        histIndexRef.current = Math.max(0, histIndexRef.current - 1);
        bufferRef.current = historyRef.current[histIndexRef.current] ?? '';
        clearLine();
        return;
      }

      if (code === 40) {
        if (historyRef.current.length === 0) return;
        histIndexRef.current = Math.min(
          historyRef.current.length,
          histIndexRef.current + 1,
        );
        bufferRef.current = historyRef.current[histIndexRef.current] ?? '';
        clearLine();
        return;
      }

      if (code === 9) {
        // Tab completion (very basic: complete the first token against
        // known command names).
        ev.preventDefault?.();
        const KNOWN = [
          'pwd', 'ls', 'cd', 'cat', 'echo', 'clear', 'help', 'exit',
          'mkdir', 'touch', 'rm', 'mv', 'cp', 'chmod', 'ps', 'whoami',
          'date', 'uname', 'history', 'grep', 'find', 'tree', 'man',
          'wc', 'head', 'tail', 'stat', 'df', 'free', 'uptime', 'env',
          'export', 'chown', 'chgrp', 'kill', 'top', 'id', 'which',
          'nano', 'vim', 'vi', 'less', 'more', 'tr', 'sort', 'cut',
          'sed', 'awk', 'xargs', 'tee', 'du', 'basename', 'dirname',
          'hostname', 'groups', 'who', 'last', 'ln', 'install', 'mv',
          'cp', 'rmdir', 'printf', 'yes', 'true', 'false', 'sleep',
        ];
        const buf = bufferRef.current;
        if (!buf.includes(' ')) {
          const match = KNOWN.find((c) => c.startsWith(buf));
          if (match && match !== buf) {
            const extra = match.slice(buf.length);
            term.write(extra);
            bufferRef.current += extra;
          }
        }
        return;
      }

      // Ctrl+C
      if (code === 67 && ev.ctrlKey && !ev.shiftKey) {
        term.write('^C');
        bufferRef.current = '';
        writePrompt();
        return;
      }

      // Ctrl+L
      if (code === 76 && ev.ctrlKey) {
        term.clear();
        writePrompt();
        return;
      }

      // Ctrl+U — erase line
      if (code === 85 && ev.ctrlKey) {
        bufferRef.current = '';
        clearLine();
        return;
      }

      // Ctrl+A — start of line
      if (code === 65 && ev.ctrlKey) {
        const len = bufferRef.current.length;
        if (len > 0) term.write(`\r\x1b[${len}C`);
        return;
      }

      // Ctrl+E — end of line
      if (code === 69 && ev.ctrlKey) {
        // We always redraw at end-of-line after writes, so just re-draw.
        clearLine();
        return;
      }

      // Ctrl+W — delete previous word
      if (code === 87 && ev.ctrlKey) {
        const trimmed = bufferRef.current.replace(/\s+$/, '');
        const lastSpace = trimmed.lastIndexOf(' ');
        const newBuf =
          lastSpace === -1 ? '' : trimmed.slice(0, lastSpace + 1);
        const removed = bufferRef.current.length - newBuf.length;
        if (removed > 0) {
          term.write(`\r\x1b[2K\x1b[32m${USER}@${HOST}\x1b[0m:\x1b[34m${ctxRef.current!.cwd === HOME ? '~' : ctxRef.current!.cwd}\x1b[0m$ ${newBuf}`);
          bufferRef.current = newBuf;
        }
        return;
      }

      if (key.length === 1 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        bufferRef.current += key;
        term.write(key);
      }
    });

    // Right-click paste
    term.attachCustomKeyEventHandler((e) => {
      if (e.type === 'keydown' && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        void pasteFromClipboard();
        return false;
      }
      return true;
    });

    // Programmatic run, used by the "Run hint" button.
    (term as unknown as { __run?: (line: string) => void }).__run = (
      line: string,
    ) => {
      // Echo the command so the user sees what was sent, then submit.
      term.write(line + '\r');
      bufferRef.current = line;
      submit(line);
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(initialFit);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      restoreViewportPatch();
      // Detach the custom key event handler first so any further
      // keydown events on the host element don't try to write into a
      // disposed terminal.
      try {
        (term as unknown as { attachCustomKeyEventHandler?: (h: (e: KeyboardEvent) => boolean) => void })
          .attachCustomKeyEventHandler?.(() => true);
      } catch {
        /* ignore */
      }
      try {
        if (opened) term.dispose();
      } catch {
        /* already disposed */
      }
      xtermRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSuggestion(): void {
    const term = xtermRef.current as unknown as {
      __run?: (line: string) => void;
    } | null;
    if (term?.__run && suggestion) {
      term.__run(suggestion.command);
    }
  }

  function showHelpText(): void {
    const term = xtermRef.current;
    if (!term) return;
    term.write('\r\n');
    HELP_TEXT.split('\n').forEach((line) => {
      term.writeln(line);
    });
  }

  return (
    <div
      className={`lx-card flex h-full flex-col overflow-hidden border-slate-800/80 ${className}`}
      role="group"
      aria-label="Linux terminal sandbox"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/70 px-3 py-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-red-500/80"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-green-500/80"
            aria-hidden
          />
          <span className="ml-3 truncate font-mono text-slate-400">
            learner@learninx:~
          </span>
          {mounted && (
            <span
              className="ml-2 hidden h-1.5 w-1.5 rounded-full bg-[var(--lx-success)] sm:inline-block"
              title="Sandbox ready"
              aria-label="Sandbox ready"
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={showHelpText}
            className="lx-btn lx-btn-ghost lx-btn-sm px-2 py-1 text-slate-400"
            title="Show help"
            aria-label="Show help"
          >
            <HelpIcon size={14} />
            <span className="hidden sm:inline">Help</span>
          </button>
          {suggestion && (
            <button
              onClick={runSuggestion}
              className="lx-btn lx-btn-secondary lx-btn-sm border-[var(--lx-success)]/30 bg-[var(--lx-success)]/10 text-[var(--lx-success)] hover:bg-[var(--lx-success)]/20 hover:text-[var(--lx-success)]"
              title={`Run: ${suggestion.command}`}
            >
              <PlayIcon size={12} />
              <span className="hidden sm:inline">Run</span>
              <code className="font-mono text-[0.8em] opacity-90">
                {suggestion.command}
              </code>
            </button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="min-h-0 flex-1 bg-[var(--lx-bg)] p-2"
        onClick={() => xtermRef.current?.focus()}
      />
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/50 px-3 py-1.5 text-[0.7rem] text-slate-500">
        <span>
          <CopyIcon size={11} className="-mt-0.5 mr-1 inline" />
          Sandbox is isolated. Type{' '}
          <code className="rounded bg-slate-800/80 px-1 py-0.5 font-mono text-[0.75em] text-slate-300">
            help
          </code>{' '}
          for commands.
        </span>
        <span className="hidden font-mono sm:inline">
          <kbd className="lx-kbd">Ctrl</kbd>+<kbd className="lx-kbd">Shift</kbd>+
          <kbd className="lx-kbd">V</kbd> to paste
        </span>
      </div>
    </div>
  );
}

