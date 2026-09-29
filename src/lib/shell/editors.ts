// Real, in-browser implementations of nano/pico, vi/vim, and emacs.
//
// This module is pure UI-free state logic: given an EditorState and a
// normalized keystroke, it returns the next state plus whether to save
// and/or exit. Terminal.tsx owns the actual terminal (raw keystrokes,
// ANSI rendering, alt-screen buffer, and persisting to the virtual
// filesystem on save) — keeping the editing logic itself free of any of
// that makes each engine easy to reason about and to test with a plain
// sequence of keystrokes, the same way evaluator.ts's commands are pure
// functions over a ShellContext.
//
// Deliberate simplifications (all called out in the vim lesson too):
//   - vim's Visual mode (v/V/Ctrl-v) is always line-wise here, like real
//     vim's Visual Line mode — no character/block-wise selection.
//   - vim's `.` repeat-last-change is not implemented.
//   - Lines longer than the terminal width are visually truncated, not
//     horizontally scrolled.

export type EditorKind = 'nano' | 'vim' | 'emacs';

export interface EditorState {
  kind: EditorKind;
  filename: string;
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  scrollTop: number;
  modified: boolean;
  message: string;
  clipboard: string[] | null;

  // vim
  mode: 'normal' | 'insert' | 'visual' | 'command' | 'search';
  pendingKey: string;
  countBuffer: string;
  commandBuffer: string;
  searchTerm: string;
  visualAnchorRow: number;
  undoStack: string[][];
  redoStack: string[][];

  // nano
  confirmExit: boolean;

  // emacs
  prefixKey: 'C-x' | null;
  confirmExitEmacs: boolean;
}

export type EditorKeyEvent =
  | { type: 'char'; char: string }
  | { type: 'enter' }
  | { type: 'backspace' }
  | { type: 'delete' }
  | { type: 'tab' }
  | { type: 'escape' }
  | { type: 'arrow'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'home' }
  | { type: 'end' }
  | { type: 'pageup' }
  | { type: 'pagedown' }
  | { type: 'ctrl'; key: string };

export interface EditorResult {
  state: EditorState;
  exit: boolean;
  saved: boolean;
}

export function createEditorState(
  kind: EditorKind,
  filename: string,
  content: string,
): EditorState {
  const lines = content.length === 0 ? [''] : content.replace(/\n$/, '').split('\n');
  return {
    kind,
    filename,
    lines: lines.length === 0 ? [''] : lines,
    cursorRow: 0,
    cursorCol: 0,
    scrollTop: 0,
    modified: false,
    message: '',
    clipboard: null,
    mode: 'normal',
    pendingKey: '',
    countBuffer: '',
    commandBuffer: '',
    searchTerm: '',
    visualAnchorRow: 0,
    undoStack: [],
    redoStack: [],
    confirmExit: false,
    prefixKey: null,
    confirmExitEmacs: false,
  };
}

export function editorContent(state: EditorState): string {
  return state.lines.join('\n') + '\n';
}

// ───────────────────────────────────────────────────────── helpers ──

function clone(state: EditorState): EditorState {
  return { ...state, lines: [...state.lines] };
}

function clampRow(s: EditorState) {
  if (s.cursorRow < 0) s.cursorRow = 0;
  if (s.cursorRow >= s.lines.length) s.cursorRow = s.lines.length - 1;
}

function clampCol(s: EditorState, allowEnd: boolean) {
  const max = s.lines[s.cursorRow].length - (allowEnd ? 0 : 1);
  const floor = allowEnd ? 0 : 0;
  s.cursorCol = Math.max(floor, Math.min(s.cursorCol, Math.max(0, max)));
}

function moveCursor(
  s: EditorState,
  dir: 'up' | 'down' | 'left' | 'right',
  allowEndCol: boolean,
  count = 1,
) {
  for (let i = 0; i < count; i++) {
    if (dir === 'up') s.cursorRow--;
    else if (dir === 'down') s.cursorRow++;
    else if (dir === 'left') s.cursorCol--;
    else if (dir === 'right') s.cursorCol++;
    clampRow(s);
    if (dir === 'up' || dir === 'down') {
      // moving between lines re-clamps col against the new line's length
      clampCol(s, allowEndCol);
    } else {
      const max = s.lines[s.cursorRow].length - (allowEndCol ? 0 : 1);
      if (s.cursorCol > Math.max(0, max)) {
        // left/right movement doesn't wrap to other lines
        s.cursorCol = Math.max(0, max);
        break;
      }
      if (s.cursorCol < 0) {
        s.cursorCol = 0;
        break;
      }
    }
  }
}

function insertChar(s: EditorState, ch: string) {
  const line = s.lines[s.cursorRow];
  s.lines[s.cursorRow] = line.slice(0, s.cursorCol) + ch + line.slice(s.cursorCol);
  s.cursorCol += ch.length;
  s.modified = true;
}

function insertNewline(s: EditorState) {
  const line = s.lines[s.cursorRow];
  const before = line.slice(0, s.cursorCol);
  const after = line.slice(s.cursorCol);
  s.lines.splice(s.cursorRow, 1, before, after);
  s.cursorRow += 1;
  s.cursorCol = 0;
  s.modified = true;
}

function backspace(s: EditorState) {
  if (s.cursorCol > 0) {
    const line = s.lines[s.cursorRow];
    s.lines[s.cursorRow] = line.slice(0, s.cursorCol - 1) + line.slice(s.cursorCol);
    s.cursorCol -= 1;
    s.modified = true;
  } else if (s.cursorRow > 0) {
    const prevLen = s.lines[s.cursorRow - 1].length;
    s.lines[s.cursorRow - 1] += s.lines[s.cursorRow];
    s.lines.splice(s.cursorRow, 1);
    s.cursorRow -= 1;
    s.cursorCol = prevLen;
    s.modified = true;
  }
}

function deleteForward(s: EditorState) {
  const line = s.lines[s.cursorRow];
  if (s.cursorCol < line.length) {
    s.lines[s.cursorRow] = line.slice(0, s.cursorCol) + line.slice(s.cursorCol + 1);
    s.modified = true;
  } else if (s.cursorRow < s.lines.length - 1) {
    s.lines[s.cursorRow] += s.lines[s.cursorRow + 1];
    s.lines.splice(s.cursorRow + 1, 1);
    s.modified = true;
  }
}

function nextWordBoundary(line: string, col: number): number {
  let i = col;
  const isWord = (c: string) => /\w/.test(c);
  if (i < line.length && isWord(line[i])) {
    while (i < line.length && isWord(line[i])) i++;
  } else {
    while (i < line.length && !isWord(line[i]) && line[i] !== ' ') i++;
  }
  while (i < line.length && line[i] === ' ') i++;
  return i;
}

export function ensureVisible(s: EditorState, contentRows: number) {
  if (s.cursorRow < s.scrollTop) s.scrollTop = s.cursorRow;
  else if (s.cursorRow >= s.scrollTop + contentRows) {
    s.scrollTop = s.cursorRow - contentRows + 1;
  }
  if (s.scrollTop < 0) s.scrollTop = 0;
}

// ────────────────────────────────────────────────────────── nano ──

function handleNanoKey(state: EditorState, ev: EditorKeyEvent): EditorResult {
  const s = clone(state);
  s.message = '';

  if (s.confirmExit) {
    if (ev.type === 'char' && (ev.char === 'y' || ev.char === 'Y')) {
      s.confirmExit = false;
      s.modified = false;
      return { state: s, exit: true, saved: true };
    }
    if (ev.type === 'char' && (ev.char === 'n' || ev.char === 'N')) {
      s.confirmExit = false;
      return { state: s, exit: true, saved: false };
    }
    if (ev.type === 'ctrl' && ev.key === 'c') {
      s.confirmExit = false;
      s.message = 'Cancelled';
      return { state: s, exit: false, saved: false };
    }
    return { state: s, exit: false, saved: false };
  }

  if (ev.type === 'ctrl' && ev.key === 'o') {
    s.modified = false;
    s.message = `Wrote ${s.lines.length} lines`;
    return { state: s, exit: false, saved: true };
  }
  if (ev.type === 'ctrl' && ev.key === 'x') {
    if (s.modified) {
      s.confirmExit = true;
      return { state: s, exit: false, saved: false };
    }
    return { state: s, exit: true, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'k') {
    const cut = s.lines.splice(s.cursorRow, 1);
    if (s.lines.length === 0) s.lines = [''];
    s.clipboard = cut;
    clampRow(s);
    s.cursorCol = 0;
    s.modified = true;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'u') {
    if (s.clipboard) {
      s.lines.splice(s.cursorRow, 0, ...s.clipboard);
      s.modified = true;
    }
    return { state: s, exit: false, saved: false };
  }

  if (ev.type === 'char') insertChar(s, ev.char);
  else if (ev.type === 'enter') insertNewline(s);
  else if (ev.type === 'backspace') backspace(s);
  else if (ev.type === 'delete') deleteForward(s);
  else if (ev.type === 'tab') insertChar(s, '  ');
  else if (ev.type === 'arrow') moveCursor(s, ev.dir, true);
  else if (ev.type === 'home') s.cursorCol = 0;
  else if (ev.type === 'end') s.cursorCol = s.lines[s.cursorRow].length;
  else if (ev.type === 'pageup') moveCursor(s, 'up', true, 10);
  else if (ev.type === 'pagedown') moveCursor(s, 'down', true, 10);

  return { state: s, exit: false, saved: false };
}

// ─────────────────────────────────────────────────────── vi / vim ──

function pushUndo(s: EditorState) {
  s.undoStack.push([...s.lines]);
  if (s.undoStack.length > 100) s.undoStack.shift();
  s.redoStack = [];
}

function runSubstitute(s: EditorState, cmd: string): string {
  const m = cmd.match(/^%s\/(.+?)\/(.*?)\/([gi]*)$/);
  if (!m) return `E492: Not an editor command: ${cmd}`;
  const [, find, repl, flags] = m;
  const jsFlags = (flags.includes('g') ? 'g' : '') + (flags.includes('i') ? 'i' : '');
  let re: RegExp;
  try {
    re = new RegExp(find, jsFlags);
  } catch {
    return `E486: invalid regular expression: ${find}`;
  }
  pushUndo(s);
  const jsRepl = repl.replace(/\\(\d)/g, '$$$1');
  let count = 0;
  s.lines = s.lines.map((line) => {
    if (re.test(line)) count++;
    re.lastIndex = 0;
    return line.replace(re, jsRepl);
  });
  s.modified = true;
  return count > 0 ? `${count} substitution(s)` : 'Pattern not found';
}

function handleVimNormalKey(s: EditorState, ev: EditorKeyEvent): EditorResult {
  s.message = '';

  if (ev.type === 'escape') {
    s.pendingKey = '';
    s.countBuffer = '';
    return { state: s, exit: false, saved: false };
  }

  // digit accumulation for counts (leading '0' is the "start of line" motion)
  if (ev.type === 'char' && /^[1-9]$/.test(ev.char)) {
    s.countBuffer += ev.char;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'char' && ev.char === '0' && s.countBuffer !== '') {
    s.countBuffer += '0';
    return { state: s, exit: false, saved: false };
  }
  const count = s.countBuffer ? parseInt(s.countBuffer, 10) : 1;
  const hadCount = s.countBuffer !== '';
  s.countBuffer = '';

  // two-key sequences: dd / d$ / d0 / dw, yy, gg
  if (s.pendingKey === 'd') {
    s.pendingKey = '';
    if (ev.type === 'char' && ev.char === 'd') {
      pushUndo(s);
      const cut = s.lines.splice(s.cursorRow, Math.min(count, s.lines.length - s.cursorRow));
      if (s.lines.length === 0) s.lines = [''];
      s.clipboard = cut;
      clampRow(s);
      s.cursorCol = 0;
      s.modified = true;
    } else if (ev.type === 'char' && ev.char === '$') {
      pushUndo(s);
      const line = s.lines[s.cursorRow];
      s.clipboard = [line.slice(s.cursorCol)];
      s.lines[s.cursorRow] = line.slice(0, s.cursorCol);
      s.modified = true;
    } else if (ev.type === 'char' && ev.char === '0') {
      pushUndo(s);
      const line = s.lines[s.cursorRow];
      s.clipboard = [line.slice(0, s.cursorCol)];
      s.lines[s.cursorRow] = line.slice(s.cursorCol);
      s.cursorCol = 0;
      s.modified = true;
    } else if (ev.type === 'char' && ev.char === 'w') {
      pushUndo(s);
      const line = s.lines[s.cursorRow];
      const end = nextWordBoundary(line, s.cursorCol);
      s.clipboard = [line.slice(s.cursorCol, end)];
      s.lines[s.cursorRow] = line.slice(0, s.cursorCol) + line.slice(end);
      s.modified = true;
    }
    return { state: s, exit: false, saved: false };
  }
  if (s.pendingKey === 'y') {
    s.pendingKey = '';
    if (ev.type === 'char' && ev.char === 'y') {
      s.clipboard = s.lines.slice(s.cursorRow, s.cursorRow + count);
      s.message = `${s.clipboard.length} line(s) yanked`;
    }
    return { state: s, exit: false, saved: false };
  }
  if (s.pendingKey === 'g') {
    s.pendingKey = '';
    if (ev.type === 'char' && ev.char === 'g') {
      s.cursorRow = 0;
      s.cursorCol = 0;
    }
    return { state: s, exit: false, saved: false };
  }

  if (ev.type === 'char' && (ev.char === 'd' || ev.char === 'y' || ev.char === 'g')) {
    s.pendingKey = ev.char;
    s.countBuffer = hadCount ? String(count) : '';
    return { state: s, exit: false, saved: false };
  }

  // movement
  if (ev.type === 'char' && ev.char === 'h') moveCursor(s, 'left', false, count);
  else if (ev.type === 'char' && ev.char === 'l') moveCursor(s, 'right', false, count);
  else if (ev.type === 'char' && ev.char === 'j') moveCursor(s, 'down', false, count);
  else if (ev.type === 'char' && ev.char === 'k') moveCursor(s, 'up', false, count);
  else if (ev.type === 'arrow') moveCursor(s, ev.dir, false, count);
  else if (ev.type === 'char' && ev.char === '0') s.cursorCol = 0;
  else if (ev.type === 'char' && ev.char === '$') s.cursorCol = Math.max(0, s.lines[s.cursorRow].length - 1);
  else if (ev.type === 'char' && ev.char === 'G') {
    s.cursorRow = s.lines.length - 1;
    s.cursorCol = 0;
  }
  else if (ev.type === 'home') s.cursorCol = 0;
  else if (ev.type === 'end') s.cursorCol = Math.max(0, s.lines[s.cursorRow].length - 1);
  else if (ev.type === 'pageup') moveCursor(s, 'up', false, 10);
  else if (ev.type === 'pagedown') moveCursor(s, 'down', false, 10);
  // mode switches
  else if (ev.type === 'char' && ev.char === 'i') s.mode = 'insert';
  else if (ev.type === 'char' && ev.char === 'a') {
    s.cursorCol = Math.min(s.lines[s.cursorRow].length, s.cursorCol + 1);
    s.mode = 'insert';
  } else if (ev.type === 'char' && ev.char === 'o') {
    pushUndo(s);
    s.lines.splice(s.cursorRow + 1, 0, '');
    s.cursorRow += 1;
    s.cursorCol = 0;
    s.mode = 'insert';
    s.modified = true;
  } else if (ev.type === 'char' && ev.char === 'O') {
    pushUndo(s);
    s.lines.splice(s.cursorRow, 0, '');
    s.cursorCol = 0;
    s.mode = 'insert';
    s.modified = true;
  } else if (ev.type === 'char' && (ev.char === 'v' || ev.char === 'V')) {
    s.mode = 'visual';
    s.visualAnchorRow = s.cursorRow;
  } else if (ev.type === 'char' && ev.char === ':') {
    s.mode = 'command';
    s.commandBuffer = '';
  } else if (ev.type === 'char' && ev.char === '/') {
    s.mode = 'search';
    s.commandBuffer = '';
  } else if (ev.type === 'char' && ev.char === 'n') {
    if (s.searchTerm) runSearch(s, s.searchTerm);
  }
  // editing
  else if (ev.type === 'char' && ev.char === 'x') {
    pushUndo(s);
    const line = s.lines[s.cursorRow];
    if (line.length > 0) {
      const n = Math.min(count, line.length - s.cursorCol);
      s.lines[s.cursorRow] = line.slice(0, s.cursorCol) + line.slice(s.cursorCol + n);
      clampCol(s, false);
      s.modified = true;
    }
  } else if (ev.type === 'char' && ev.char === 'p') {
    if (s.clipboard) {
      pushUndo(s);
      s.lines.splice(s.cursorRow + 1, 0, ...s.clipboard);
      s.cursorRow += 1;
      s.modified = true;
    }
  } else if (ev.type === 'char' && ev.char === 'u') {
    const prev = s.undoStack.pop();
    if (prev) {
      s.redoStack.push([...s.lines]);
      s.lines = prev;
      clampRow(s);
      clampCol(s, false);
      s.modified = s.undoStack.length > 0;
    }
  } else if (ev.type === 'ctrl' && ev.key === 'r') {
    const next = s.redoStack.pop();
    if (next) {
      s.undoStack.push([...s.lines]);
      s.lines = next;
      clampRow(s);
      clampCol(s, false);
      s.modified = true;
    }
  }

  clampCol(s, s.mode === 'insert');
  return { state: s, exit: false, saved: false };
}

function runSearch(s: EditorState, term: string): void {
  let re: RegExp;
  try {
    re = new RegExp(term);
  } catch {
    s.message = `E486: invalid regular expression: ${term}`;
    return;
  }
  // Search starts on the line *after* the cursor and wraps around, so
  // repeated `n` presses keep advancing instead of re-finding the same
  // match on the current line. Matches within the current line itself
  // are only found again once the search has wrapped all the way back.
  for (let offset = 1; offset <= s.lines.length; offset++) {
    const row = (s.cursorRow + offset) % s.lines.length;
    const idx = s.lines[row].search(re);
    if (idx >= 0) {
      s.cursorRow = row;
      s.cursorCol = idx;
      return;
    }
  }
  s.message = `E486: Pattern not found: ${term}`;
}

function handleVimInsertKey(s: EditorState, ev: EditorKeyEvent): EditorResult {
  s.message = '';
  if (ev.type === 'escape') {
    s.mode = 'normal';
    s.cursorCol = Math.max(0, s.cursorCol - 1);
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'char') insertChar(s, ev.char);
  else if (ev.type === 'enter') insertNewline(s);
  else if (ev.type === 'backspace') backspace(s);
  else if (ev.type === 'delete') deleteForward(s);
  else if (ev.type === 'tab') insertChar(s, '  ');
  else if (ev.type === 'arrow') moveCursor(s, ev.dir, true);
  else if (ev.type === 'home') s.cursorCol = 0;
  else if (ev.type === 'end') s.cursorCol = s.lines[s.cursorRow].length;
  return { state: s, exit: false, saved: false };
}

function handleVimVisualKey(s: EditorState, ev: EditorKeyEvent): EditorResult {
  s.message = '';
  if (ev.type === 'escape') {
    s.mode = 'normal';
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'char' && ev.char === 'h') moveCursor(s, 'left', false);
  else if (ev.type === 'char' && ev.char === 'l') moveCursor(s, 'right', false);
  else if (ev.type === 'char' && ev.char === 'j') moveCursor(s, 'down', false);
  else if (ev.type === 'char' && ev.char === 'k') moveCursor(s, 'up', false);
  else if (ev.type === 'arrow') moveCursor(s, ev.dir, false);
  else if (ev.type === 'char' && (ev.char === 'd' || ev.char === 'y')) {
    const from = Math.min(s.visualAnchorRow, s.cursorRow);
    const to = Math.max(s.visualAnchorRow, s.cursorRow);
    const selected = s.lines.slice(from, to + 1);
    s.clipboard = selected;
    if (ev.char === 'd') {
      pushUndo(s);
      s.lines.splice(from, selected.length);
      if (s.lines.length === 0) s.lines = [''];
      s.cursorRow = Math.min(from, s.lines.length - 1);
      s.cursorCol = 0;
      s.modified = true;
    } else {
      s.message = `${selected.length} line(s) yanked`;
    }
    s.mode = 'normal';
  }
  return { state: s, exit: false, saved: false };
}

function handleVimCommandKey(s: EditorState, ev: EditorKeyEvent): EditorResult {
  if (ev.type === 'escape') {
    s.mode = 'normal';
    s.commandBuffer = '';
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'backspace') {
    s.commandBuffer = s.commandBuffer.slice(0, -1);
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'char') {
    s.commandBuffer += ev.char;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'enter') {
    const cmd = s.commandBuffer;
    s.mode = 'normal';
    s.commandBuffer = '';
    if (cmd === 'w') {
      s.modified = false;
      s.message = `"${s.filename}" written`;
      return { state: s, exit: false, saved: true };
    }
    if (cmd === 'q') {
      if (s.modified) {
        s.message = 'E37: No write since last change (add ! to override)';
        return { state: s, exit: false, saved: false };
      }
      return { state: s, exit: true, saved: false };
    }
    if (cmd === 'q!') return { state: s, exit: true, saved: false };
    if (cmd === 'wq' || cmd === 'x') {
      s.modified = false;
      return { state: s, exit: true, saved: true };
    }
    if (cmd.startsWith('%s/')) {
      s.message = runSubstitute(s, cmd);
      return { state: s, exit: false, saved: false };
    }
    s.message = `E492: Not an editor command: ${cmd}`;
  }
  return { state: s, exit: false, saved: false };
}

function handleVimSearchKey(s: EditorState, ev: EditorKeyEvent): EditorResult {
  if (ev.type === 'escape') {
    s.mode = 'normal';
    s.commandBuffer = '';
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'backspace') {
    s.commandBuffer = s.commandBuffer.slice(0, -1);
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'char') {
    s.commandBuffer += ev.char;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'enter') {
    s.searchTerm = s.commandBuffer;
    s.commandBuffer = '';
    s.mode = 'normal';
    runSearch(s, s.searchTerm);
  }
  return { state: s, exit: false, saved: false };
}

function handleVimKey(state: EditorState, ev: EditorKeyEvent): EditorResult {
  const s = clone(state);
  if (s.mode === 'insert') return handleVimInsertKey(s, ev);
  if (s.mode === 'visual') return handleVimVisualKey(s, ev);
  if (s.mode === 'command') return handleVimCommandKey(s, ev);
  if (s.mode === 'search') return handleVimSearchKey(s, ev);
  return handleVimNormalKey(s, ev);
}

// ────────────────────────────────────────────────────────── emacs ──

function handleEmacsKey(state: EditorState, ev: EditorKeyEvent): EditorResult {
  const s = clone(state);
  s.message = '';

  if (s.confirmExitEmacs) {
    if (ev.type === 'char' && (ev.char === 'y' || ev.char === 'Y')) {
      s.confirmExitEmacs = false;
      s.modified = false;
      return { state: s, exit: true, saved: true };
    }
    if (ev.type === 'char' && (ev.char === 'n' || ev.char === 'N')) {
      s.confirmExitEmacs = false;
      return { state: s, exit: true, saved: false };
    }
    return { state: s, exit: false, saved: false };
  }

  if (s.prefixKey === 'C-x') {
    s.prefixKey = null;
    if (ev.type === 'ctrl' && ev.key === 's') {
      s.modified = false;
      s.message = 'Wrote file';
      return { state: s, exit: false, saved: true };
    }
    if (ev.type === 'ctrl' && ev.key === 'c') {
      if (s.modified) {
        s.confirmExitEmacs = true;
        return { state: s, exit: false, saved: false };
      }
      return { state: s, exit: true, saved: false };
    }
    if (ev.type === 'char' && ev.char === 'u') {
      s.message = 'Undo not available in this sandbox';
      return { state: s, exit: false, saved: false };
    }
    s.message = `${ev.type === 'char' ? ev.char : ''} is undefined`;
    return { state: s, exit: false, saved: false };
  }

  if (ev.type === 'ctrl' && ev.key === 'x') {
    s.prefixKey = 'C-x';
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && (ev.key === 'f' || ev.key === 'b' || ev.key === 'p' || ev.key === 'n')) {
    const dir = { f: 'right', b: 'left', p: 'up', n: 'down' } as const;
    moveCursor(s, dir[ev.key], true);
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'a') {
    s.cursorCol = 0;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'e') {
    s.cursorCol = s.lines[s.cursorRow].length;
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'd') {
    deleteForward(s);
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'k') {
    const line = s.lines[s.cursorRow];
    if (s.cursorCol < line.length) {
      s.clipboard = [line.slice(s.cursorCol)];
      s.lines[s.cursorRow] = line.slice(0, s.cursorCol);
      s.modified = true;
    } else if (s.cursorRow < s.lines.length - 1) {
      s.clipboard = [''];
      s.lines[s.cursorRow] += s.lines[s.cursorRow + 1];
      s.lines.splice(s.cursorRow + 1, 1);
      s.modified = true;
    }
    return { state: s, exit: false, saved: false };
  }
  if (ev.type === 'ctrl' && ev.key === 'y') {
    if (s.clipboard) {
      const text = s.clipboard.join('\n');
      insertChar(s, text);
    }
    return { state: s, exit: false, saved: false };
  }

  if (ev.type === 'char') insertChar(s, ev.char);
  else if (ev.type === 'enter') insertNewline(s);
  else if (ev.type === 'backspace') backspace(s);
  else if (ev.type === 'delete') deleteForward(s);
  else if (ev.type === 'tab') insertChar(s, '  ');
  else if (ev.type === 'arrow') moveCursor(s, ev.dir, true);
  else if (ev.type === 'home') s.cursorCol = 0;
  else if (ev.type === 'end') s.cursorCol = s.lines[s.cursorRow].length;
  else if (ev.type === 'pageup') moveCursor(s, 'up', true, 10);
  else if (ev.type === 'pagedown') moveCursor(s, 'down', true, 10);

  return { state: s, exit: false, saved: false };
}

// ─────────────────────────────────────────────────────── dispatch ──

export function handleEditorKey(state: EditorState, ev: EditorKeyEvent): EditorResult {
  if (state.kind === 'nano') return handleNanoKey(state, ev);
  if (state.kind === 'vim') return handleVimKey(state, ev);
  return handleEmacsKey(state, ev);
}

// ───────────────────────────────────────────────────────── render ──

function padTrunc(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

export function renderEditorScreen(state: EditorState, rows: number, cols: number): string {
  const s = state;
  const reservedTop = s.kind === 'nano' ? 1 : 0;
  const reservedBottom = s.kind === 'nano' ? 2 : s.kind === 'emacs' ? 2 : 1;
  const contentRows = Math.max(1, rows - reservedTop - reservedBottom);
  ensureVisible(s, contentRows);

  let out = '\x1b[2J\x1b[H';

  if (reservedTop > 0) {
    const title = `  GNU nano   ${s.filename}${s.modified ? ' *' : ''}`;
    out += `\x1b[7m${padTrunc(title, cols)}\x1b[0m\r\n`;
  }

  for (let i = 0; i < contentRows; i++) {
    const idx = s.scrollTop + i;
    const raw = idx < s.lines.length ? s.lines[idx] : s.kind === 'vim' ? '~' : '';
    out += raw.slice(0, cols) + '\r\n';
  }

  if (s.kind === 'nano') {
    out += `\x1b[7m${padTrunc('  ^O Write Out    ^X Exit    ^K Cut Line    ^U Paste', cols)}\x1b[0m\r\n`;
    const msg = s.confirmExit ? 'Save modified buffer?  Y Yes   N No   ^C Cancel' : s.message;
    out += msg.slice(0, cols);
  } else if (s.kind === 'vim') {
    let left: string;
    if (s.mode === 'command') left = ':' + s.commandBuffer;
    else if (s.mode === 'search') left = '/' + s.commandBuffer;
    else if (s.message) left = s.message;
    else if (s.mode === 'insert') left = '-- INSERT --';
    else if (s.mode === 'visual') left = '-- VISUAL LINE --';
    else left = `"${s.filename}"${s.modified ? ' [Modified]' : ''}`;
    const pos = `${s.cursorRow + 1},${s.cursorCol + 1}`;
    const gap = Math.max(1, cols - left.length - pos.length);
    out += `\x1b[7m${padTrunc(left + ' '.repeat(gap) + pos, cols)}\x1b[0m`;
  } else {
    const modeLine = `--  ${s.filename}${s.modified ? ' *' : ''}   (${s.cursorRow + 1},${s.cursorCol})  --`;
    out += `\x1b[7m${padTrunc(modeLine, cols)}\x1b[0m\r\n`;
    let echo = s.message;
    if (s.prefixKey) echo = 'C-x-';
    if (s.confirmExitEmacs) echo = 'Save file? (y, n)';
    out += echo.slice(0, cols);
  }

  const screenRow = reservedTop + (s.cursorRow - s.scrollTop) + 1;
  const screenCol = s.cursorCol + 1;
  out += `\x1b[${Math.max(1, screenRow)};${Math.max(1, screenCol)}H`;

  return out;
}
