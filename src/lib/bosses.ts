/**
 * Boss levels — multi-step, multi-command challenges for learners who
 * have finished the regular catalogue. Each boss is a scripted scenario
 * that runs against the in-browser shell. Progress is tracked
 * client-side via the localStorage progress store.
 *
 * Verification is intentionally conservative: the sandbox evaluates
 * the candidate command in a fresh, pre-populated virtual filesystem
 * and then asserts on the resulting state (or on the command itself,
 * for stubs like `chmod` that do not mutate the FS). This avoids any
 * server dependency and keeps the feature fully static-export friendly.
 */

import type { FsDir, FsFile, FsNode } from './shell/fs';

/** The shape of the shell state we hand to verifiers. */
export interface BossState {
  fs: FsNode;
  cwd: string;
  output: string;
  command: string;
}

export interface BossStep {
  /** Short label shown in the UI. */
  title: string;
  /** Markdown prompt explaining what to do. */
  prompt: string;
  /** Optional hint. */
  hint?: string;
  /**
   * Pure-function verifier. Receives the state *after* the user's
   * command was evaluated and returns a verdict.
   */
  verify: (state: BossState) => { ok: boolean; message: string };
}

export interface BossLevel {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'intermediate' | 'advanced';
  order: number;
  /** Initial seed for the in-memory VFS. */
  seedVfs: (root: FsDir) => void;
  steps: BossStep[];
}

// ───────────────────────────────────────── tiny path helper ──

function splitPath(p: string): string[] {
  return p.split('/').filter((s) => s.length > 0);
}

function getNode(root: FsDir, path: string): FsNode | undefined {
  if (path === '/' || path === '') return root;
  const parts = splitPath(path);
  let node: FsNode | undefined = root;
  for (const part of parts) {
    if (!node || node.type !== 'dir') return undefined;
    const child: FsNode | undefined = node.children[part];
    if (!child) return undefined;
    node = child;
  }
  return node;
}

function fileExists(root: FsDir, path: string) {
  const n = getNode(root, path);
  return !!n && n.type === 'file';
}

function dirExists(root: FsDir, path: string) {
  const n = getNode(root, path);
  return !!n && n.type === 'dir';
}

function readFile(root: FsDir, path: string): string | null {
  const n = getNode(root, path);
  if (!n || n.type !== 'file') return null;
  return n.content ?? '';
}

function normalize(cmd: string): string {
  return cmd.replace(/\s+/g, ' ').trim();
}

// ───────────────────────────────────────── boss library ──

export const BOSS_LEVELS: BossLevel[] = [
  {
    id: 'recover-the-server',
    slug: 'recover-the-server',
    title: 'Recover the server',
    description:
      'A service config got clobbered. Restore the right file contents, fix permissions, and confirm the service can start.',
    difficulty: 'intermediate',
    order: 1,
    seedVfs: (root) => {
      const etc = getNode(root, '/etc') as FsDir | undefined;
      const usrLocalBin = getNode(root, '/usr/local/bin') as FsDir | undefined;
      if (!etc || !usrLocalBin) return;
      const broken: FsFile = { type: 'file', content: 'PORT=__FILL_ME__\n' };
      const backup: FsFile = {
        type: 'file',
        content: 'PORT=8080\nLOG_LEVEL=info\n',
      };
      const ctl: FsFile = {
        type: 'file',
        content: '#!/bin/sh\necho "starting"\n',
      };
      etc.children['myapp.conf'] = broken;
      etc.children['myapp.conf.bak'] = backup;
      usrLocalBin.children['myapp-ctl'] = ctl;
    },
    steps: [
      {
        title: 'Inspect the broken config',
        prompt:
          'Use `cat` to look at `/etc/myapp.conf` and confirm it is broken. Try also reading `/etc/myapp.conf.bak` to see what the good values look like.',
        verify: ({ command, output }) => {
          const c = normalize(command).toLowerCase();
          if (!(c === 'cat /etc/myapp.conf' || c === 'cat /etc/myapp.conf.bak')) {
            return {
              ok: false,
              message: 'Try `cat /etc/myapp.conf` or `cat /etc/myapp.conf.bak`.',
            };
          }
          if (!/__FILL_ME__|PORT=8080|LOG_LEVEL/.test(output)) {
            return {
              ok: false,
              message: 'The output did not look like a config file. Try again.',
            };
          }
          return { ok: true, message: 'Confirmed: the backup has the right values.' };
        },
      },
      {
        title: 'Restore the config',
        prompt:
          'Overwrite `/etc/myapp.conf` with the contents of `/etc/myapp.conf.bak`. You can do it in a single command with `cp`.',
        verify: ({ command, fs }) => {
          if (!normalize(command).toLowerCase().startsWith('cp ')) {
            return { ok: false, message: 'Use `cp` to copy the backup over the file.' };
          }
          const root = fs as FsDir;
          const content = readFile(root, '/etc/myapp.conf') ?? '';
          if (content.includes('__FILL_ME__') || !content.includes('PORT=8080')) {
            return {
              ok: false,
              message:
                'The file still looks wrong. Try `cp /etc/myapp.conf.bak /etc/myapp.conf`.',
            };
          }
          return { ok: true, message: 'Config restored.' };
        },
      },
      {
        title: 'Make the control script executable',
        prompt:
          'The `/usr/local/bin/myapp-ctl` script needs the executable bit. Run `chmod` on it (the sandbox is simulated, so we just check your command).',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('chmod ')) {
            return { ok: false, message: 'Use `chmod` to set the executable bit.' };
          }
          if (!c.includes('/usr/local/bin/myapp-ctl')) {
            return {
              ok: false,
              message: 'Make sure you target `/usr/local/bin/myapp-ctl`.',
            };
          }
          if (!/\+x/.test(c) && !/\b7[0-7]{2}\b/.test(c)) {
            return {
              ok: false,
              message: 'Set the executable bit (e.g. `chmod +x ...` or `chmod 755 ...`).',
            };
          }
          return { ok: true, message: 'Permissions set.' };
        },
      },
      {
        title: 'Clean up',
        prompt:
          'Remove the backup file at `/etc/myapp.conf.bak` since it is no longer needed.',
        verify: ({ command, fs }) => {
          if (!normalize(command).toLowerCase().startsWith('rm ')) {
            return { ok: false, message: 'Use `rm` to delete the backup.' };
          }
          if (fileExists(fs as FsDir, '/etc/myapp.conf.bak')) {
            return {
              ok: false,
              message: 'The backup is still there. Try `rm /etc/myapp.conf.bak`.',
            };
          }
          return { ok: true, message: 'Backup removed. Service recovered.' };
        },
      },
    ],
  },
  {
    id: 'organize-the-mess',
    slug: 'organize-the-mess',
    title: 'Organize the mess',
    description:
      'A flat folder of log files needs to be sorted into `archive/` and `errors/`. Use the tools you know.',
    difficulty: 'intermediate',
    order: 2,
    seedVfs: (root) => {
      const home = getNode(root, '/home/learner') as FsDir | undefined;
      if (!home) return;
      const logs: FsDir = { type: 'dir', children: {} };
      home.children['logs'] = logs;
      const seedFiles: { name: string; content: string }[] = [
        { name: 'app-2024-01.log', content: 'INFO boot\nINFO ready\n' },
        { name: 'app-2024-02.log', content: 'INFO boot\nERROR disk full\n' },
        { name: 'app-2024-03.log', content: 'INFO boot\nINFO ready\n' },
        { name: 'app-2024-04.log', content: 'INFO boot\nERROR oom\n' },
      ];
      for (const f of seedFiles) {
        logs.children[f.name] = { type: 'file', content: f.content };
      }
    },
    steps: [
      {
        title: 'List the logs',
        prompt: 'Use `ls /home/learner/logs` to see what is in there.',
        verify: ({ command, output }) => {
          if (!normalize(command).toLowerCase().startsWith('ls ')) {
            return { ok: false, message: 'Try `ls /home/learner/logs`.' };
          }
          if (!/app-2024-/.test(output)) {
            return {
              ok: false,
              message: 'The listing did not look right. Try again.',
            };
          }
          return { ok: true, message: 'Found the log files.' };
        },
      },
      {
        title: 'Create the destination folders',
        prompt:
          'Create two directories inside `/home/learner/logs`: `archive` and `errors`.',
        verify: ({ command, fs }) => {
          if (!normalize(command).toLowerCase().startsWith('mkdir ')) {
            return { ok: false, message: 'Use `mkdir`.' };
          }
          const root = fs as FsDir;
          if (!dirExists(root, '/home/learner/logs/archive')) {
            return { ok: false, message: 'Missing `archive/` directory.' };
          }
          if (!dirExists(root, '/home/learner/logs/errors')) {
            return { ok: false, message: 'Missing `errors/` directory.' };
          }
          return { ok: true, message: 'Both directories created.' };
        },
      },
      {
        title: 'Find the error logs',
        prompt:
          'Find the log lines that contain the word "ERROR". Try `grep ERROR /home/learner/logs`.',
        verify: ({ command, output }) => {
          if (!normalize(command).toLowerCase().startsWith('grep ')) {
            return { ok: false, message: 'Try `grep ERROR /home/learner/logs`.' };
          }
          if (!/ERROR/.test(output)) {
            return {
              ok: false,
              message: 'Did not see "ERROR" in the output. Try a different pattern.',
            };
          }
          return { ok: true, message: 'Found the error lines.' };
        },
      },
      {
        title: 'Move the error logs into errors/',
        prompt:
          'Move `app-2024-02.log` and `app-2024-04.log` (the two error logs) into `/home/learner/logs/errors/`. You can issue two `mv` commands in one step separated by `&&`.',
        verify: ({ command, fs }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('mv ')) {
            return { ok: false, message: 'Use `mv` to move the files.' };
          }
          const root = fs as FsDir;
          if (!fileExists(root, '/home/learner/logs/errors/app-2024-02.log')) {
            return {
              ok: false,
              message:
                'app-2024-02.log is not in errors/. Try `mv /home/learner/logs/app-2024-02.log /home/learner/logs/errors/`.',
            };
          }
          if (!fileExists(root, '/home/learner/logs/errors/app-2024-04.log')) {
            return {
              ok: false,
              message: 'app-2024-04.log is not in errors/ yet.',
            };
          }
          return { ok: true, message: 'Files moved.' };
        },
      },
    ],
  },
];

export function getBossBySlug(slug: string): BossLevel | undefined {
  return BOSS_LEVELS.find((b) => b.slug === slug);
}

export function getAllBosses(): BossLevel[] {
  return [...BOSS_LEVELS].sort((a, b) => a.order - b.order);
}
