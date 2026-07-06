/**
 * Cheatsheet — structured reference of the commands supported by the
 * in-browser sandbox in `src/lib/shell/evaluator.ts`. The cheatsheet
 * page filters this list client-side.
 *
 * Keep this file dependency-free so it can be imported from server or
 * client components.
 */

export type CheatCategory =
  | 'Navigation'
  | 'Files'
  | 'Inspection'
  | 'Editing'
  | 'Permissions'
  | 'System'
  | 'Help';

export interface CheatEntry {
  /** Command name, e.g. "ls". */
  cmd: string;
  /** One-line tagline. */
  short: string;
  /** Longer description shown when expanded. */
  long: string;
  /** Concrete example invocations, e.g. ["ls -la", "ls -a /tmp"]. */
  examples: string[];
  /** Grouping in the cheatsheet UI. */
  category: CheatCategory;
  /** Free-text search aliases. */
  keywords: string[];
}

export const CHEATSHEET: CheatEntry[] = [
  // Navigation
  {
    cmd: 'pwd',
    short: 'Print working directory',
    long: 'Shows the absolute path of the directory you are currently in.',
    examples: ['pwd'],
    category: 'Navigation',
    keywords: ['where', 'directory', 'path', 'current'],
  },
  {
    cmd: 'cd',
    short: 'Change directory',
    long: 'Moves you into a different directory. Use `cd ..` to go up one level, `cd ~` to jump home, or `cd -` to flip back to the previous directory.',
    examples: ['cd projects', 'cd ..', 'cd ~', 'cd /tmp'],
    category: 'Navigation',
    keywords: ['change', 'move', 'navigate', 'directory'],
  },
  {
    cmd: 'ls',
    short: 'List directory contents',
    long: 'Lists files and folders. `-l` shows a long listing with permissions, owner and size. `-a` includes hidden files (those starting with a dot).',
    examples: ['ls', 'ls -l', 'ls -la', 'ls /etc'],
    category: 'Navigation',
    keywords: ['list', 'files', 'directory', 'contents'],
  },

  // Files
  {
    cmd: 'mkdir',
    short: 'Make a directory',
    long: 'Creates a new directory. `-p` (parents) creates any missing intermediate directories and silently succeeds if the target already exists.',
    examples: ['mkdir lab', 'mkdir -p a/b/c'],
    category: 'Files',
    keywords: ['make', 'create', 'directory', 'folder'],
  },
  {
    cmd: 'touch',
    short: 'Create an empty file (or update its timestamp)',
    long: 'Creates an empty file if it does not exist, otherwise updates the modified time of the existing file.',
    examples: ['touch notes.txt'],
    category: 'Files',
    keywords: ['create', 'file', 'empty', 'timestamp'],
  },
  {
    cmd: 'cp',
    short: 'Copy files and directories',
    long: 'Copies a file to a new location. `-r` is required to copy a directory recursively.',
    examples: ['cp notes.txt copy.txt', 'cp -r src backup'],
    category: 'Files',
    keywords: ['copy', 'duplicate', 'file', 'directory'],
  },
  {
    cmd: 'mv',
    short: 'Move or rename files and directories',
    long: 'Renames a file or moves it to a new location. Works for both files and directories — there is no separate `rename` command.',
    examples: ['mv notes.txt renamed.txt', 'mv report.txt archive/'],
    category: 'Files',
    keywords: ['move', 'rename'],
  },
  {
    cmd: 'rm',
    short: 'Remove files or directories',
    long: 'Deletes a file. `-r` deletes a directory and everything inside it. `-f` skips the confirmation prompt. Be careful: there is no recycle bin.',
    examples: ['rm notes.txt', 'rm -r lab', 'rm -rf build'],
    category: 'Files',
    keywords: ['remove', 'delete', 'trash'],
  },

  // Inspection
  {
    cmd: 'cat',
    short: 'Print the contents of a file',
    long: 'Writes the file to standard output. Great for short files. For longer files prefer `less` or `head` / `tail`.',
    examples: ['cat notes.txt', 'cat /etc/hostname'],
    category: 'Inspection',
    keywords: ['print', 'read', 'file', 'contents', 'show'],
  },
  {
    cmd: 'head',
    short: 'Show the first lines of a file',
    long: 'By default prints the first 10 lines. Pass `-n` to change the count.',
    examples: ['head notes.txt', 'head -n 5 /etc/passwd'],
    category: 'Inspection',
    keywords: ['start', 'first', 'lines', 'file'],
  },
  {
    cmd: 'wc',
    short: 'Count lines, words and bytes',
    long: 'By default prints three numbers: lines, words, bytes. Common flags: `-l` (lines only), `-w` (words only), `-c` (bytes only).',
    examples: ['wc notes.txt', 'wc -l notes.txt'],
    category: 'Inspection',
    keywords: ['count', 'lines', 'words', 'bytes'],
  },

  // Editing
  {
    cmd: 'echo',
    short: 'Print text to the screen',
    long: 'Writes its arguments to standard output. Combine with `>` to write to a file or `>>` to append.',
    examples: ['echo hello', 'echo hello > notes.txt', 'echo more >> notes.txt'],
    category: 'Editing',
    keywords: ['print', 'text', 'write', 'redirect'],
  },
  {
    cmd: 'nano',
    short: 'Beginner-friendly text editor',
    long: 'In the sandbox, `nano file` prints a TUI-style view of the file and tells you which commands to use for real edits. Use `echo > file` to overwrite or `>>` to append.',
    examples: ['nano notes.txt'],
    category: 'Editing',
    keywords: ['editor', 'simple', 'text', 'beginner'],
  },
  {
    cmd: 'vi / vim',
    short: 'Modal text editor',
    long: 'In the sandbox this prints a TUI view and lists the editing commands. In a real terminal: press `i` to enter insert mode, `Esc` to leave, `:wq` to save and quit.',
    examples: ['vi notes.txt', 'vim notes.txt'],
    category: 'Editing',
    keywords: ['editor', 'vim', 'vi', 'modal', 'advanced'],
  },

  // Permissions
  {
    cmd: 'chmod',
    short: 'Change file permissions',
    long: 'Updates the read / write / execute bits. The octal form is easiest: 7 = rwx, 6 = rw-, 5 = r-x, 4 = r--, 0 = ---.',
    examples: ['chmod +x script.sh', 'chmod 755 script.sh', 'chmod 600 secret.txt'],
    category: 'Permissions',
    keywords: ['permissions', 'mode', 'rwx', 'octal'],
  },
  {
    cmd: 'ps',
    short: 'List running processes',
    long: 'Shows the processes started in the current sandbox shell. Informational only — you cannot kill other sessions.',
    examples: ['ps'],
    category: 'Permissions',
    keywords: ['processes', 'list', 'running'],
  },

  // System
  {
    cmd: 'uname',
    short: 'Print system information',
    long: 'Prints the kernel name. `-a` includes the version, architecture and hostname.',
    examples: ['uname', 'uname -a'],
    category: 'System',
    keywords: ['system', 'kernel', 'info', 'version'],
  },
  {
    cmd: 'uptime',
    short: 'Show how long the system has been up',
    long: 'Prints a short uptime line. In the sandbox this is a simulated value.',
    examples: ['uptime'],
    category: 'System',
    keywords: ['uptime', 'load', 'time'],
  },
  {
    cmd: 'free',
    short: 'Show memory usage',
    long: 'Prints total, used and free memory. `-h` switches to human-readable units (K, M, G).',
    examples: ['free', 'free -h'],
    category: 'System',
    keywords: ['memory', 'ram', 'usage'],
  },
  {
    cmd: 'df',
    short: 'Show disk space usage',
    long: 'Reports the filesystem disk space usage. `-h` switches to human-readable units.',
    examples: ['df', 'df -h'],
    category: 'System',
    keywords: ['disk', 'space', 'storage', 'filesystem'],
  },
  {
    cmd: 'whoami',
    short: 'Print the current user',
    long: 'Writes your current username. In the sandbox you are always `learner`.',
    examples: ['whoami'],
    category: 'System',
    keywords: ['user', 'current', 'identity'],
  },
  {
    cmd: 'hostname',
    short: 'Print the system hostname',
    long: 'Writes the name of the current machine.',
    examples: ['hostname'],
    category: 'System',
    keywords: ['host', 'machine', 'name'],
  },
  {
    cmd: 'date',
    short: 'Show the current date and time',
    long: 'Prints the current local date and time.',
    examples: ['date'],
    category: 'System',
    keywords: ['date', 'time', 'clock'],
  },
  {
    cmd: 'clear',
    short: 'Clear the terminal',
    long: 'Scrolls the terminal so the prompt sits at the top of the visible area. Shortcut: Ctrl+L.',
    examples: ['clear'],
    category: 'System',
    keywords: ['clear', 'reset', 'screen'],
  },
  {
    cmd: 'help',
    short: 'List available commands',
    long: 'Prints the full list of sandbox commands with one-line descriptions.',
    examples: ['help'],
    category: 'Help',
    keywords: ['help', 'list', 'commands'],
  },
  {
    cmd: 'top',
    short: 'Show running processes (read-only)',
    long: 'In the sandbox this prints a static snapshot of process activity. The full interactive `top` is not available in the in-browser shell.',
    examples: ['top'],
    category: 'Help',
    keywords: ['top', 'processes', 'monitor', 'tasks'],
  },
];

export const CHEAT_CATEGORIES: CheatCategory[] = [
  'Navigation',
  'Files',
  'Inspection',
  'Editing',
  'Permissions',
  'System',
  'Help',
];

export function cheatMatches(entry: CheatEntry, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystack = [
    entry.cmd,
    entry.short,
    entry.long,
    entry.category,
    ...entry.examples,
    ...entry.keywords,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}
