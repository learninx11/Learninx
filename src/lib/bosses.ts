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
          'Move `app-2024-02.log` and `app-2024-04.log` (the two error logs) into `/home/learner/logs/errors/`. Each step here starts from a fresh sandbox, so make sure `errors/` exists first: chain `mkdir -p` and two `mv` commands together with `&&`.',
        verify: ({ command, fs }) => {
          const c = normalize(command).toLowerCase();
          if (!c.includes('mv ')) {
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
  {
    id: 'ship-the-deploy-script',
    slug: 'ship-the-deploy-script',
    title: 'Ship the deploy script',
    description:
      'A deploy script has a leftover debug flag, the wrong permissions, and has never been installed system-wide. Clean it up and ship it.',
    difficulty: 'advanced',
    order: 3,
    seedVfs: (root) => {
      const home = getNode(root, '/home/learner') as FsDir | undefined;
      if (!home) return;
      const scripts: FsDir = { type: 'dir', children: {} };
      home.children['scripts'] = scripts;
      scripts.children['deploy.sh'] = {
        type: 'file',
        content: '#!/bin/sh\nset -e\nDEBUG=1\necho "Deploying build..."\n',
      };
    },
    steps: [
      {
        title: 'Inspect the script',
        prompt:
          'Read `/home/learner/scripts/deploy.sh` with `cat` and see what it does before touching anything.',
        hint: 'cat /home/learner/scripts/deploy.sh',
        verify: ({ command, output }) => {
          const c = normalize(command).toLowerCase();
          if (c !== 'cat /home/learner/scripts/deploy.sh') {
            return { ok: false, message: 'Try `cat /home/learner/scripts/deploy.sh`.' };
          }
          if (!/DEBUG=1/.test(output) || !/Deploying build/.test(output)) {
            return { ok: false, message: 'That did not look like the script. Try again.' };
          }
          return { ok: true, message: 'Found a leftover DEBUG=1 flag — that should not ship.' };
        },
      },
      {
        title: 'Strip the debug flag',
        prompt:
          'Remove the `DEBUG=1` line. Pipe `sed` through `tee` to write the result back to the same file: `sed \'s/DEBUG=1//\' /home/learner/scripts/deploy.sh | tee /home/learner/scripts/deploy.sh`.',
        hint: "sed 's/DEBUG=1//' /home/learner/scripts/deploy.sh | tee /home/learner/scripts/deploy.sh",
        verify: ({ command, fs }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('sed ') || !c.includes('tee')) {
            return {
              ok: false,
              message: 'Use `sed` piped into `tee` so the fix is written back to the file.',
            };
          }
          const content = readFile(fs as FsDir, '/home/learner/scripts/deploy.sh') ?? '';
          if (content.includes('DEBUG=1')) {
            return { ok: false, message: 'DEBUG=1 is still in there.' };
          }
          if (!content.includes('Deploying build')) {
            return { ok: false, message: 'The rest of the script got clobbered — try again.' };
          }
          return { ok: true, message: 'Debug flag removed.' };
        },
      },
      {
        title: 'Make it executable',
        prompt: 'Give `/home/learner/scripts/deploy.sh` the executable bit with `chmod`.',
        hint: 'chmod +x /home/learner/scripts/deploy.sh',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('chmod ')) {
            return { ok: false, message: 'Use `chmod` to set the executable bit.' };
          }
          if (!c.includes('/home/learner/scripts/deploy.sh')) {
            return { ok: false, message: 'Target `/home/learner/scripts/deploy.sh`.' };
          }
          if (!/\+x/.test(c) && !/\b7[0-7]{2}\b/.test(c)) {
            return {
              ok: false,
              message: 'Set the executable bit (e.g. `chmod +x ...` or `chmod 755 ...`).',
            };
          }
          return { ok: true, message: 'Script is now executable.' };
        },
      },
      {
        title: 'Install it system-wide',
        prompt:
          'Use `install -D` to copy the script to `/usr/local/bin/deploy.sh`, creating any missing directories along the way.',
        hint: 'install -D /home/learner/scripts/deploy.sh /usr/local/bin/deploy.sh',
        verify: ({ command, fs }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('install ') || !c.includes('-d')) {
            return { ok: false, message: 'Use `install -D <source> <destination>`.' };
          }
          const root = fs as FsDir;
          if (!fileExists(root, '/usr/local/bin/deploy.sh')) {
            return {
              ok: false,
              message: 'Not installed yet — target `/usr/local/bin/deploy.sh`.',
            };
          }
          return { ok: true, message: 'Installed at /usr/local/bin/deploy.sh.' };
        },
      },
      {
        title: 'Clean up the source copy',
        prompt: 'Remove the original `/home/learner/scripts/deploy.sh` now that it is installed.',
        hint: 'rm /home/learner/scripts/deploy.sh',
        verify: ({ command, fs }) => {
          if (!normalize(command).toLowerCase().startsWith('rm ')) {
            return { ok: false, message: 'Use `rm` to delete the source copy.' };
          }
          if (fileExists(fs as FsDir, '/home/learner/scripts/deploy.sh')) {
            return { ok: false, message: 'The source copy is still there.' };
          }
          return { ok: true, message: 'Source cleaned up. Deploy script shipped.' };
        },
      },
    ],
  },
  {
    id: 'bring-the-service-back-online',
    slug: 'bring-the-service-back-online',
    title: 'Bring the service back online',
    description:
      'A systemd unit points at the wrong binary path. Fix the unit file, reload the daemon, and bring the service up.',
    difficulty: 'advanced',
    order: 4,
    seedVfs: (root) => {
      const etc = getNode(root, '/etc') as FsDir | undefined;
      if (!etc) return;
      const systemd: FsDir = { type: 'dir', children: {} };
      etc.children['systemd'] = systemd;
      const system: FsDir = { type: 'dir', children: {} };
      systemd.children['system'] = system;
      system.children['webapp.service'] = {
        type: 'file',
        content:
          '[Unit]\nDescription=Sample web application\n\n[Service]\nExecStart=/opt/webapp/wrongbin/webapp\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target\n',
      };
      const opt: FsDir = { type: 'dir', children: {} };
      root.children['opt'] = opt;
      const webapp: FsDir = { type: 'dir', children: {} };
      opt.children['webapp'] = webapp;
      const bin: FsDir = { type: 'dir', children: {} };
      webapp.children['bin'] = bin;
      bin.children['webapp'] = { type: 'file', content: '#!/bin/sh\necho "webapp listening on :8080"\n' };
    },
    steps: [
      {
        title: 'Read the unit file',
        prompt: 'Use `cat` on `/etc/systemd/system/webapp.service` and find what looks wrong.',
        hint: 'cat /etc/systemd/system/webapp.service',
        verify: ({ command, output }) => {
          if (normalize(command).toLowerCase() !== 'cat /etc/systemd/system/webapp.service') {
            return { ok: false, message: 'Try `cat /etc/systemd/system/webapp.service`.' };
          }
          if (!/ExecStart=/.test(output) || !/wrongbin/.test(output)) {
            return { ok: false, message: 'Look for the `ExecStart=` line.' };
          }
          return {
            ok: true,
            message: 'ExecStart points at "wrongbin" — the real binary lives under /opt/webapp/bin.',
          };
        },
      },
      {
        title: 'Fix the ExecStart path',
        prompt:
          'The binary actually lives at `/opt/webapp/bin/webapp`. Replace `wrongbin` with `bin` in the unit file and write the fix back with `sed` piped into `tee`.',
        hint: "sed 's/wrongbin/bin/' /etc/systemd/system/webapp.service | tee /etc/systemd/system/webapp.service",
        verify: ({ command, fs }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('sed ') || !c.includes('tee')) {
            return { ok: false, message: 'Use `sed` piped into `tee` to persist the fix.' };
          }
          const content = readFile(fs as FsDir, '/etc/systemd/system/webapp.service') ?? '';
          if (content.includes('wrongbin')) {
            return { ok: false, message: '"wrongbin" is still in there.' };
          }
          if (!content.includes('/opt/webapp/bin/webapp')) {
            return { ok: false, message: 'ExecStart should now point at /opt/webapp/bin/webapp.' };
          }
          return { ok: true, message: 'ExecStart now points at the right binary.' };
        },
      },
      {
        title: 'Reload systemd',
        prompt: 'Unit files only take effect after a `systemctl daemon-reload`.',
        hint: 'systemctl daemon-reload',
        verify: ({ command }) => {
          if (normalize(command).toLowerCase() !== 'systemctl daemon-reload') {
            return { ok: false, message: 'Run `systemctl daemon-reload`.' };
          }
          return { ok: true, message: 'Systemd picked up the new unit file.' };
        },
      },
      {
        title: 'Enable and start it',
        prompt: 'Enable `webapp` so it survives reboots, and start it now.',
        hint: 'systemctl enable --now webapp',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.includes('systemctl') || !c.includes('webapp')) {
            return { ok: false, message: 'Use `systemctl` on the `webapp` unit.' };
          }
          if (!c.includes('enable')) {
            return { ok: false, message: 'You need `enable` so it starts on boot too.' };
          }
          if (!c.includes('start') && !c.includes('--now')) {
            return { ok: false, message: 'Add `start` (or `--now`) to bring it up immediately.' };
          }
          return { ok: true, message: 'Service enabled and started.' };
        },
      },
      {
        title: "Confirm it's running",
        prompt: 'Check the service status to confirm it actually came up.',
        hint: 'systemctl status webapp',
        verify: ({ command, output }) => {
          const c = normalize(command).toLowerCase();
          if (!c.includes('systemctl') || !c.includes('status') || !c.includes('webapp')) {
            return { ok: false, message: 'Run `systemctl status webapp`.' };
          }
          if (!/active \(running\)/.test(output)) {
            return { ok: false, message: 'Did not see it reported as running.' };
          }
          return { ok: true, message: 'Service recovered and running. Boss cleared.' };
        },
      },
    ],
  },
  {
    id: 'fix-the-permission-puzzle',
    slug: 'fix-the-permission-puzzle',
    title: 'Fix the permission puzzle',
    description:
      'A shared deploy folder has the wrong owner, an unrunnable script, a too-open secrets file, and a stray scratch file. Tighten it up.',
    difficulty: 'intermediate',
    order: 5,
    seedVfs: (root) => {
      const srv: FsDir = { type: 'dir', children: {} };
      root.children['srv'] = srv;
      const deploy: FsDir = { type: 'dir', children: {} };
      srv.children['deploy'] = deploy;
      deploy.children['run.sh'] = { type: 'file', content: '#!/bin/sh\necho "deploying"\n' };
      deploy.children['secrets.env'] = {
        type: 'file',
        content: 'API_KEY=not-a-real-secret\n',
      };
      deploy.children['tmp.bak'] = {
        type: 'file',
        content: 'stale scratch file, safe to delete\n',
      };
    },
    steps: [
      {
        title: 'Survey the directory',
        prompt: 'List `/srv/deploy` in long form to see what is in there.',
        hint: 'ls -l /srv/deploy',
        verify: ({ command, output }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('ls ') || !c.includes('-l') || !c.includes('/srv/deploy')) {
            return { ok: false, message: 'Try `ls -l /srv/deploy`.' };
          }
          if (!/run\.sh/.test(output) || !/secrets\.env/.test(output)) {
            return { ok: false, message: 'That listing did not look right.' };
          }
          return { ok: true, message: 'Three files: run.sh, secrets.env, tmp.bak.' };
        },
      },
      {
        title: 'Hand ownership to the deploy group',
        prompt: 'The `deploy` team needs group ownership of `run.sh`. Use `chown` to set its group to `deploy`.',
        hint: 'chown :deploy /srv/deploy/run.sh',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('chown ')) {
            return { ok: false, message: 'Use `chown` to change the group.' };
          }
          if (!c.includes('/srv/deploy/run.sh')) {
            return { ok: false, message: 'Target `/srv/deploy/run.sh`.' };
          }
          if (!c.includes('deploy')) {
            return { ok: false, message: 'Set the group to `deploy` (e.g. `chown :deploy ...`).' };
          }
          return { ok: true, message: 'Group ownership updated.' };
        },
      },
      {
        title: 'Let the deploy group execute it',
        prompt: 'Add the group-execute bit to `run.sh` so `deploy` group members can run it.',
        hint: 'chmod g+x /srv/deploy/run.sh',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('chmod ') || !c.includes('/srv/deploy/run.sh')) {
            return { ok: false, message: 'Use `chmod` on `/srv/deploy/run.sh`.' };
          }
          if (!/g\+x/.test(c) && !/\b7[57]0\b/.test(c) && !/\b7[57]5\b/.test(c)) {
            return {
              ok: false,
              message: 'Grant group execute (e.g. `chmod g+x ...` or `chmod 750 ...`).',
            };
          }
          return { ok: true, message: 'The deploy group can now execute run.sh.' };
        },
      },
      {
        title: 'Lock down the secrets file',
        prompt: '`secrets.env` should only be readable by its owner. Set it to `600`.',
        hint: 'chmod 600 /srv/deploy/secrets.env',
        verify: ({ command }) => {
          const c = normalize(command).toLowerCase();
          if (!c.startsWith('chmod ') || !c.includes('/srv/deploy/secrets.env')) {
            return { ok: false, message: 'Use `chmod` on `/srv/deploy/secrets.env`.' };
          }
          if (!/\b600\b/.test(c) && !/go-rwx/.test(c) && !/go=/.test(c)) {
            return { ok: false, message: 'Restrict it to owner-only (e.g. `chmod 600 ...`).' };
          }
          return { ok: true, message: 'Secrets file locked down.' };
        },
      },
      {
        title: 'Sweep away the stray scratch file',
        prompt: 'Remove the leftover `/srv/deploy/tmp.bak`.',
        hint: 'rm /srv/deploy/tmp.bak',
        verify: ({ command, fs }) => {
          if (!normalize(command).toLowerCase().startsWith('rm ')) {
            return { ok: false, message: 'Use `rm` to delete the stray file.' };
          }
          if (fileExists(fs as FsDir, '/srv/deploy/tmp.bak')) {
            return { ok: false, message: 'tmp.bak is still there.' };
          }
          return { ok: true, message: 'Cleaned up. Permission puzzle solved.' };
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
