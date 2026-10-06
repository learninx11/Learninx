// Learninx shell evaluator — a small in-browser teaching sandbox.
//
// Adds many common Linux commands and supports `;`, `&&`, `||` chains
// as well as `|` pipes between commands. Commands accept piped stdin
// via a `__STDIN__:<text>` placeholder arg that the runStatement layer
// injects when the previous command produced output.

import type { FsDir, FsNode } from './fs';
import { runGcloud } from './gcloud';

export interface ShellContext {
  cwd: string;
  fs: FsNode;
  user: string;
  host: string;
  history: string[];
  env: Record<string, string>;
  /** Latest piped stdin from the previous stage of a pipeline. */
  __lastStdin?: string;
  /** Commands run with a trailing `&`, recorded for `jobs` / `fg` / `bg`. */
  jobs?: { id: number; pid: number; cmd: string }[];
}

export interface CommandSpec {
  name: string;
  summary: string;
  run: (args: string[], ctx: ShellContext) => string | string[] | null;
}

// ───────────────────────────────────────────────────────── helpers ──

function joinPath(cwd: string, target: string): string {
  if (!target) return cwd;
  if (target.startsWith('/')) return normalize(target);
  if (target.startsWith('~')) {
    return normalize(target.replace(/^~/, '/home/learner'));
  }
  return normalize(`${cwd}/${target}`);
}

function normalize(p: string): string {
  const parts = p.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return '/' + stack.join('/');
}

function resolveNode(ctx: ShellContext, path: string): FsNode | null {
  const abs = joinPath(ctx.cwd, path);
  const parts = abs.split('/').filter(Boolean);
  let node: FsNode | undefined = ctx.fs;
  for (const part of parts) {
    if (!node || node.type !== 'dir') return null;
    node = node.children[part];
  }
  return node ?? null;
}

function resolveParent(
  ctx: ShellContext,
  path: string,
): { parent: FsDir; name: string } | null {
  const abs = joinPath(ctx.cwd, path);
  const parts = abs.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name) return null;
  let node: FsNode | undefined = ctx.fs;
  for (const part of parts) {
    if (!node || node.type !== 'dir') return null;
    node = node.children[part];
  }
  return node && node.type === 'dir' ? { parent: node, name } : null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(glob: string): RegExp {
  let re = '^';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') re += '.*';
    else if (c === '?') re += '.';
    else if (c === '.') re += '\\.';
    else re += escapeRegex(c);
  }
  return new RegExp(re + '$');
}

function globMatch(glob: string, name: string): boolean {
  return globToRegex(glob).test(name);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

// Shared fallback body for `nano` / `vi` / `vim` / `pico` / `emacs` and the
// pagers `less` / `more`. `less`/`more` always land here — a pager has no
// "real" interactive mode in this sandbox. The five editors only land here
// when they *can't* be a real full-screen session: piped, chained, or
// missing a filename (Terminal.tsx's openEditor() handles the normal case
// of a bare `nano file.txt` directly, for real). Either way we print a
// TUI-styled preview of the file plus a footer pointing at the sandbox
// commands that actually edit it non-interactively.
function editorStub(
  editor: 'nano' | 'vi' | 'vim' | 'pico' | 'emacs' | 'less' | 'more',
  args: string[],
  ctx: ShellContext,
): string {
  const targets = args.filter((a) => !a.startsWith('-'));
  if (targets.length === 0) return `${editor}: missing file operand`;
  const out: string[] = [];
  for (const target of targets) {
    const node = resolveNode(ctx, target);
    if (!node) {
      out.push(`${editor}: ${target}: No such file or directory`);
      continue;
    }
    if (node.type === 'dir') {
      out.push(`${editor}: ${target}: Is a directory`);
      continue;
    }
    const abs = joinPath(ctx.cwd, target);
    const content = node.content;
    const lines = content === '' ? [''] : content.split('\n');
    const width = 40;
    const title = `  GNU Learninx ${editor}  `;
    const titleBar = `┌${'─'.repeat(width - 2)}┐`;
    const headerLine = `│${title.padEnd(width - 2, ' ')}│`;
    const footer = `└${'─'.repeat(width - 2)}┘`;

    out.push('');
    out.push(titleBar);
    out.push(headerLine);
    out.push(`│  File: ${truncate(abs, width - 11).padEnd(width - 11, ' ')}  │`);
    out.push(footer);
    out.push('');
    lines.forEach((line, i) => {
      out.push(`  ${String(i + 1).padStart(3, ' ')}  ${line}`);
    });
    out.push('');
    out.push('─'.repeat(width));
    if (editor === 'less' || editor === 'more') {
      out.push(`${editor}: this is a safe in-browser sandbox — real ${editor} needs a TTY.`);
    } else {
      out.push(
        `${editor}: run \`${editor} ${target}\` on its own, with nothing piped in or chained after it, for the real editor.`,
      );
    }
    out.push(
      'To edit this file without it, use one of:',
    );
    out.push(`  echo "your text" > ${abs}        # overwrite`);
    out.push(`  echo "more" >> ${abs}            # append`);
    out.push(`  printf 'line1\\nline2\\n' > ${abs}  # multi-line, one command`);
    out.push(`  sed 's/old/new/' ${abs} | tee ${abs}  # find-and-replace, written back`);
    out.push('');
  }
  return out.join('\n');
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : '…' + s.slice(s.length - (max - 1));
}

function writeFile(ctx: ShellContext, path: string, content: string): boolean {
  const loc = resolveParent(ctx, path);
  if (!loc) return false;
  loc.parent.children[loc.name] = { type: 'file', content };
  return true;
}

// Like `mkdir -p`, but returns the resulting directory node instead of an
// error string. Used by commands (e.g. `apt`) that need a well-known
// directory to exist before writing state into it.
function ensureDir(ctx: ShellContext, path: string): FsDir {
  const parts = joinPath(ctx.cwd, path).split('/').filter(Boolean);
  let cursor: FsNode = ctx.fs;
  for (const part of parts) {
    if (cursor.type !== 'dir') break;
    let next: FsNode | undefined = cursor.children[part];
    if (!next) {
      next = { type: 'dir', children: {} };
      cursor.children[part] = next;
    }
    cursor = next;
  }
  return cursor as FsDir;
}

// ── simulated `git` ──
// A real (if simplified) version-control model: `.git/` lives in whatever
// directory `git init` was run in — repo commands only work from that
// exact directory, the same way real git only works inside a repo (we
// just skip its parent-directory search for simplicity). Commits store a
// FULL snapshot of every tracked file rather than a delta/tree/blob
// object graph — a real simplification, but one that keeps init / add /
// status / commit / log / branch / checkout / diff all genuinely correct
// relative to each other, which is what a lesson actually needs.
interface GitCommit {
  id: string;
  parent: string | null;
  message: string;
  author: string;
  date: string;
  files: Record<string, string>;
}

function gitDir(ctx: ShellContext): FsDir | null {
  const node = resolveNode(ctx, '.git');
  return node && node.type === 'dir' ? node : null;
}

function gitReadFile(ctx: ShellContext, path: string): string | null {
  const node = resolveNode(ctx, path);
  return node && node.type === 'file' ? node.content : null;
}

function gitCurrentBranch(ctx: ShellContext): string {
  return (gitReadFile(ctx, '.git/HEAD') ?? 'main').trim();
}

function gitRefCommit(ctx: ShellContext, branch: string): string | null {
  const content = gitReadFile(ctx, `.git/refs/${branch}`);
  const trimmed = content?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function gitReadIndex(ctx: ShellContext): Record<string, string> {
  try {
    return JSON.parse(gitReadFile(ctx, '.git/index') ?? '{}');
  } catch {
    return {};
  }
}

function gitWriteIndex(ctx: ShellContext, index: Record<string, string>): void {
  writeFile(ctx, '.git/index', JSON.stringify(index));
}

function gitReadCommit(ctx: ShellContext, id: string): GitCommit | null {
  try {
    const raw = gitReadFile(ctx, `.git/commits/${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function gitWalkWorkingFiles(node: FsNode, prefix: string): Record<string, string> {
  if (node.type !== 'dir') return {};
  let out: Record<string, string> = {};
  for (const [name, child] of Object.entries(node.children)) {
    if (name === '.git') continue;
    const path = prefix ? `${prefix}/${name}` : name;
    if (child.type === 'file') out[path] = child.content;
    else out = { ...out, ...gitWalkWorkingFiles(child, path) };
  }
  return out;
}

function pseudoId(seed: string): string {
  return (djb2(seed) + fnv1a(seed)).slice(0, 7);
}

// ── simulated `docker` ──
// A single JSON "daemon state" file under /var/lib/docker/state.json
// holds images and containers, in docker's own vocabulary — pulled
// images, and containers created from them. It's a genuine, consistent
// simplification of the real thing: no actual process isolation or
// layered filesystem, just the bookkeeping docker itself keeps.
interface DockerImage {
  repo: string;
  tag: string;
  id: string;
  size: string;
}
interface DockerContainer {
  id: string;
  name: string;
  image: string;
  command: string;
  status: 'running' | 'exited';
  createdAt: number;
}
interface DockerState {
  images: DockerImage[];
  containers: DockerContainer[];
}

const DOCKER_HUB_CATALOG: Record<string, { size: string }> = {
  alpine: { size: '7.8MB' },
  ubuntu: { size: '77.8MB' },
  nginx: { size: '187MB' },
  node: { size: '1.1GB' },
  python: { size: '1.02GB' },
  redis: { size: '138MB' },
  postgres: { size: '412MB' },
  busybox: { size: '4.3MB' },
};

const DOCKER_STATE_PATH = '/var/lib/docker/state.json';

function dockerReadState(ctx: ShellContext): DockerState {
  const node = resolveNode(ctx, DOCKER_STATE_PATH);
  if (node && node.type === 'file') {
    try {
      return JSON.parse(node.content);
    } catch {
      /* fall through to a fresh state */
    }
  }
  return { images: [], containers: [] };
}

function dockerWriteState(ctx: ShellContext, state: DockerState): void {
  ensureDir(ctx, '/var/lib/docker');
  writeFile(ctx, DOCKER_STATE_PATH, JSON.stringify(state));
}

function dockerParseImageRef(ref: string): { repo: string; tag: string } {
  const [repo, tag] = ref.split(':');
  return { repo, tag: tag ?? 'latest' };
}

function dockerPullImage(ctx: ShellContext, ref: string): { image: DockerImage; lines: string[]; alreadyPresent: boolean } | null {
  const { repo, tag } = dockerParseImageRef(ref);
  if (!(repo in DOCKER_HUB_CATALOG)) return null;
  const state = dockerReadState(ctx);
  const existing = state.images.find((i) => i.repo === repo && i.tag === tag);
  const lines = [
    `${tag}: Pulling from library/${repo}`,
    `${pseudoSha256(repo + tag + 'layer1').slice(0, 12)}: Pull complete`,
    `${pseudoSha256(repo + tag + 'layer2').slice(0, 12)}: Pull complete`,
    `Digest: sha256:${pseudoSha256(repo + tag)}`,
    `Status: Downloaded newer image for ${repo}:${tag}`,
  ];
  if (existing) return { image: existing, lines, alreadyPresent: true };
  const image: DockerImage = {
    repo,
    tag,
    id: pseudoSha256(repo + tag + Date.now()).slice(0, 12),
    size: DOCKER_HUB_CATALOG[repo].size,
  };
  state.images.push(image);
  dockerWriteState(ctx, state);
  return { image, lines, alreadyPresent: false };
}

// ── simulated `zip` archive format ──
// Same approach as `tar` elsewhere in this file: a real archive format
// isn't feasible in a browser sandbox with no binary compression
// library, so entries are stored as a JSON manifest, base64-encoded and
// tagged so `unzip` can only read archives this sandbox itself created —
// exactly like the existing LEARNINX_TAR_V1 format.
function zipWalkEntries(name: string, node: FsNode): { name: string; node: FsNode }[] {
  if (node.type === 'file') return [{ name, node }];
  const out: { name: string; node: FsNode }[] = [];
  for (const [child, cnode] of Object.entries(node.children)) {
    out.push(...zipWalkEntries(`${name}/${child}`, cnode));
  }
  return out;
}

// ── simulated `apt` package catalogue ──
// A small, fixed set of well-known packages. "Installing" a package writes
// a marker file under /var/lib/dpkg/info/<pkg>.list — the same directory
// real Debian/Ubuntu systems use to track installed files — so
// `apt list --installed` reflects genuine (simulated) state instead of
// just printing canned text.
const APT_CATALOG: Record<string, string> = {
  curl: '7.81.0-1ubuntu1.15',
  git: '1:2.34.1-1ubuntu1.10',
  nginx: '1.18.0-6ubuntu14.4',
  htop: '3.0.5-7build2',
  tree: '2.0.2-1',
  vim: '2:8.2.3995-1ubuntu2.15',
  wget: '1.21.2-2ubuntu1',
  'build-essential': '12.9ubuntu3',
};

// Deterministic pseudo-IP in the documentation range (203.0.113.0/24) derived
// from a hostname, so `dig`/`nslookup`/`traceroute` resolve the same host to
// the same address every time without modeling real DNS.
function pseudoIp(host: string): string {
  const h = Math.abs(hashCode(host));
  return `203.0.113.${h % 256}`;
}

// A small fixed process table shared by `pgrep`, `pkill`, and `killall` —
// distinct from `ps aux`'s own canned output, but plausible in the same way.
const SIM_PROCESSES: { pid: number; user: string; cmd: string }[] = [
  { pid: 1, user: 'root', cmd: '/sbin/init' },
  { pid: 1284, user: 'learner', cmd: 'bash' },
  { pid: 4821, user: 'www-data', cmd: 'nginx: master process' },
  { pid: 4822, user: 'www-data', cmd: 'nginx: worker process' },
  { pid: 5310, user: 'learner', cmd: 'node server.js' },
];

// Real Linux commands this sandbox recognizes by name but does not simulate
// in behavioral depth — everything from other distros' package managers to
// compilers, container tooling, and archive formats beyond tar/gzip. Typing
// one of these still "runs" (see `resolveCommand`/`genericCommandStub`
// below) instead of failing with "command not found", which is reserved
// for genuine typos and made-up commands.
const KNOWN_UNSIMULATED_COMMANDS = new Set([
  // coreutils / shell builtins not otherwise implemented
  'seq', 'shuf', 'comm', 'expand', 'unexpand', 'fmt', 'fold', 'column', 'split', 'csplit',
  'nice', 'renice', 'ionice', 'chgrp', 'umask', 'alias', 'unalias', 'type', 'command', 'hash',
  'declare', 'local', 'readonly', 'unset', 'shift', 'getopts', 'trap', 'wait', 'test', 'expr', 'bc', 'cal',
  'timeout', 'watch', 'script', 'tput', 'stty', 'tty', 'reset', 'info', 'apropos', 'whatis',
  'dirs', 'pushd', 'popd', 'fc', 'printenv', 'dd', 'sync', 'shred',
  // filesystem attributes / ACLs
  'chattr', 'lsattr', 'setfacl', 'getfacl',
  // hardware / low-level system info
  'lsusb', 'lspci', 'dmidecode', 'hwclock', 'lsmod', 'modprobe', 'insmod', 'rmmod',
  // systemd companions
  'timedatectl', 'hostnamectl', 'localectl', 'loginctl', 'machinectl', 'systemd-analyze',
  // legacy / alternate service management
  'service', 'chkconfig', 'update-rc.d', 'reboot', 'shutdown', 'poweroff', 'halt', 'init', 'telinit', 'runlevel',
  // users & sessions
  'w', 'users', 'finger', 'chsh', 'chfn', 'newgrp', 'gpasswd', 'groupadd', 'groupdel', 'groupmod',
  // sandboxing / low-level debugging
  'chroot', 'unshare', 'nsenter', 'strace', 'ltrace', 'gdb', 'valgrind', 'perf',
  'ldd', 'nm', 'objdump', 'readelf', 'ar', 'strip', 'size', 'addr2line',
  // archive formats beyond tar/gzip/zip
  '7z', '7za', 'rar', 'unrar', 'bzip2', 'bunzip2', 'xz', 'unxz', 'zstd', 'unzstd', 'lz4', 'cpio',
  // networking extras
  'telnet', 'nc', 'netcat', 'ncat', 'rsync', 'scp', 'sftp', 'ftp', 'whois', 'host', 'arp', 'route',
  'iw', 'iwconfig', 'nmcli', 'nmtui', 'resolvectl', 'tcpdump', 'wireshark', 'tshark', 'iperf', 'iperf3', 'mtr', 'arping', 'ethtool',
  // package managers (other distros / ecosystems)
  'yum', 'dnf', 'pacman', 'zypper', 'snap', 'flatpak', 'brew', 'pip', 'pip3', 'gem', 'npm', 'npx', 'yarn', 'pnpm',
  // dev tools, compilers, and language runtimes (git is simulated for real — see COMMANDS.git)
  'svn', 'hg', 'python', 'python3', 'node', 'java', 'javac', 'gcc', 'g++', 'cc', 'clang',
  'make', 'cmake', 'ninja', 'perl', 'ruby', 'php', 'rustc', 'cargo', 'go', 'kotlinc', 'swift', 'dotnet',
  // containers, orchestration, and cloud CLIs (docker and gcloud are simulated for real — see COMMANDS)
  'docker-compose', 'podman', 'kubectl', 'helm', 'terraform', 'ansible', 'ansible-playbook', 'vagrant', 'aws', 'az',
  // monitoring & terminal multiplexers
  'htop', 'glances', 'screen', 'tmux', 'byobu', 'iftop', 'nethogs', 'iotop', 'atop',
  // small extras people inevitably try
  'figlet', 'cowsay', 'fortune', 'xdg-open', 'open', 'banner',
]);

function genericCommandStub(cmd: string, args: string[]): string {
  const argStr = args.length ? ` ${args.join(' ')}` : '';
  return (
    `${cmd}${argStr}\n` +
    `'${cmd}' is a real Linux command, but this sandbox doesn't simulate its behavior in depth. ` +
    "Run `help` to see every command with full simulated behavior, or try it on a real Linux machine or WSL to see its actual output."
  );
}

// Looks up a command's implementation: a fully simulated one from COMMANDS
// if it exists, otherwise a generic stub for any name in
// KNOWN_UNSIMULATED_COMMANDS, otherwise undefined (a genuine "not found").
function resolveCommand(cmd: string): CommandSpec | undefined {
  const real = COMMANDS[cmd];
  if (real) return real;
  if (KNOWN_UNSIMULATED_COMMANDS.has(cmd)) {
    return { name: cmd, summary: 'recognized, not deeply simulated', run: (args) => genericCommandStub(cmd, args) };
  }
  return undefined;
}

function dpkgInfoDir(ctx: ShellContext): FsDir | null {
  const node = resolveNode(ctx, '/var/lib/dpkg/info');
  return node && node.type === 'dir' ? node : null;
}

function isPackageInstalled(ctx: ShellContext, pkg: string): boolean {
  const dir = dpkgInfoDir(ctx);
  return !!dir && `${pkg}.list` in dir.children;
}

// Recursively list every file/dir path contained in a node, relative to
// `name` — used by `tar -t` to print an archive's manifest.
function walkArchivePaths(name: string, node: FsNode): string[] {
  if (node.type === 'file') return [name];
  const out = [`${name}/`];
  for (const [child, cnode] of Object.entries(node.children)) {
    out.push(...walkArchivePaths(`${name}/${child}`, cnode));
  }
  return out;
}

function gunzipImpl(args: string[], ctx: ShellContext): string | null {
  const keep = args.includes('-k') || args.includes('--keep');
  const target = args.find((a) => !a.startsWith('-'));
  if (!target) return 'gunzip: missing file operand';
  if (!target.endsWith('.gz')) return `gzip: ${target}: unknown suffix -- ignored`;
  const node = resolveNode(ctx, target);
  if (!node || node.type !== 'file') return `gunzip: ${target}: No such file or directory`;
  let decoded: string;
  try {
    decoded = atob(node.content);
  } catch {
    return `gunzip: ${target}: not in gzip format`;
  }
  const dest = target.slice(0, -3);
  writeFile(ctx, dest, decoded);
  if (!keep) {
    const loc = resolveParent(ctx, target);
    if (loc) delete loc.parent.children[loc.name];
  }
  return null;
}

function nodeSize(node: FsNode): number {
  if (node.type === 'file') return node.content.length;
  let total = 4096;
  for (const child of Object.values(node.children)) total += nodeSize(child);
  return total;
}

// djb2 — small non-cryptographic hash, deterministic, fast in-browser.
function djb2(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  // Return a 32-bit unsigned hex string.
  return (h >>> 0).toString(16).padStart(8, '0');
}

// FNV-1a 32-bit — used to expand the hash space for sha256sum.
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// 64-hex-char "sha256-like" digest derived from the input.
function pseudoSha256(input: string): string {
  let s1 = djb2(input);
  let s2 = fnv1a(input);
  let s3 = djb2(input.split('').reverse().join('') + s1);
  let s4 = fnv1a(s2 + input);
  let s5 = djb2(s3 + s4);
  let s6 = fnv1a(s4 + s5);
  let s7 = djb2(s5 + s6);
  let s8 = fnv1a(s6 + s7);
  return (s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8).padEnd(64, '0').slice(0, 64);
}

function pseudoMd5(input: string): string {
  // 32-hex output built from two 16-hex halves.
  return (djb2(input) + fnv1a(input) + djb2(input + 'x') + fnv1a('y' + input))
    .padEnd(32, '0')
    .slice(0, 32);
}

function readInput(arg: string, ctx: ShellContext): string | null {
  if (arg.startsWith('__STDIN__:')) return arg.slice('__STDIN__:'.length);
  const node = resolveNode(ctx, arg);
  if (!node) return null;
  if (node.type !== 'file') return null;
  return node.content;
}

function tryReadInput(
  arg: string,
  ctx: ShellContext,
): { ok: boolean; content: string } {
  if (arg.startsWith('__STDIN__:')) return { ok: true, content: arg.slice('__STDIN__:'.length) };
  const node = resolveNode(ctx, arg);
  if (!node) return { ok: false, content: '' };
  if (node.type === 'dir') return { ok: false, content: `${arg}: Is a directory` };
  return { ok: true, content: node.content };
}

// ───────────────────────────────────────────────────── command set ──

const COMMANDS: Record<string, CommandSpec> = {
  // ── navigation / info ──
  pwd: { name: 'pwd', summary: 'print working directory', run: (_a, ctx) => ctx.cwd },
  whoami: { name: 'whoami', summary: 'show current user', run: (_a, ctx) => ctx.user },
  hostname: { name: 'hostname', summary: 'show host name', run: (_a, ctx) => ctx.host },
  date: { name: 'date', summary: 'show current date', run: () => new Date().toString() },
  echo: { name: 'echo', summary: 'print arguments', run: (args) => args.join(' ') },
  clear: { name: 'clear', summary: 'clear screen', run: () => '__CLEAR__' },
  true: { name: 'true', summary: 'do nothing, successfully', run: () => null },
  false: { name: 'false', summary: 'do nothing, unsuccessfully', run: () => '__NUL__' },
  sleep: { name: 'sleep', summary: 'pause for N seconds (simulated)', run: () => null },
  yes: {
    name: 'yes',
    summary: 'print a string repeatedly',
    run: (args) =>
      Array.from({ length: 5 }, () => args[0] ?? 'y').join('\n') + '\n... (truncated)',
  },
  printf: {
    name: 'printf',
    summary: 'format and print data (supports %s, %d, \\n/\\t escapes, and format re-use for extra args)',
    run: (args) => {
      if (args.length === 0) return 'printf: usage: printf format [arguments]';
      const fmt = args[0];
      const subs = args.slice(1);
      const hasDirective = /%[sd]/.test(fmt);
      let i = 0;
      const passes: string[] = [];
      do {
        passes.push(
          fmt.replace(/%[sd]/g, (m) => {
            if (m === '%s') return String(subs[i++] ?? '');
            if (m === '%d') return String(parseInt(subs[i++] ?? '0', 10));
            return m;
          }),
        );
      } while (hasDirective && i < subs.length);
      const substituted = passes.join('');
      return substituted.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
    },
  },
  exit: { name: 'exit', summary: 'exit the shell (simulated)', run: () => 'logout' },
  history: {
    name: 'history',
    summary: 'show recent commands',
    run: (_a, ctx) => ctx.history.map((c, i) => `  ${String(i + 1).padStart(3)}  ${c}`).join('\n'),
  },
  export: {
    name: 'export',
    summary: 'set env variable',
    run: (args, ctx) => {
      for (const arg of args) {
        const [k, ...rest] = arg.split('=');
        if (!k || rest.length === 0) continue;
        ctx.env[k] = rest.join('=');
      }
      return null;
    },
  },
  env: {
    name: 'env',
    summary: 'print environment variables',
    run: (_a, ctx) =>
      Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`).join('\n') || '(no env vars set)',
  },

  // ── file system basics ──
  ls: {
    name: 'ls',
    summary: 'list directory',
    run: (args, ctx) => {
      const long = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const target = args.find((a) => !a.startsWith('-')) ?? '.';
      const node = resolveNode(ctx, target);
      if (!node) return `ls: cannot access '${target}': No such file or directory`;
      if (node.type !== 'dir') {
        const base = target.split('/').pop() ?? target;
        return base;
      }
      const dir = node;
      const names = Object.keys(dir.children);
      const visible = showAll ? ['.', '..', ...names] : names;
      if (!long) return visible.join('  ');
      return visible
        .map((n) => {
          if (n === '.' || n === '..')
            return `drwxr-xr-x  2 ${ctx.user} ${ctx.user}  4096  ${n}/`;
          const child = dir.children[n];
          const perms = child?.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = child?.type === 'dir' ? 4096 : (child?.content?.length ?? 0) || 12;
          return `${perms}  1 ${ctx.user} ${ctx.user}  ${String(size).padStart(5)}  ${n}`;
        })
        .join('\n');
    },
  },
  cd: {
    name: 'cd',
    summary: 'change directory',
    run: (args, ctx) => {
      const target = args[0] ?? '~';
      const node = resolveNode(ctx, target);
      if (!node) return `cd: no such file or directory: ${target}`;
      if (node.type !== 'dir') return `cd: not a directory: ${target}`;
      ctx.cwd = node === ctx.fs ? '/' : joinPath(ctx.cwd, target);
      if (ctx.cwd === '') ctx.cwd = '/';
      return null;
    },
  },
  mkdir: {
    name: 'mkdir',
    summary: 'make directory',
    run: (args, ctx) => {
      const makeParents = args.includes('-p');
      for (const arg of args) {
        if (arg.startsWith('-')) continue;
        const target = joinPath(ctx.cwd, arg);
        const parts = target.split('/').filter(Boolean);
        const name = parts.pop();
        if (!name) continue;
        let cursor: FsNode | undefined = ctx.fs as FsNode;
        for (const part of parts) {
          if (!cursor) break;
          if (cursor.type !== 'dir') return `mkdir: ${arg}: not a directory`;
          const child: FsNode | undefined = cursor.children[part];
          if (!child) {
            if (!makeParents) return `mkdir: ${arg}: No such file or directory`;
            const newDir: FsDir = { type: 'dir', children: {} };
            cursor.children[part] = newDir;
            cursor = newDir;
          } else {
            cursor = child;
          }
        }
        if (!cursor) return `mkdir: cannot create '${arg}'`;
        if (cursor.type !== 'dir') return `mkdir: ${arg}: not a directory`;
        if (cursor.children[name]) return `mkdir: cannot create '${arg}': File exists`;
        cursor.children[name] = { type: 'dir', children: {} };
      }
      return null;
    },
  },
  touch: {
    name: 'touch',
    summary: 'create or update file',
    run: (args, ctx) => {
      for (const arg of args) {
        if (arg.startsWith('-')) continue;
        const target = joinPath(ctx.cwd, arg);
        const parts = target.split('/').filter(Boolean);
        const name = parts.pop();
        if (!name) continue;
        let cursor: FsNode | undefined = ctx.fs as FsNode;
        for (const part of parts) {
          if (!cursor || cursor.type !== 'dir') break;
          const next: FsNode | undefined = cursor.children[part];
          cursor = next;
        }
        if (!cursor || cursor.type !== 'dir') {
          return `touch: cannot touch '${arg}': No such file or directory`;
        }
        if (!cursor.children[name]) {
          cursor.children[name] = { type: 'file', content: '' };
        }
      }
      return null;
    },
  },
  cat: {
    name: 'cat',
    summary: 'print file contents',
    run: (args, ctx) => {
      if (args.length === 0) return 'cat: missing file operand';
      const out: string[] = [];
      for (const arg of args) {
        const text = readInput(arg, ctx);
        if (text !== null) out.push(text);
        else {
          const node = resolveNode(ctx, arg);
          if (node?.type === 'dir') out.push(`cat: ${arg}: Is a directory`);
          else out.push(`cat: ${arg}: No such file or directory`);
        }
      }
      return out.join('\n');
    },
  },
  // `nano <file>` (and vi/vim/pico/emacs) typed on its own launches a
  // REAL full-screen editor — see Terminal.tsx's openEditor(), which
  // intercepts the line before it ever reaches this evaluator. The
  // fallback here only fires for the cases a full-screen app can't
  // meaningfully compose with: piped into/from another command, chained
  // with && / || / ;, or missing a filename — it dumps the file with a
  // friendly TUI-styled header instead of truly editing it.
  nano: {
    name: 'nano',
    summary: 'real full-screen editor when run alone; preview-only if piped or chained',
    run: (args, ctx) => editorStub('nano', args, ctx),
  },
  vi: {
    name: 'vi',
    summary: 'real full-screen editor when run alone; preview-only if piped or chained',
    run: (args, ctx) => editorStub('vi', args, ctx),
  },
  vim: {
    name: 'vim',
    summary: 'real full-screen editor when run alone; preview-only if piped or chained',
    run: (args, ctx) => editorStub('vim', args, ctx),
  },
  pico: {
    name: 'pico',
    summary: 'real full-screen editor when run alone; preview-only if piped or chained',
    run: (args, ctx) => editorStub('pico', args, ctx),
  },
  emacs: {
    name: 'emacs',
    summary: 'real full-screen editor when run alone; preview-only if piped or chained',
    run: (args, ctx) => editorStub('emacs', args, ctx),
  },
  less: {
    name: 'less',
    summary: 'simulated pager — prints the file (use ↑/↓ in xterm to scroll)',
    run: (args, ctx) => editorStub('less', args, ctx),
  },
  more: {
    name: 'more',
    summary: 'simulated pager — prints the file (use ↑/↓ in xterm to scroll)',
    run: (args, ctx) => editorStub('more', args, ctx),
  },
  rm: {
    name: 'rm',
    summary: 'remove file or directory',
    run: (args, ctx) => {
      const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
      const force = args.includes('-f') || args.includes('-rf') || args.includes('-fr');
      for (const arg of args) {
        if (arg.startsWith('-')) continue;
        const loc = resolveParent(ctx, arg);
        if (!loc) {
          if (!force) return `rm: cannot remove '${arg}': No such file or directory`;
          continue;
        }
        const target = loc.parent.children[loc.name];
        if (!target) {
          if (!force) return `rm: cannot remove '${arg}': No such file or directory`;
          continue;
        }
        if (target.type === 'dir' && !recursive) {
          return `rm: cannot remove '${arg}': Is a directory`;
        }
        delete loc.parent.children[loc.name];
      }
      return null;
    },
  },
  mv: {
    name: 'mv',
    summary: 'move / rename',
    run: (args, ctx) => {
      if (args.length < 2) return 'mv: missing destination';
      const [from, to] = args;
      const src = resolveParent(ctx, from);
      if (!src) return `mv: cannot stat '${from}': No such file or directory`;
      const dest = resolveParent(ctx, to);
      if (!dest) return `mv: cannot move to '${to}': No such directory`;
      const node = src.parent.children[src.name];
      if (!node) return `mv: cannot stat '${from}'`;
      const existing = resolveNode(ctx, to);
      if (existing && existing.type === 'dir') {
        existing.children[src.name] = node;
      } else {
        dest.parent.children[dest.name] = node;
      }
      delete src.parent.children[src.name];
      return null;
    },
  },
  cp: {
    name: 'cp',
    summary: 'copy file',
    run: (args, ctx) => {
      if (args.length < 2) return 'cp: missing destination';
      const [from, to] = args;
      const src = resolveNode(ctx, from);
      if (!src) return `cp: cannot stat '${from}': No such file or directory`;
      const dest = resolveParent(ctx, to);
      if (!dest) return `cp: cannot create '${to}'`;
      const clone: FsNode = JSON.parse(JSON.stringify(src));
      const existing = resolveNode(ctx, to);
      if (existing && existing.type === 'dir') {
        existing.children[from.split('/').pop()!] = clone;
      } else {
        dest.parent.children[dest.name] = clone;
      }
      return null;
    },
  },
  rmdir: {
    name: 'rmdir',
    summary: 'remove empty directories',
    run: (args, ctx) => {
      if (args.length === 0) return 'rmdir: missing operand';
      let lastErr: string | null = null;
      for (const arg of args) {
        if (arg.startsWith('-')) continue;
        const loc = resolveParent(ctx, arg);
        if (!loc) {
          lastErr = `rmdir: failed to remove '${arg}': No such file or directory`;
          continue;
        }
        const target = loc.parent.children[loc.name];
        if (!target) {
          lastErr = `rmdir: failed to remove '${arg}': No such file or directory`;
          continue;
        }
        if (target.type !== 'dir') {
          lastErr = `rmdir: failed to remove '${arg}': Not a directory`;
          continue;
        }
        if (Object.keys(target.children).length > 0) {
          lastErr = `rmdir: failed to remove '${arg}': Directory not empty`;
          continue;
        }
        delete loc.parent.children[loc.name];
      }
      return lastErr;
    },
  },
  install: {
    name: 'install',
    summary: 'copy file to a destination, creating intermediate dirs (-D)',
    run: (args, ctx) => {
      const makeDirs = args.includes('-D');
      const positional = args.filter((a) => !a.startsWith('-'));
      if (positional.length < 2) return 'install: missing destination file operand';
      const [from, to] = positional;
      const src = resolveNode(ctx, from);
      if (!src) return `install: cannot stat '${from}': No such file or directory`;
      if (makeDirs) {
        const parts = to.split('/').filter(Boolean);
        let cursor: FsNode = ctx.fs;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (cursor.type !== 'dir') return `install: '${to}': not a directory`;
          const existing = cursor.children[part];
          if (!existing) {
            const newDir: FsDir = { type: 'dir', children: {} };
            cursor.children[part] = newDir;
            cursor = newDir;
          } else {
            cursor = existing;
          }
        }
      }
      const dest = resolveParent(ctx, to);
      if (!dest) return `install: cannot create '${to}'`;
      dest.parent.children[dest.name] = JSON.parse(JSON.stringify(src));
      return null;
    },
  },
  mktemp: {
    name: 'mktemp',
    summary: 'create a temporary file (in /tmp) with optional template',
    run: (args, ctx) => {
      const template = args[0] ?? 'tmp.XXXXXXXX';
      const name = template.replace(/X+/, () =>
        Math.random().toString(36).slice(2, 2 + 8).padEnd(8, '0'),
      );
      writeFile(ctx, `/tmp/${name}`, '');
      return `/tmp/${name}`;
    },
  },
  truncate: {
    name: 'truncate',
    summary: 'shrink or extend a file to a given size (-s N)',
    run: (args, ctx) => {
      const sizeIdx = args.findIndex((a) => a === '-s');
      if (sizeIdx < 0) return 'truncate: you must specify -s <size>';
      const size = Math.max(0, parseInt(args[sizeIdx + 1] ?? '0', 10) || 0);
      const target = args.find((a, i) => !a.startsWith('-') && i !== sizeIdx);
      if (!target) return 'truncate: missing file operand';
      const loc = resolveParent(ctx, target);
      if (!loc) {
        // Create if missing.
        writeFile(ctx, target, '');
        const created = resolveParent(ctx, target);
        if (!created) return `truncate: cannot create '${target}'`;
        created.parent.children[created.name] = { type: 'file', content: '' };
      }
      const node = resolveNode(ctx, target);
      if (!node) return `truncate: cannot open '${target}' for writing`;
      if (node.type === 'dir') return `truncate: '${target}' is a directory`;
      node.content = node.content.slice(0, size).padEnd(size, '\0');
      return null;
    },
  },
  readlink: {
    name: 'readlink',
    summary: 'print value of a symbolic link (simulated)',
    run: (args, ctx) => {
      if (args.length === 0) return 'readlink: missing operand';
      const node = resolveNode(ctx, args[0]);
      if (!node) return `readlink: ${args[0]}: No such file or directory`;
      return node.type === 'dir' ? `${args[0]}/` : args[0];
    },
  },
  du: {
    name: 'du',
    summary: 'estimate file / directory space usage (-h, -s)',
    run: (args, ctx) => {
      const human = args.includes('-h');
      const summary = args.includes('-s');
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'du: missing operand';
      const fmt = (n: number) =>
        human ? `${(n / 1024).toFixed(1).padStart(6)}K` : String(n).padStart(6);
      const out: string[] = [];
      for (const t of targets) {
        const node = resolveNode(ctx, t);
        if (!node) return `du: cannot access '${t}': No such file or directory`;
        const total = nodeSize(node);
        out.push(`${fmt(total)}\t${t}`);
        if (!summary && node.type === 'dir') {
          for (const [name, child] of Object.entries(node.children)) {
            out.push(`${fmt(nodeSize(child))}\t${t === '/' ? '' : t}/${name}`);
          }
        }
      }
      return out.join('\n');
    },
  },
  fileinfo: {
    name: 'fileinfo',
    summary: 'show a compact summary of a file (size, lines, words, mtime)',
    run: (args, ctx) => {
      if (args.length === 0) return 'fileinfo: missing file operand';
      const node = resolveNode(ctx, args[0]);
      if (!node) return `fileinfo: ${args[0]}: No such file or directory`;
      if (node.type === 'dir') {
        const count = Object.keys(node.children).length;
        return `${args[0]}/  directory, ${count} entr${count === 1 ? 'y' : 'ies'}`;
      }
      const content = node.content;
      const lines = content ? content.split('\n').length : 0;
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      return `${args[0]}  ${content.length} bytes, ${lines} lines, ${words} words, modified ${new Date().toUTCString()}`;
    },
  },
  chmod: {
    name: 'chmod',
    summary: 'change permissions (simulated)',
    run: (args) => {
      if (args.length < 2) return 'chmod: missing operand';
      return `chmod: set ${args[0]} on ${args.slice(1).join(' ')} ✓`;
    },
  },
  chown: {
    name: 'chown',
    summary: 'change file owner and group (simulated)',
    run: (args) => {
      if (args.length < 2) return 'chown: missing operand';
      return `chown: set owner ${args[0]} on ${args.slice(1).join(' ')} ✓`;
    },
  },
  ln: {
    name: 'ln',
    summary: 'make a link (simulated)',
    run: (args) => {
      if (args.length < 2) return 'ln: missing file operand';
      return `ln: created link ${args[1]} -> ${args[0]} ✓`;
    },
  },
  find: {
    name: 'find',
    summary: 'find files by name (supports -name <glob>)',
    run: (args, ctx) => {
      const start = args[0] && !args[0].startsWith('-') ? args[0] : '.';
      const nameIdx = args.findIndex((a) => a === '-name');
      const target = nameIdx >= 0 ? args[nameIdx + 1] : null;
      const out: string[] = [];
      const visit = (node: FsNode, path: string) => {
        if (node.type === 'dir') {
          for (const [child, cnode] of Object.entries(node.children)) {
            const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
            if (!target || globMatch(target, child)) out.push(childPath);
            visit(cnode, childPath);
          }
        }
      };
      const root = resolveNode(ctx, start) ?? ctx.fs;
      visit(root, start === '/' ? '' : start);
      return out.join('\n');
    },
  },
  tree: {
    name: 'tree',
    summary: 'display directory tree',
    run: (args, ctx) => {
      const start = args[0] && !args[0].startsWith('-') ? args[0] : '.';
      const root = resolveNode(ctx, start);
      if (!root) return `tree: ${start}: No such file or directory`;
      const lines: string[] = [`.`];
      const render = (node: FsNode, prefix: string) => {
        if (node.type !== 'dir') return;
        const entries = Object.entries(node.children);
        entries.forEach(([name, child], i) => {
          const last = i === entries.length - 1;
          lines.push(
            `${prefix}${last ? '└── ' : '├── '}${name}${child.type === 'dir' ? '/' : ''}`,
          );
          if (child.type === 'dir') render(child, `${prefix}${last ? '    ' : '│   '}`);
        });
      };
      render(root, '');
      return lines.join('\n');
    },
  },
  stat: {
    name: 'stat',
    summary: 'display file status',
    run: (args, ctx) => {
      if (args.length === 0) return 'stat: missing operand';
      const node = resolveNode(ctx, args[0]);
      if (!node) return `stat: cannot stat '${args[0]}': No such file or directory`;
      const size = node.type === 'file' ? node.content.length : 4096;
      return `  File: ${args[0]}
  Size: ${size}\tBlocks: ${Math.ceil(size / 512)}\tIO Block: 4096   ${node.type === 'dir' ? 'directory' : 'regular file'}
Device: 801h/2049d\tInode: ${Math.abs(hashCode(args[0])) % 99999}\tLinks: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/ learner)   Gid: ( 1000/ learner)
Modify: ${new Date().toUTCString()}`;
    },
  },
  basename: {
    name: 'basename',
    summary: 'strip directory and suffix',
    run: (args) => args[0]?.split('/').pop() ?? '',
  },
  dirname: {
    name: 'dirname',
    summary: 'strip last component from filename',
    run: (args) => {
      const p = args[0] ?? '.';
      const idx = p.lastIndexOf('/');
      if (idx <= 0) return idx === 0 ? '/' : '.';
      return p.slice(0, idx);
    },
  },
  realpath: {
    name: 'realpath',
    summary: 'print resolved absolute path',
    run: (args, ctx) => joinPath(ctx.cwd, args[0] ?? '.'),
  },
  file: {
    name: 'file',
    summary: 'determine file type',
    run: (args, ctx) => {
      if (args.length === 0) return 'file: missing file operand';
      return args
        .map((a) => {
          const n = resolveNode(ctx, a);
          if (!n) return `${a}: cannot open`;
          if (n.type === 'dir') return `${a}: directory`;
          const c = n.content;
          if (/^#!.*\b(bash|sh|node|python)\b/.test(c)) return `${a}: ${RegExp.$1} script, ASCII text`;
          if (c.startsWith('#')) return `${a}: ASCII text`;
          if (!c) return `${a}: empty`;
          return `${a}: ASCII text`;
        })
        .join('\n');
    },
  },
  diff: {
    name: 'diff',
    summary: 'compare two files line by line',
    run: (args, ctx) => {
      if (args.length < 2) return 'diff: missing operand';
      const a = readInput(args[0], ctx);
      const b = readInput(args[1], ctx);
      if (a === null) return `diff: ${args[0]}: No such file`;
      if (b === null) return `diff: ${args[1]}: No such file`;
      const aLines = a.split('\n');
      const bLines = b.split('\n');
      const out: string[] = [];
      const max = Math.max(aLines.length, bLines.length);
      for (let i = 0; i < max; i++) {
        if (aLines[i] !== bLines[i]) {
          if (aLines[i] !== undefined) out.push(`< ${aLines[i]}`);
          if (bLines[i] !== undefined) out.push(`> ${bLines[i]}`);
        }
      }
      return out.length ? out.join('\n') : '(files are identical)';
    },
  },

  // ── text utilities (all accept piped stdin) ──
  head: {
    name: 'head',
    summary: 'print first N lines of a file (default 10)',
    run: (args, ctx) => {
      const n = (() => {
        const f = args.find((a) => a.startsWith('-n'));
        if (f) return parseInt(f.slice(2), 10) || 10;
        return 10;
      })();
      const target = args.find((a) => !a.startsWith('-')) ?? args[0];
      if (!target) return 'head: missing file operand';
      const content = readInput(target, ctx);
      if (content === null) return `head: cannot open '${target}': No such file or directory`;
      return content.split('\n').slice(0, n).join('\n');
    },
  },
  tail: {
    name: 'tail',
    summary: 'print last N lines of a file (default 10)',
    run: (args, ctx) => {
      const n = (() => {
        const f = args.find((a) => a.startsWith('-n'));
        if (f) return parseInt(f.slice(2), 10) || 10;
        return 10;
      })();
      const target = args.find((a) => !a.startsWith('-')) ?? args[0];
      if (!target) return 'tail: missing file operand';
      const content = readInput(target, ctx);
      if (content === null) return `tail: cannot open '${target}': No such file or directory`;
      const lines = content.split('\n');
      return lines.slice(Math.max(0, lines.length - n)).join('\n');
    },
  },
  wc: {
    name: 'wc',
    summary: 'count lines, words, bytes',
    run: (args, ctx) => {
      const showLines = args.includes('-l');
      const showWords = args.includes('-w');
      const showBytes = args.includes('-c');
      const all = !showLines && !showWords && !showBytes;
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'wc: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) {
          out.push(`wc: ${t}: No such file or directory`);
          continue;
        }
        const text = r.content;
        const lines = text ? text.split('\n').length - (text.endsWith('\n') ? 1 : 0) : 0;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const bytes = new TextEncoder().encode(text).length;
        const parts: string[] = [];
        if (all || showLines) parts.push(String(lines).padStart(7));
        if (all || showWords) parts.push(String(words).padStart(7));
        if (all || showBytes) parts.push(String(bytes).padStart(7));
        const label = t.startsWith('__STDIN__') ? '' : t;
        parts.push(label);
        out.push(parts.join(' ').trimEnd());
      }
      return out.join('\n');
    },
  },
  grep: {
    name: 'grep',
    summary: 'search text with a real regex pattern (supports -i -v -n -E)',
    run: (args, ctx) => {
      if (args.length === 0) return 'grep: missing pattern';
      let ignoreCase = false;
      let invert = false;
      let lineNumbers = false;
      const filtered: string[] = [];
      for (const a of args) {
        if (a === '-i') ignoreCase = true;
        else if (a === '-v') invert = true;
        else if (a === '-n' || a === '-nH') lineNumbers = true;
        else if (a === '-E' || a === '-e') continue; // regex here is already "extended" by default
        else filtered.push(a);
      }
      const pattern = filtered[0];
      if (!pattern) return 'grep: missing pattern';
      const targets =
        filtered.length > 1
          ? filtered.slice(1)
          : typeof ctx.__lastStdin === 'string'
            ? [`__STDIN__:${ctx.__lastStdin}`]
            : [];
      if (targets.length === 0) return 'grep: missing file operand';
      let re: RegExp;
      try {
        re = new RegExp(pattern, ignoreCase ? 'i' : '');
      } catch {
        return `grep: invalid regular expression: ${pattern}`;
      }
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) {
          out.push(`grep: ${t}: No such file or directory`);
          continue;
        }
        r.content.split('\n').forEach((line, i) => {
          const hit = re.test(line);
          const matched = invert ? !hit : hit;
          if (matched) {
            const label = t.startsWith('__STDIN__') ? '' : t;
            out.push(lineNumbers ? `${label}${label ? ':' : ''}${i + 1}:${line}` : line);
          }
        });
      }
      return out.join('\n');
    },
  },
  sort: {
    name: 'sort',
    summary: 'sort lines of text (supports -r -n -u)',
    run: (args, ctx) => {
      const reverse = args.includes('-r');
      const numeric = args.includes('-n');
      const unique = args.includes('-u');
      const targets = args.filter((a) => !a.startsWith('-'));
      const lines: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `sort: ${t}: No such file or directory`;
        lines.push(...r.content.split('\n'));
      }
      let sorted = [...lines];
      if (numeric) sorted.sort((a, b) => parseFloat(a) - parseFloat(b));
      else sorted.sort();
      if (reverse) sorted.reverse();
      if (unique) sorted = sorted.filter((v, i, a) => a.indexOf(v) === i);
      return sorted.join('\n');
    },
  },
  uniq: {
    name: 'uniq',
    summary: 'remove adjacent duplicate lines (supports -c -i)',
    run: (args, ctx) => {
      const count = args.includes('-c');
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'uniq: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `uniq: ${t}: No such file or directory`;
        const lines = r.content.split('\n');
        let prev: string | null = null;
        let run = 0;
        for (const line of lines) {
          if (line === prev) {
            run++;
            continue;
          }
          if (prev !== null) {
            out.push(count ? `${String(run).padStart(4, ' ')} ${prev}` : prev);
          }
          prev = line;
          run = 1;
        }
        if (prev !== null) {
          out.push(count ? `${String(run).padStart(4, ' ')} ${prev}` : prev);
        }
      }
      return out.join('\n');
    },
  },
  cut: {
    name: 'cut',
    summary: 'cut fields/characters from input (-f, -c, -d)',
    run: (args, ctx) => {
      const delimIdx = args.findIndex((a) => a === '-d');
      const delim = delimIdx >= 0 ? (args[delimIdx + 1] ?? '\t') : '\t';
      const fieldIdx = args.findIndex((a) => a === '-f');
      const charIdx = args.findIndex((a) => a === '-c');
      if (fieldIdx < 0 && charIdx < 0) return 'cut: you must specify a list of fields or characters';
      const spec = fieldIdx >= 0 ? args[fieldIdx + 1] : args[charIdx + 1];
      if (!spec) return 'cut: missing field spec';
      const explicitTargets = args.filter((a) => !a.startsWith('-') && a !== delim && a !== spec);
      const targets =
        explicitTargets.length > 0
          ? explicitTargets
          : typeof ctx.__lastStdin === 'string'
            ? [`__STDIN__:${ctx.__lastStdin}`]
            : [];
      if (targets.length === 0) return 'cut: missing file operand';
      const ranges = spec
        .split(',')
        .flatMap((part) => {
          if (part.includes('-')) {
            const [a, b] = part.split('-').map((n) => parseInt(n, 10));
            if (Number.isNaN(a) || Number.isNaN(b)) return [];
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
          }
          const n = parseInt(part, 10);
          return Number.isNaN(n) ? [] : [n];
        });
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `cut: ${t}: No such file or directory`;
        for (const line of r.content.split('\n')) {
          if (charIdx >= 0) {
            const chars = [...line];
            out.push(ranges.map((i) => chars[i - 1] ?? '').join(''));
          } else {
            const fields = line.split(delim);
            out.push(ranges.map((i) => fields[i - 1] ?? '').join(delim));
          }
        }
      }
      return out.join('\n');
    },
  },
  tr: {
    name: 'tr',
    summary: 'translate or delete characters (SET1 SET2, -d)',
    run: (args, ctx) => {
      if (args.length === 0) return 'tr: missing operand';
      const deleteMode = args.includes('-d');
      const filtered = args.filter((a) => !a.startsWith('-'));
      let set1: string;
      let set2: string | null = null;
      if (deleteMode) {
        if (filtered.length < 1) return 'tr: missing operand';
        set1 = filtered[0];
      } else {
        if (filtered.length < 2) return 'tr: missing operand';
        [set1, set2] = filtered;
      }
      const targets = filtered.slice(deleteMode ? 1 : 2);
      let src = '';
      if (targets.length > 0) {
        for (const t of targets) {
          const r = tryReadInput(t, ctx);
          if (!r.ok) return `tr: ${t}: No such file or directory`;
          src += r.content;
        }
      } else if (typeof ctx.__lastStdin === 'string') {
        src = ctx.__lastStdin;
      } else {
        return 'tr: missing file operand (stdin not yet wired in this sandbox)';
      }
      if (deleteMode) {
        const set = new Set([...set1]);
        return src.split('').filter((c) => !set.has(c)).join('');
      }
      const a = [...set1];
      const b = [...set2!];
      return src
        .split('')
        .map((c) => {
          const i = a.indexOf(c);
          return i >= 0 ? (b[i] ?? b[b.length - 1]) : c;
        })
        .join('');
    },
  },
  tac: {
    name: 'tac',
    summary: 'print lines in reverse order',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'tac: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `tac: ${t}: No such file or directory`;
        const lines = r.content.split('\n');
        out.push(lines.reverse().join('\n'));
      }
      return out.join('\n');
    },
  },
  rev: {
    name: 'rev',
    summary: 'reverse each line of input',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'rev: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `rev: ${t}: No such file or directory`;
        out.push(r.content.split('\n').map((l) => [...l].reverse().join('')).join('\n'));
      }
      return out.join('\n');
    },
  },
  nl: {
    name: 'nl',
    summary: 'number lines of input',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'nl: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `nl: ${t}: No such file or directory`;
        r.content.split('\n').forEach((line, i) => {
          if (line.length > 0) out.push(`${String(i + 1).padStart(6, ' ')}\t${line}`);
        });
      }
      return out.join('\n');
    },
  },
  paste: {
    name: 'paste',
    summary: 'merge lines of files side by side (-d delim)',
    run: (args, ctx) => {
      const dIdx = args.findIndex((a) => a === '-d');
      const delim = dIdx >= 0 ? (args[dIdx + 1] ?? '\t') : '\t';
      const targets = args.filter((a) => !a.startsWith('-') && a !== delim);
      if (targets.length < 2) return 'paste: missing file operand';
      const blocks: string[][] = targets.map((t) => {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return [`paste: ${t}: No such file or directory`];
        return r.content.split('\n');
      });
      const max = Math.max(...blocks.map((b) => b.length));
      const out: string[] = [];
      for (let i = 0; i < max; i++) {
        out.push(blocks.map((b) => b[i] ?? '').join(delim));
      }
      return out.join('\n');
    },
  },
  join: {
    name: 'join',
    summary: 'join two files on a common field',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length < 2) return 'join: missing file operand';
      const [a, b] = targets;
      const ra = tryReadInput(a, ctx);
      const rb = tryReadInput(b, ctx);
      if (!ra.ok) return `join: ${a}: No such file or directory`;
      if (!rb.ok) return `join: ${b}: No such file or directory`;
      const aMap = new Map<string, string[]>();
      for (const line of ra.content.split('\n')) {
        const [k, ...rest] = line.split(/\s+/);
        if (k) aMap.set(k, rest);
      }
      const out: string[] = [];
      for (const line of rb.content.split('\n')) {
        const [k, ...rest] = line.split(/\s+/);
        if (!k) continue;
        const left = aMap.get(k);
        if (left) out.push([k, ...left, ...rest].join(' '));
      }
      return out.join('\n');
    },
  },
  md5sum: {
    name: 'md5sum',
    summary: 'print MD5-style digests of files',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'md5sum: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `md5sum: ${t}: No such file or directory`;
        out.push(`${pseudoMd5(r.content)}  ${t}`);
      }
      return out.join('\n');
    },
  },
  sha256sum: {
    name: 'sha256sum',
    summary: 'print SHA-256-style digests of files',
    run: (args, ctx) => {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'sha256sum: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `sha256sum: ${t}: No such file or directory`;
        out.push(`${pseudoSha256(r.content)}  ${t}`);
      }
      return out.join('\n');
    },
  },
  strings: {
    name: 'strings',
    summary: 'print printable strings ≥4 chars from a file',
    run: (args, ctx) => {
      if (args.length === 0) return 'strings: missing file operand';
      const content = readInput(args[0], ctx);
      if (content === null) return `strings: ${args[0]}: No such file`;
      return (
        content.match(/[\x20-\x7e]{4,}/g)?.join('\n') ?? '(no printable strings)'
      );
    },
  },
  od: {
    name: 'od',
    summary: 'dump file in octal / hex / chars (-x hex, -c chars, -o octal)',
    run: (args, ctx) => {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return 'od: missing file operand';
      const content = readInput(target, ctx);
      if (content === null) return `od: ${target}: No such file`;
      const bytes = new TextEncoder().encode(content);
      const hexMode = args.includes('-x');
      const charMode = args.includes('-c');
      const lines: string[] = [];
      for (let i = 0; i < bytes.length; i += 16) {
        const chunk: number[] = Array.from(bytes.slice(i, i + 16));
        let body: string;
        if (charMode) {
          body = chunk
            .map((b) =>
              b >= 32 && b < 127
                ? String.fromCharCode(b)
                : b === 10
                ? '\\n'
                : b === 9
                ? '\\t'
                : b === 0
                ? '\\0'
                : `\\${b.toString(8)}`,
            )
            .join(' ');
        } else if (hexMode) {
          body = Array.from(chunk)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ');
        } else {
          body = Array.from(chunk)
            .map((b) => b.toString(8).padStart(3, '0'))
            .join(' ');
        }
        lines.push(`${i.toString(8).padStart(7, ' ')}  ${body}`);
      }
      return lines.join('\n');
    },
  },
  sed: {
    name: 'sed',
    summary: 'stream editor — supports s/find/replace/[gi] with a real regex and \\1 backreferences',
    run: (args, ctx) => {
      if (args.length === 0) return 'sed: missing expression or file';
      const expr = args[0];
      const explicitTargets = args.slice(1).filter((a) => !a.startsWith('-'));
      const targets =
        explicitTargets.length > 0
          ? explicitTargets
          : typeof ctx.__lastStdin === 'string'
            ? [`__STDIN__:${ctx.__lastStdin}`]
            : [];
      if (targets.length === 0) return 'sed: missing file';
      const m = expr.match(/^s\/(.+?)\/(.*?)\/([gi]*)$/);
      if (!m) {
        return `sed: unsupported expression '${expr}' (only s/find/replace/[gi] supported)`;
      }
      const [, find, repl, flags] = m;
      const jsFlags = (flags.includes('g') ? 'g' : '') + (flags.includes('i') ? 'i' : '');
      let re: RegExp;
      try {
        re = new RegExp(find, jsFlags);
      } catch {
        return `sed: invalid regular expression: ${find}`;
      }
      // sed backreferences in the replacement are \1, \2, ... — JS uses $1, $2.
      const jsRepl = repl.replace(/\\(\d)/g, '$$$1');
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `sed: ${t}: No such file or directory`;
        out.push(r.content.replace(re, jsRepl));
      }
      return out.join('\n');
    },
  },
  awk: {
    name: 'awk',
    summary: 'simple awk — `awk "{print $N}"` prints field N (or all with $0)',
    run: (args, ctx) => {
      let program: string | null = null;
      const files: string[] = [];
      for (const a of args) {
        if (a.startsWith('-')) continue;
        if (program === null && a.includes('print')) program = a;
        else files.push(a);
      }
      if (!program) return 'awk: missing program (use awk "{print $N}" file)';
      const m = program.match(/print\s+\$(\d+)/);
      if (!m) return 'awk: only `print $N` is supported in this sandbox';
      const field = parseInt(m[1], 10);
      const targets =
        files.length > 0
          ? files
          : typeof ctx.__lastStdin === 'string'
            ? [`__STDIN__:${ctx.__lastStdin}`]
            : [];
      if (targets.length === 0) return 'awk: missing file operand';
      const out: string[] = [];
      for (const t of targets) {
        const r = tryReadInput(t, ctx);
        if (!r.ok) return `awk: ${t}: No such file or directory`;
        for (const line of r.content.split('\n')) {
          if (line.length === 0) continue;
          if (field === 0) out.push(line);
          else out.push(line.split(/\s+/)[field - 1] ?? '');
        }
      }
      return out.join('\n');
    },
  },
  xxd: {
    name: 'xxd',
    summary: 'hex dump of a file',
    run: (args, ctx) => {
      if (args.length === 0) return 'xxd: missing file';
      const content = readInput(args[0], ctx);
      if (content === null) return `xxd: ${args[0]}: No such file`;
      const bytes = new TextEncoder().encode(content);
      const lines: string[] = [];
      for (let i = 0; i < bytes.length; i += 16) {
        const chunk: number[] = Array.from(bytes.slice(i, i + 16));
        const hex = chunk
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
          .padEnd(48, ' ');
        const ascii = chunk
          .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.'))
          .join('');
        lines.push(`${i.toString(16).padStart(8, '0')}: ${hex}  ${ascii}`);
      }
      return lines.join('\n');
    },
  },
  base64: {
    name: 'base64',
    summary: 'base64 encode/decode',
    run: (args, ctx) => {
      const decode = args.includes('-d');
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return 'base64: missing file';
      const content = readInput(target, ctx);
      if (content === null) return `base64: ${target}: No such file`;
      try {
        return decode ? atob(content) : btoa(content);
      } catch {
        return 'base64: invalid input';
      }
    },
  },
  tee: {
    name: 'tee',
    summary: 'read from stdin, write to file and stdout (-a appends)',
    run: (args, ctx) => {
      const append = args.includes('-a');
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return 'tee: missing file operand';
      const src = ctx.__lastStdin ?? '';
      for (const t of targets) {
        if (append) {
          const existing = resolveNode(ctx, t);
          const prev = existing?.type === 'file' ? existing.content : '';
          writeFile(ctx, t, prev + src);
        } else {
          writeFile(ctx, t, src);
        }
      }
      return src;
    },
  },
  xargs: {
    name: 'xargs',
    summary: 'build and execute command lines (simulated)',
    run: (args, ctx) => {
      if (args.length === 0) return 'xargs: missing command';
      const cmd = args[0];
      const tail = args.slice(1);
      const impl = resolveCommand(cmd);
      if (!impl) return `xargs: ${cmd}: command not found`;
      const stdin = ctx.__lastStdin ?? '';
      const tokens = stdin.length > 0 ? stdin.split(/\s+/) : [];
      if (tokens.length === 0) return null;
      const out: string[] = [];
      for (const tok of tokens) {
        const r = impl.run([...tail, tok], ctx);
        if (r != null) out.push(Array.isArray(r) ? r.join('\n') : r);
      }
      return out.join('\n');
    },
  },

  // ── archiving / compression (simulated) ──
  tar: {
    name: 'tar',
    summary: 'archive files (simulated) — -c create, -x extract, -t list; -f file, -v verbose, -z gzip',
    run: (args, ctx) => {
      let flags = '';
      const positional: string[] = [];
      for (const a of args) {
        if (/^-?[cxtvzf]+$/.test(a)) flags += a.replace(/^-/, '');
        else positional.push(a);
      }
      const create = flags.includes('c');
      const extract = flags.includes('x');
      const list = flags.includes('t');
      const gzipped = flags.includes('z');
      const verbose = flags.includes('v');
      if (!create && !extract && !list) {
        return 'tar: you must specify one of -c, -x, -t';
      }
      if (!flags.includes('f')) {
        return 'tar: refusing to read archive contents from the terminal (missing -f)';
      }
      const archivePath = positional[0];
      if (!archivePath) return 'tar: missing archive name';

      if (create) {
        const sources = positional.slice(1);
        if (sources.length === 0) return 'tar: no source files specified';
        const entries: { name: string; node: FsNode }[] = [];
        for (const src of sources) {
          const node = resolveNode(ctx, src);
          if (!node) return `tar: ${src}: No such file or directory`;
          const name = src.replace(/\/+$/, '').split('/').pop() ?? src;
          entries.push({ name, node: JSON.parse(JSON.stringify(node)) });
        }
        const manifest = JSON.stringify(entries);
        const content = gzipped ? `LEARNINX_TAR_GZ_V1\n${btoa(manifest)}` : `LEARNINX_TAR_V1\n${manifest}`;
        writeFile(ctx, archivePath, content);
        if (!verbose) return null;
        return entries.flatMap((e) => walkArchivePaths(e.name, e.node)).join('\n');
      }

      // extract / list both need to read and parse the archive first.
      const raw = readInput(archivePath, ctx);
      if (raw === null) return `tar: ${archivePath}: Cannot open: No such file or directory`;
      let entries: { name: string; node: FsNode }[];
      if (raw.startsWith('LEARNINX_TAR_GZ_V1\n')) {
        try {
          entries = JSON.parse(atob(raw.slice('LEARNINX_TAR_GZ_V1\n'.length)));
        } catch {
          return `tar: ${archivePath}: Corrupt archive`;
        }
      } else if (raw.startsWith('LEARNINX_TAR_V1\n')) {
        entries = JSON.parse(raw.slice('LEARNINX_TAR_V1\n'.length));
      } else {
        return `tar: ${archivePath}: Not a tar archive (this sandbox only reads archives it created)`;
      }

      if (list) {
        return entries.flatMap((e) => walkArchivePaths(e.name, e.node)).join('\n');
      }

      // extract into the current directory
      const cwdNode = resolveNode(ctx, ctx.cwd);
      if (!cwdNode || cwdNode.type !== 'dir') return `tar: ${ctx.cwd}: not a directory`;
      for (const e of entries) {
        cwdNode.children[e.name] = JSON.parse(JSON.stringify(e.node));
      }
      if (!verbose) return null;
      return entries.flatMap((e) => walkArchivePaths(e.name, e.node)).join('\n');
    },
  },
  gzip: {
    name: 'gzip',
    summary: 'compress a file (simulated) — replaces file with file.gz; -d decompress, -k keep original',
    run: (args, ctx) => {
      if (args.includes('-d') || args.includes('--decompress')) return gunzipImpl(args, ctx);
      const keep = args.includes('-k') || args.includes('--keep');
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return 'gzip: missing file operand';
      if (target.endsWith('.gz')) return `gzip: ${target} already has .gz suffix -- unchanged`;
      const node = resolveNode(ctx, target);
      if (!node || node.type !== 'file') return `gzip: ${target}: No such file or directory`;
      let encoded: string;
      try {
        encoded = btoa(node.content);
      } catch {
        return 'gzip: failed to compress (unsupported characters in this sandbox)';
      }
      writeFile(ctx, `${target}.gz`, encoded);
      if (!keep) {
        const loc = resolveParent(ctx, target);
        if (loc) delete loc.parent.children[loc.name];
      }
      return null;
    },
  },
  gunzip: {
    name: 'gunzip',
    summary: 'decompress a .gz file (simulated) — -k keeps the .gz copy',
    run: (args, ctx) => gunzipImpl(args, ctx),
  },

  // ── package management (simulated Debian/Ubuntu `apt`) ──
  apt: {
    name: 'apt',
    summary: 'simulated package manager — update, install, remove, search, list --installed',
    run: (args, ctx) => {
      if (args.length === 0) {
        return 'apt: usage: apt <update|upgrade|install|remove|search|list> [package...]';
      }
      const [sub, ...rest] = args;
      const pkgs = rest.filter((a) => !a.startsWith('-'));
      switch (sub) {
        case 'update':
          return 'Reading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.';
        case 'upgrade':
          return 'Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.';
        case 'install': {
          if (pkgs.length === 0) return 'apt: missing package operand';
          const out = ['Reading package lists... Done', 'Building dependency tree... Done'];
          const toInstall: string[] = [];
          for (const pkg of pkgs) {
            if (!(pkg in APT_CATALOG)) {
              out.push(`E: Unable to locate package ${pkg}`);
            } else if (isPackageInstalled(ctx, pkg)) {
              out.push(`${pkg} is already the newest version (${APT_CATALOG[pkg]}).`);
            } else {
              toInstall.push(pkg);
            }
          }
          if (toInstall.length > 0) {
            out.push('The following NEW packages will be installed:');
            out.push(`  ${toInstall.join(' ')}`);
            const dir = ensureDir(ctx, '/var/lib/dpkg/info');
            for (const pkg of toInstall) {
              dir.children[`${pkg}.list`] = { type: 'file', content: `/usr/bin/${pkg}\n` };
              out.push(`Setting up ${pkg} (${APT_CATALOG[pkg]}) ...`);
            }
          }
          return out.join('\n');
        }
        case 'remove':
        case 'purge': {
          if (pkgs.length === 0) return 'apt: missing package operand';
          const dir = dpkgInfoDir(ctx);
          const out: string[] = [];
          for (const pkg of pkgs) {
            if (!dir || !(`${pkg}.list` in dir.children)) {
              out.push(`Package '${pkg}' is not installed, so not removed`);
              continue;
            }
            delete dir.children[`${pkg}.list`];
            out.push(`Removing ${pkg} (${APT_CATALOG[pkg] ?? 'unknown'}) ...`);
          }
          return out.join('\n');
        }
        case 'search': {
          const term = pkgs[0];
          if (!term) return 'apt: usage: apt search <term>';
          const hits = Object.entries(APT_CATALOG).filter(([name]) => name.includes(term));
          if (hits.length === 0) {
            return `Sorting... Done\nFull Text Search... Done\n(no packages found matching '${term}')`;
          }
          return hits.map(([name, ver]) => `${name}/stable ${ver} amd64`).join('\n');
        }
        case 'list': {
          if (rest.includes('--installed')) {
            const dir = dpkgInfoDir(ctx);
            const names = dir
              ? Object.keys(dir.children)
                  .filter((n) => n.endsWith('.list'))
                  .map((n) => n.slice(0, -'.list'.length))
              : [];
            if (names.length === 0) return 'Listing... Done';
            return [
              'Listing... Done',
              ...names.map((n) => `${n}/now ${APT_CATALOG[n] ?? 'unknown'} amd64 [installed]`),
            ].join('\n');
          }
          return Object.entries(APT_CATALOG)
            .map(([name, ver]) => `${name}/stable ${ver} amd64`)
            .join('\n');
        }
        default:
          return `apt: unknown command '${sub}'`;
      }
    },
  },

  // ── system / info ──
  arch: {
    name: 'arch',
    summary: 'print machine architecture',
    run: () => 'x86_64',
  },
  nproc: {
    name: 'nproc',
    summary: 'print number of processing units available',
    run: () => '4',
  },
  lsblk: {
    name: 'lsblk',
    summary: 'list block devices',
    run: () =>
      `NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda           8:0    0    50G  0 disk
├─sda1        8:1    0    50G  0 part  /
└─sda2        8:2    0   512M  0 part  [SWAP]
sdb           8:16   0   100G  0 disk
└─sdb1        8:17   0   100G  0 part  /home
sr0          11:0    1  1024M  0 rom`,
  },
  lscpu: {
    name: 'lscpu',
    summary: 'display CPU architecture information',
    run: () =>
      `Architecture:            x86_64
  CPU op-mode(s):        32-bit, 64-bit
  Byte Order:            Little Endian
CPU(s):                  4
  On-line CPU(s) list:   0-3
Vendor ID:               GenuineIntel
  Model name:            Intel(R) Core(TM) i7-8559U CPU @ 2.70GHz
    CPU family:          6
    Thread(s) per core:  2
    Core(s) per socket:  2
    Socket(s):           1
Caches (sum of all):
  L1d:                   128 KiB (4 instances)
  L1i:                   128 KiB (4 instances)
  L2:                    1 MiB (2 instances)
  L3:                    8 MiB (1 instance)`,
  },
  lsmem: {
    name: 'lsmem',
    summary: 'list the ranges of available memory',
    run: () =>
      `RANGE                                  SIZE  STATE REMOVABLE  BLOCK
0x0000000000000000-0x000000007fffffff     2GiB online       yes    0-7
0x0000000100000000-0x000000017fffffff     2GiB online       yes   8-15`,
  },
  lsof: {
    name: 'lsof',
    summary: 'list open files (simulated)',
    run: (args, ctx) => {
      const filter = args.find((a) => !a.startsWith('-'));
      const cwd = ctx.cwd;
      const targets = filter
        ? [`${cwd}/welcome.txt`, `${cwd}/README.md`, `/etc/hostname`, `/etc/passwd`]
            .filter((p) => p.startsWith(filter))
        : [`${cwd}/welcome.txt`, `${cwd}/README.md`, `/etc/hostname`, `/etc/passwd`];
      return [
        'COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME',
        ...targets.map(
          (p, i) => `bash    ${1000 + i}  ${ctx.user}  txt    REG  801,0   ${p.length}    ${100 + i} ${p}`,
        ),
      ].join('\n');
    },
  },
  dmesg: {
    name: 'dmesg',
    summary: 'print or control the kernel ring buffer (simulated)',
    run: () =>
      [
        '[    0.000000] Linux version 5.15.0-learninx (builder@learninx) (gcc 11.4.0)',
        '[    0.012345] Command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1 ro quiet',
        '[    0.023456] x86/fpu: Supporting XSAVE feature 0x002: SSE registers',
        '[    0.034567] ACPI: Core revision 20220331',
        '[    0.045678] SCSI subsystem initialized',
        '[    0.123456] usb 1-1: new high-speed USB device number 2 using ehci-pci',
        '[    0.234567] usb 1-2: new full-speed USB device number 3 using ehci-pci',
        '[    0.345678] scsi 2:0:0:0: Direct-Access     ATA      Virtual Disk   0001 PQ: 0 ANSI: 5',
        '[    0.456789] EXT4-fs (sda1): mounted filesystem with ordered data mode',
        '[    1.012345] systemd[1]: Starting Journal Service...',
        '[    1.234567] systemd[1]: Reached target Local File Systems.',
      ].join('\n'),
  },
  last: {
    name: 'last',
    summary: 'show last logged-in users (simulated)',
    run: (_a, ctx) =>
      `${ctx.user}  pts/0        192.168.1.42     Mon Jun 30 09:14   still logged in
${ctx.user}  pts/0        192.168.1.42     Sun Jun 29 18:02 - 22:18  (04:16)
${ctx.user}  pts/0        192.168.1.42     Sat Jun 28 10:33 - 19:01  (08:28)
reboot   system boot  5.15.0-learninx   Sat Jun 28 10:32

wtmp begins Sat Jun 28 10:32:12 2025`,
  },
  who: {
    name: 'who',
    summary: 'show who is logged on',
    run: (_a, ctx) =>
      `${ctx.user}  pts/0        ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} (192.168.1.42)`,
  },
  groups: {
    name: 'groups',
    summary: 'print group memberships for a user',
    run: (args, ctx) => {
      const user = args[0] ?? ctx.user;
      return `${user} : ${user} sudo www-data docker`;
    },
  },
  logname: {
    name: 'logname',
    summary: 'return the user\'s login name',
    run: (_a, ctx) => ctx.user,
  },
  vmstat: {
    name: 'vmstat',
    summary: 'report virtual memory statistics',
    run: () =>
      `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0      0 5343008 1487624 6512928    0    0     0     0   45   82  2  1 96  0  0`,
  },
  iostat: {
    name: 'iostat',
    summary: 'report CPU and I/O statistics',
    run: () =>
      `Linux 5.15.0-learninx (learninx-sandbox)  06/30/26  _x86_64_  (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.34    0.00    1.05    0.12    0.00   96.49

Device   tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda      1.42        12.05         3.18     192840      50912
sdb      0.05         0.42         0.01       6720        128`,
  },
  history_stats: {
    name: 'history_stats',
    summary: 'show most-used commands from this session',
    run: (_a, ctx) => {
      if (ctx.history.length === 0) return '(no history)';
      const counts = new Map<string, number>();
      for (const h of ctx.history) {
        const cmd = h.trim().split(/\s+/)[0] ?? '';
        counts.set(cmd, (counts.get(cmd) ?? 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      return sorted
        .map(([c, n], i) => `${String(i + 1).padStart(2)}  ${String(n).padStart(4)}  ${c}`)
        .join('\n');
    },
  },
  uname: {
    name: 'uname',
    summary: 'kernel info',
    run: (args, ctx) =>
      args.includes('-a')
        ? `Linux ${ctx.host} 5.15.0-learninx #1 SMP x86_64 GNU/Linux`
        : 'Linux',
  },
  uptime: {
    name: 'uptime',
    summary: 'uptime',
    run: () => ` ${new Date().toLocaleTimeString()} up 0 days, load average: 0.04, 0.02, 0.01`,
  },
  free: {
    name: 'free',
    summary: 'memory info',
    run: (args) =>
      args.includes('-h')
        ? `              total        used        free      shared  buff/cache   available
Mem:          7.7Gi       1.2Gi       5.1Gi        12Mi       1.4Gi       6.3Gi
Swap:         2.0Gi          0B       2.0Gi`
        : `              total        used        free      shared  buff/cache   available
Mem:        8088064     1257432     5343008       12345     1487624     6512928
Swap:       2097148           0     2097148`,
  },
  df: {
    name: 'df',
    summary: 'disk usage',
    run: (args) =>
      args.includes('-h')
        ? `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   12G   35G  26% /`
        : `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       52428800 12582912 36700160  26% /`,
  },
  ps: {
    name: 'ps',
    summary: 'list processes',
    run: (args) => {
      if (args.includes('aux')) {
        return [
          'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
          'root         1  0.0  0.1  168928 11844 ?        Ss   Jun28   0:02 /sbin/init',
          'learner   1284  0.0  0.2  220000 18432 ?        S    Jun28   0:00 -bash',
          'learner   1301  0.0  0.1  156432  9216 ?        R    Jun28   0:00 ps aux',
        ].join('\n');
      }
      return `   PID TTY          TIME CMD
  1284 pts/0    00:00:00 bash
  1299 pts/0    00:00:00 ps`;
    },
  },
  top: {
    name: 'top',
    summary: 'live process viewer (snapshot)',
    run: () =>
      `top - ${new Date().toLocaleTimeString()}  up 0 days,  load average: 0.04, 0.02, 0.01
Tasks:  42 total,   1 running
%Cpu(s):  2.3 us,  1.0 sy,  0.0 ni, 96.5 id
MiB Mem :   7898.4 total,   5343.0 free,   1257.4 used
MiB Swap:   2048.0 total,   2048.0 free

  PID USER      PR  NI    VIRT    RES  SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  168928  11844  8424 S   0.0   0.1   0:02.01 systemd
 1284 learner   20   0  220000  18432 13456 S   0.0   0.2   0:00.10 bash
 1299 learner   20   0  156432   9216  7040 R   0.0   0.1   0:00.02 top`,
  },
  kill: {
    name: 'kill',
    summary: 'simulated process kill',
    run: (args) => {
      if (args.length === 0) return 'kill: usage: kill <pid>';
      const pid = args.find((a) => !a.startsWith('-'));
      if (!pid) return 'kill: missing pid';
      if (!/^\d+$/.test(pid)) return `kill: ${pid}: arguments must be process IDs`;
      return `(simulated) sent signal to pid ${pid} ✓`;
    },
  },
  id: {
    name: 'id',
    summary: 'print user identity',
    run: (_a, ctx) =>
      `uid=1000(${ctx.user}) gid=1000(${ctx.user}) groups=1000(${ctx.user}),27(sudo)`,
  },
  which: {
    name: 'which',
    summary: 'locate a command',
    run: (args) => {
      if (args.length === 0) return 'which: missing argument';
      return args
        .map((a) => (resolveCommand(a) ? `/usr/bin/${a}` : `${a} not found`))
        .join('\n');
    },
  },
  man: {
    name: 'man',
    summary: 'show short help for a command',
    run: (args) => {
      if (args.length === 0) return 'What manual page do you want?';
      const name = args[0];
      const c = resolveCommand(name);
      if (!c) return `No manual entry for ${name}`;
      const depth = name in COMMANDS ? 'Simulated implementation' : 'Recognized, but not deeply simulated';
      return `NAME\n  ${c.name} - ${c.summary}\n\nSYNOPSIS\n  ${c.name} [options] [args...]\n\nDESCRIPTION\n  ${depth} in the Learninx in-browser sandbox.`;
    },
  },
  help: {
    name: 'help',
    summary: 'list available commands',
    run: () =>
      Object.values(COMMANDS)
        .map((c) => `  ${c.name.padEnd(8)} ${c.summary}`)
        .join('\n') +
      `\n\n...plus ${KNOWN_UNSIMULATED_COMMANDS.size} more real commands (python3, npm, kubectl, rsync, and more) that run but aren't simulated in depth — try one and see.` +
      '\n\nTip: this is a teaching sandbox — not a full Linux kernel.\nUse `;`, `&&`, `||` to chain commands and `|` to pipe them.',
  },

  // ── networking (simulated) ──
  ping: {
    name: 'ping',
    summary: 'ping a host (simulated)',
    run: (args) => {
      if (args.length === 0) return 'ping: usage: ping <host>';
      const host = args[0];
      return [
        `PING ${host} (93.184.216.34) 56(84) bytes of data.`,
        `64 bytes from ${host}: icmp_seq=1 ttl=56 time=12.3 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=56 time=11.9 ms`,
        `64 bytes from ${host}: icmp_seq=3 ttl=56 time=12.1 ms`,
        `--- ${host} ping statistics ---`,
        `3 packets transmitted, 3 received, 0% packet loss`,
      ].join('\n');
    },
  },
  curl: {
    name: 'curl',
    summary: 'fetch a URL (simulated)',
    run: (args) => {
      const url = args.find((a) => /^https?:\/\//.test(a)) ?? args[0];
      if (!url) return 'curl: try "curl <url>"';
      if (args.includes('-I') || args.includes('--head')) {
        return `HTTP/1.1 200 OK\nContent-Type: text/html\nServer: learninx-sandbox\n`;
      }
      return `<!doctype html><html><body><h1>${url}</h1><p>(simulated response from Learninx sandbox)</p></body></html>`;
    },
  },
  wget: {
    name: 'wget',
    summary: 'download a URL (simulated)',
    run: (args) => {
      const url = args.find((a) => /^https?:\/\//.test(a)) ?? args[0];
      if (!url) return 'wget: missing URL';
      return `--${new Date().toISOString()}--  ${url}\nResolving... connecting... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1234 (1.2K) [text/html]\nSaving to: 'index.html'\n\n'index.html' saved [1234/1234]`;
    },
  },
  ssh: {
    name: 'ssh',
    summary: 'simulated ssh login',
    run: (args) => {
      if (args.length === 0) return 'ssh: usage: ssh user@host';
      return `(simulated) connected to ${args[0]}\nLast login: ${new Date().toUTCString()}\n${args[0].split('@').pop()}:~$ `;
    },
  },
  ifconfig: {
    name: 'ifconfig',
    summary: 'show network interfaces',
    run: () =>
      `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:1234  prefixlen 64  scopeid 0x20
        ether 08:00:27:4e:12:34  txqueuelen 1000  (Ethernet)
        RX packets 12345  bytes 8765432 (8.3 MiB)
        TX packets 9876   bytes 1234567 (1.1 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10
        loop  txqueuelen 1000  (Local Loopback)`,
  },
  ip: {
    name: 'ip',
    summary: 'show / manipulate routing (simulated, `ip addr`)',
    run: (args) => {
      if (args[0] === 'addr' || args[0] === 'a') {
        return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.42/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever
3: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever`;
      }
      return 'ip: (only `ip addr` is simulated in this sandbox)';
    },
  },

  // ── privileged / job control (simulated) ──
  sudo: {
    name: 'sudo',
    summary: 'run a command as another user (simulated)',
    run: (args) => {
      if (args.length === 0) return 'sudo: usage: sudo command';
      return `(simulated) running with elevated privileges: ${args.join(' ')}`;
    },
  },
  nohup: {
    name: 'nohup',
    summary: 'run a command immune to hangups, appending its output to nohup.out',
    run: (args, ctx) => {
      const [cmd, ...rest] = args;
      const impl = cmd ? COMMANDS[cmd] : undefined;
      if (!impl) return `nohup: failed to run command '${cmd ?? ''}': No such file or directory`;
      const out = impl.run(rest, ctx);
      const text = out == null ? '' : Array.isArray(out) ? out.join('\n') : out;
      const notice = "nohup: ignoring input and appending output to 'nohup.out'";
      writeFile(ctx, 'nohup.out', (readInput('nohup.out', ctx) ?? '') + text + '\n');
      return text ? `${notice}\n${text}` : notice;
    },
  },
  systemctl: {
    name: 'systemctl',
    summary: 'control systemd units (simulated — daemon-reload, enable, start, restart, stop, status)',
    run: (args) => {
      if (args.length === 0) return 'systemctl: usage: systemctl <command> [unit]';
      const sub = args[0];
      const rawUnit = args.find((a, i) => i > 0 && !a.startsWith('-'));
      const unit = rawUnit ? rawUnit.replace(/\.service$/, '') : '';
      switch (sub) {
        case 'daemon-reload':
          return null;
        case 'enable':
          if (!unit) return 'systemctl: missing unit';
          return `Created symlink /etc/systemd/system/multi-user.target.wants/${unit}.service → /etc/systemd/system/${unit}.service.`;
        case 'disable':
          if (!unit) return 'systemctl: missing unit';
          return `Removed /etc/systemd/system/multi-user.target.wants/${unit}.service.`;
        case 'start':
        case 'restart':
        case 'stop':
          if (!unit) return `systemctl: missing unit`;
          return null;
        case 'status':
          if (!unit) return 'systemctl: missing unit';
          return `● ${unit}.service - ${unit} service
   Loaded: loaded (/etc/systemd/system/${unit}.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2026-09-27 10:00:00 UTC; 3s ago
 Main PID: 4821 (${unit})
    Tasks: 1
   Memory: 1.2M
      CPU: 12ms`;
        default:
          return `systemctl: unknown command '${sub}'`;
      }
    },
  },

  // ── disks / mounting (simulated) ──
  mount: {
    name: 'mount',
    summary: 'mount a filesystem, or list mounted filesystems (simulated)',
    run: (args, ctx) => {
      const positional = args.filter((a) => !a.startsWith('-'));
      const mountsPath = '/proc/mounts';
      const DEFAULT = ['/dev/sda1 / ext4 rw,relatime 0 0', 'tmpfs /tmp tmpfs rw,nosuid,nodev 0 0'].join(
        '\n',
      ) + '\n';
      let node = resolveNode(ctx, mountsPath);
      if (!node || node.type !== 'file') {
        ensureDir(ctx, '/proc');
        writeFile(ctx, mountsPath, DEFAULT);
        node = resolveNode(ctx, mountsPath);
      }
      const current = node && node.type === 'file' ? node.content : DEFAULT;
      if (positional.length === 0) return current.trimEnd();
      if (positional.length < 2) return 'mount: usage: mount <device> <dir>';
      const [src, dest] = positional;
      writeFile(ctx, mountsPath, current + `${src} ${dest} ext4 rw,relatime 0 0\n`);
      return null;
    },
  },
  umount: {
    name: 'umount',
    summary: 'unmount a filesystem (simulated)',
    run: (args, ctx) => {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return 'umount: usage: umount <dir>';
      const node = resolveNode(ctx, '/proc/mounts');
      const content = node && node.type === 'file' ? node.content : '';
      const lines = content.split('\n').filter(Boolean);
      const kept = lines.filter((l) => l.split(' ')[1] !== target);
      if (kept.length === lines.length) return `umount: ${target}: not mounted`;
      writeFile(ctx, '/proc/mounts', kept.length ? kept.join('\n') + '\n' : '');
      return null;
    },
  },

  // ── job scheduling (simulated) ──
  crontab: {
    name: 'crontab',
    summary: "manage the current user's scheduled cron jobs (simulated) — <file>, -l, -e, -r",
    run: (args, ctx) => {
      const path = `/var/spool/cron/crontabs/${ctx.user}`;
      if (args.includes('-l')) {
        const node = resolveNode(ctx, path);
        if (!node || node.type !== 'file' || !node.content.trim()) return `no crontab for ${ctx.user}`;
        return node.content.trimEnd();
      }
      if (args.includes('-r')) {
        const loc = resolveParent(ctx, path);
        if (loc) delete loc.parent.children[loc.name];
        return null;
      }
      if (args.includes('-e')) {
        return "crontab: this sandbox has no interactive editor — write your schedule to a file, then run `crontab <file>` (see the Job Scheduling lesson).";
      }
      const file = args.find((a) => !a.startsWith('-'));
      if (!file) return 'crontab: usage: crontab <file> | crontab -l | crontab -e | crontab -r';
      const content = readInput(file, ctx);
      if (content === null) return `crontab: ${file}: No such file or directory`;
      ensureDir(ctx, '/var/spool/cron/crontabs');
      writeFile(ctx, path, content.endsWith('\n') ? content : content + '\n');
      return null;
    },
  },
  at: {
    name: 'at',
    summary: 'schedule a one-off job for later (simulated — pipe the command in: echo "cmd" | at <time>)',
    run: (args, ctx) => {
      const time = args.find((a) => !a.startsWith('-'));
      if (!time) return 'at: usage: echo "<command>" | at <time>';
      const cmd = (ctx.__lastStdin ?? '').trim();
      if (!cmd) {
        return `at: reading commands from stdin — this sandbox has no interactive prompt, so pipe one in: echo "/path/to/job.sh" | at ${time}`;
      }
      ensureDir(ctx, '/var/spool/at');
      const queuePath = '/var/spool/at/queue';
      const node = resolveNode(ctx, queuePath);
      const lines = (node && node.type === 'file' ? node.content : '').split('\n').filter(Boolean);
      const id = lines.length + 1;
      lines.push(`${id}|${time}|${cmd}`);
      writeFile(ctx, queuePath, lines.join('\n') + '\n');
      return `warning: commands will be executed using /bin/sh\njob ${id} at ${time}`;
    },
  },
  atq: {
    name: 'atq',
    summary: 'list pending at jobs (simulated)',
    run: (_a, ctx) => {
      const node = resolveNode(ctx, '/var/spool/at/queue');
      const lines = (node && node.type === 'file' ? node.content : '').split('\n').filter(Boolean);
      return lines
        .map((l) => {
          const [id, time] = l.split('|');
          return `${id}\t${time}\ta ${ctx.user}`;
        })
        .join('\n');
    },
  },
  atrm: {
    name: 'atrm',
    summary: 'remove a pending at job (simulated)',
    run: (args, ctx) => {
      const id = args[0];
      if (!id) return 'atrm: usage: atrm <job id>';
      const node = resolveNode(ctx, '/var/spool/at/queue');
      const lines = (node && node.type === 'file' ? node.content : '').split('\n').filter(Boolean);
      const kept = lines.filter((l) => l.split('|')[0] !== id);
      if (kept.length === lines.length) return `atrm: ${id}: no such job`;
      writeFile(ctx, '/var/spool/at/queue', kept.length ? kept.join('\n') + '\n' : '');
      return null;
    },
  },
  journalctl: {
    name: 'journalctl',
    summary: 'query the systemd journal (simulated) — -u <unit>, -b, -f, -n <count>',
    run: (args, ctx) => {
      const uIdx = args.findIndex((a) => a === '-u');
      const unit = uIdx >= 0 ? args[uIdx + 1] : null;
      const boot = args.includes('-b');
      const follow = args.includes('-f');
      const nIdx = args.findIndex((a) => a === '-n');
      const n = nIdx >= 0 ? parseInt(args[nIdx + 1] ?? '10', 10) || 10 : 10;
      const svc = unit ? unit.replace(/\.service$/, '') : 'systemd';
      const now = Date.now();
      const stamp = (offsetSec: number) => new Date(now - offsetSec * 1000).toTimeString().slice(0, 8);
      const lines = [
        `${stamp(50)} ${ctx.host} systemd[1]: Starting ${svc}...`,
        `${stamp(48)} ${ctx.host} ${svc}[4821]: listening for connections`,
        `${stamp(40)} ${ctx.host} ${svc}[4821]: configuration loaded`,
        `${stamp(30)} ${ctx.host} systemd[1]: Started ${svc}.`,
        `${stamp(20)} ${ctx.host} ${svc}[4821]: request handled in 4ms`,
        `${stamp(10)} ${ctx.host} ${svc}[4821]: request handled in 3ms`,
        `${stamp(2)} ${ctx.host} ${svc}[4821]: request handled in 5ms`,
      ];
      const scoped = boot ? [`-- Boot ${new Date(now - 3_600_000).toISOString()} --`, ...lines] : lines;
      const out = scoped.slice(-n).join('\n');
      return follow
        ? `${out}\n-- showing the latest lines; this sandbox can't truly stream new ones --`
        : out;
    },
  },

  // ── user management (simulated) ──
  useradd: {
    name: 'useradd',
    summary: "create a new user (simulated, writes /etc/passwd) — -m also creates a home dir",
    run: (args, ctx) => {
      const makeHome = args.includes('-m');
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'useradd: usage: useradd [-m] <name>';
      const node = resolveNode(ctx, '/etc/passwd');
      const content = node && node.type === 'file' ? node.content : '';
      const lines = content.split('\n').filter(Boolean);
      if (lines.some((l) => l.split(':')[0] === name)) return `useradd: user '${name}' already exists`;
      const maxUid = lines.reduce((max, l) => Math.max(max, parseInt(l.split(':')[2], 10) || 0), 1000);
      const uid = maxUid + 1;
      lines.push(`${name}:x:${uid}:${uid}:${name}:/home/${name}:/bin/bash`);
      writeFile(ctx, '/etc/passwd', lines.join('\n') + '\n');
      if (makeHome) ensureDir(ctx, `/home/${name}`);
      return null;
    },
  },
  adduser: {
    name: 'adduser',
    summary: 'friendly front-end to useradd (simulated, Debian/Ubuntu style)',
    run: (args, ctx) => {
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'adduser: usage: adduser <name>';
      const result = COMMANDS['useradd'].run(['-m', name], ctx);
      if (typeof result === 'string' && result.includes('already exists')) return result;
      return [
        `Adding user \`${name}' ...`,
        `Adding new group \`${name}' ...`,
        `Adding new user \`${name}' with group \`${name}' ...`,
        `Creating home directory \`/home/${name}' ...`,
        "Copying files from `/etc/skel' ...",
        'Done.',
      ].join('\n');
    },
  },
  userdel: {
    name: 'userdel',
    summary: 'delete a user (simulated, edits /etc/passwd) — -r also removes the home dir',
    run: (args, ctx) => {
      const removeHome = args.includes('-r');
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'userdel: usage: userdel [-r] <name>';
      const node = resolveNode(ctx, '/etc/passwd');
      const content = node && node.type === 'file' ? node.content : '';
      const lines = content.split('\n').filter(Boolean);
      const kept = lines.filter((l) => l.split(':')[0] !== name);
      if (kept.length === lines.length) return `userdel: user '${name}' does not exist`;
      writeFile(ctx, '/etc/passwd', kept.join('\n') + '\n');
      if (removeHome) {
        const loc = resolveParent(ctx, `/home/${name}`);
        if (loc) delete loc.parent.children[loc.name];
      }
      return null;
    },
  },
  passwd: {
    name: 'passwd',
    summary: "update a user's password (simulated)",
    run: (args, ctx) => {
      const name = args.find((a) => !a.startsWith('-')) ?? ctx.user;
      return `passwd: password updated successfully for ${name}`;
    },
  },
  su: {
    name: 'su',
    summary: 'switch user (simulated — this sandbox keeps one session user)',
    run: (args, ctx) => {
      const target = args.find((a) => !a.startsWith('-')) ?? 'root';
      return `(simulated) switched to ${target}\nNote: this teaching sandbox keeps a single session user (${ctx.user}) — whoami will still report "${ctx.user}".`;
    },
  },

  // ── job control (simulated — a trailing `&` backgrounds a command) ──
  jobs: {
    name: 'jobs',
    summary: 'list jobs started in this session with a trailing &',
    run: (_a, ctx) => {
      const list = ctx.jobs ?? [];
      if (list.length === 0) return '(no background jobs)';
      return list.map((j) => `[${j.id}]+  Done                    ${j.cmd}`).join('\n');
    },
  },
  fg: {
    name: 'fg',
    summary: 'bring a background job to the foreground (simulated)',
    run: (args, ctx) => {
      const list = ctx.jobs ?? [];
      if (list.length === 0) return 'fg: no current job';
      const spec = args[0]?.replace('%', '');
      const job = spec ? list.find((j) => String(j.id) === spec) : list[list.length - 1];
      if (!job) return `fg: ${args[0]}: no such job`;
      return `${job.cmd}\n(already completed — this sandbox runs commands to completion immediately)`;
    },
  },
  bg: {
    name: 'bg',
    summary: 'resume a stopped job in the background (simulated)',
    run: (args, ctx) => {
      const list = ctx.jobs ?? [];
      if (list.length === 0) return 'bg: no current job';
      const spec = args[0]?.replace('%', '');
      const job = spec ? list.find((j) => String(j.id) === spec) : list[list.length - 1];
      if (!job) return `bg: ${args[0]}: no such job`;
      return `bash: bg: job ${job.id} already completed`;
    },
  },

  // ── process control by name (simulated) ──
  pgrep: {
    name: 'pgrep',
    summary: 'find process IDs by name (-a also prints the command)',
    run: (args) => {
      const showCmd = args.includes('-a') || args.includes('-l');
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'pgrep: usage: pgrep [-a] <name>';
      const matches = SIM_PROCESSES.filter((p) => p.cmd.includes(name));
      if (matches.length === 0) return '';
      return matches.map((p) => (showCmd ? `${p.pid} ${p.cmd}` : String(p.pid))).join('\n');
    },
  },
  pkill: {
    name: 'pkill',
    summary: 'kill processes by name (simulated)',
    run: (args) => {
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'pkill: usage: pkill [-f] <name>';
      const matches = SIM_PROCESSES.filter((p) => p.cmd.includes(name));
      if (matches.length === 0) return `pkill: no process found matching '${name}'`;
      return `(simulated) sent signal to ${matches.map((p) => p.pid).join(', ')} ✓`;
    },
  },
  killall: {
    name: 'killall',
    summary: 'kill processes by exact name (simulated)',
    run: (args) => {
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) return 'killall: usage: killall <name>';
      const matches = SIM_PROCESSES.filter(
        (p) => p.cmd === name || p.cmd.split(' ')[0].replace(':', '') === name,
      );
      if (matches.length === 0) return `killall: ${name}: no process found`;
      return `(simulated) sent signal to ${matches.map((p) => p.pid).join(', ')} ✓`;
    },
  },

  // ── networking diagnostics (simulated) ──
  netstat: {
    name: 'netstat',
    summary: 'show listening ports (simulated)',
    run: (_a, ctx) => {
      const rows = [
        'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
        'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN',
      ];
      if (isPackageInstalled(ctx, 'nginx')) {
        rows.push('tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN');
      }
      return rows.join('\n');
    },
  },
  ss: {
    name: 'ss',
    summary: 'show socket statistics (simulated, the modern netstat replacement)',
    run: (_a, ctx) => {
      const rows = [
        'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port',
        'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*',
      ];
      if (isPackageInstalled(ctx, 'nginx')) {
        rows.push('tcp    LISTEN  0       511      0.0.0.0:80             0.0.0.0:*');
      }
      return rows.join('\n');
    },
  },
  dig: {
    name: 'dig',
    summary: 'query DNS for a host (simulated)',
    run: (args) => {
      const host = args.find((a) => !a.startsWith('-'));
      if (!host) return 'dig: usage: dig <host>';
      const ip = pseudoIp(host);
      return [
        `; <<>> DiG 9.18.0 <<>> ${host}`,
        ';; QUESTION SECTION:',
        `;${host}.\t\tIN\tA`,
        '',
        ';; ANSWER SECTION:',
        `${host}.\t300\tIN\tA\t${ip}`,
        '',
        ';; Query time: 24 msec',
        ';; SERVER: 127.0.0.53#53(127.0.0.53)',
      ].join('\n');
    },
  },
  nslookup: {
    name: 'nslookup',
    summary: 'query DNS for a host (simulated)',
    run: (args) => {
      const host = args.find((a) => !a.startsWith('-'));
      if (!host) return 'nslookup: usage: nslookup <host>';
      const ip = pseudoIp(host);
      return [
        'Server:\t\t127.0.0.53',
        'Address:\t127.0.0.53#53',
        '',
        'Non-authoritative answer:',
        `Name:\t${host}`,
        `Address: ${ip}`,
      ].join('\n');
    },
  },
  traceroute: {
    name: 'traceroute',
    summary: 'show the network hops to a host (simulated)',
    run: (args) => {
      const host = args.find((a) => !a.startsWith('-'));
      if (!host) return 'traceroute: usage: traceroute <host>';
      const ip = pseudoIp(host);
      const hops = 6;
      const lines = [`traceroute to ${host} (${ip}), 30 hops max`];
      for (let i = 1; i <= hops; i++) {
        const hopIp = i === hops ? ip : `10.0.${i}.1`;
        const ms = (i * 4 + (Math.abs(hashCode(host + i)) % 5)).toFixed(3);
        lines.push(`${i}   ${hopIp}   ${ms} ms`);
      }
      return lines.join('\n');
    },
  },

  // ── firewall (simulated) ──
  ufw: {
    name: 'ufw',
    summary: 'manage the firewall (simulated Uncomplicated Firewall) — enable, disable, status, allow, deny',
    run: (args, ctx) => {
      const statusPath = '/etc/ufw/status';
      const rulesPath = '/etc/ufw/rules';
      const [sub, ...rest] = args;
      switch (sub) {
        case 'enable':
          ensureDir(ctx, '/etc/ufw');
          writeFile(ctx, statusPath, 'active');
          return 'Firewall is active and enabled on system startup';
        case 'disable':
          ensureDir(ctx, '/etc/ufw');
          writeFile(ctx, statusPath, 'inactive');
          return 'Firewall stopped and disabled on system startup';
        case 'status': {
          const statusNode = resolveNode(ctx, statusPath);
          const status = statusNode && statusNode.type === 'file' ? statusNode.content.trim() : 'inactive';
          if (status !== 'active') return 'Status: inactive';
          const rulesNode = resolveNode(ctx, rulesPath);
          const rules = rulesNode && rulesNode.type === 'file' ? rulesNode.content.trim() : '';
          return ['Status: active', '', 'To                         Action      From', '--                         ------      ----', rules]
            .filter(Boolean)
            .join('\n');
        }
        case 'allow':
        case 'deny': {
          const port = rest.find((a) => !a.startsWith('-'));
          if (!port) return `ufw: usage: ufw ${sub} <port>`;
          ensureDir(ctx, '/etc/ufw');
          const rulesNode = resolveNode(ctx, rulesPath);
          const existing = rulesNode && rulesNode.type === 'file' ? rulesNode.content : '';
          const label = sub === 'allow' ? 'ALLOW' : 'DENY';
          writeFile(ctx, rulesPath, existing + `${port.padEnd(27)}${label}       Anywhere\n`);
          return 'Rule added';
        }
        default:
          return 'ufw: usage: ufw <enable|disable|status|allow|deny> [port]';
      }
    },
  },
  iptables: {
    name: 'iptables',
    summary: 'list default netfilter chains (simulated, read-only in this sandbox)',
    run: (args) => {
      if (args.length > 0 && !args.includes('-L')) {
        return 'iptables: this sandbox only simulates `iptables -L` (read-only)';
      }
      return [
        'Chain INPUT (policy ACCEPT)',
        'target     prot opt source               destination',
        '',
        'Chain FORWARD (policy ACCEPT)',
        'target     prot opt source               destination',
        '',
        'Chain OUTPUT (policy ACCEPT)',
        'target     prot opt source               destination',
      ].join('\n');
    },
  },

  // ── misc admin stubs ──
  visudo: {
    name: 'visudo',
    summary: 'safely edit /etc/sudoers (simulated)',
    run: () =>
      "visudo: opens /etc/sudoers in a syntax-checked editor — this sandbox has no interactive editor.\nUse sudo for one-off elevated commands instead (see the Linux Security Basics lesson).",
  },
  vimtutor: {
    name: 'vimtutor',
    summary: 'interactive vim tutorial (not available in this sandbox)',
    run: () =>
      'vimtutor: a real Linux command that launches an interactive ~30-minute vim tutorial.\nNot available in this browser sandbox — try it on a real Linux machine or WSL.',
  },

  // ── version control (simulated, but genuinely stateful) ──
  git: {
    name: 'git',
    summary: 'simulated version control — init, add, status, commit, log, branch, checkout, diff',
    run: (args, ctx) => {
      if (args.length === 0) return 'usage: git <command> [args]';
      const [sub, ...rest] = args;
      const NOT_A_REPO = 'fatal: not a git repository (or any of the parent directories): .git';
      switch (sub) {
        case 'init': {
          if (gitDir(ctx)) return `Reinitialized existing Git repository in ${ctx.cwd}/.git/`;
          ensureDir(ctx, '.git/refs');
          ensureDir(ctx, '.git/commits');
          writeFile(ctx, '.git/HEAD', 'main');
          writeFile(ctx, '.git/refs/main', '');
          writeFile(ctx, '.git/index', '{}');
          return `Initialized empty Git repository in ${ctx.cwd}/.git/`;
        }
        case 'status': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const branch = gitCurrentBranch(ctx);
          const headId = gitRefCommit(ctx, branch);
          const committed = headId ? gitReadCommit(ctx, headId)?.files ?? {} : {};
          const index = gitReadIndex(ctx);
          const cwdNode = resolveNode(ctx, '.');
          const working = cwdNode ? gitWalkWorkingFiles(cwdNode, '') : {};
          const staged: string[] = [];
          for (const [path, content] of Object.entries(index)) {
            if (!(path in committed)) staged.push(`\tnew file:   ${path}`);
            else if (committed[path] !== content) staged.push(`\tmodified:   ${path}`);
          }
          const notStaged: string[] = [];
          for (const [path, content] of Object.entries(working)) {
            if (path in index && index[path] !== content) notStaged.push(`\tmodified:   ${path}`);
          }
          const untracked: string[] = [];
          for (const path of Object.keys(working)) {
            if (!(path in index) && !(path in committed)) untracked.push(`\t${path}`);
          }
          const out: string[] = [`On branch ${branch}`];
          if (!headId) out.push('', 'No commits yet');
          if (staged.length) {
            out.push(
              '',
              'Changes to be committed:',
              '  (use "git restore --staged <file>..." to unstage)',
              ...staged,
            );
          }
          if (notStaged.length) {
            out.push(
              '',
              'Changes not staged for commit:',
              '  (use "git add <file>..." to update what will be committed)',
              ...notStaged,
            );
          }
          if (untracked.length) {
            out.push(
              '',
              'Untracked files:',
              '  (use "git add <file>..." to include in what will be committed)',
              ...untracked,
            );
          }
          if (!staged.length && !notStaged.length && !untracked.length && headId) {
            out.push('', 'nothing to commit, working tree clean');
          }
          return out.join('\n');
        }
        case 'add': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          if (rest.length === 0) return 'Nothing specified, nothing added.';
          const index = gitReadIndex(ctx);
          for (const arg of rest) {
            if (arg === '.') {
              const cwdNode = resolveNode(ctx, '.');
              if (cwdNode) Object.assign(index, gitWalkWorkingFiles(cwdNode, ''));
              continue;
            }
            const node = resolveNode(ctx, arg);
            if (!node) return `fatal: pathspec '${arg}' did not match any files`;
            if (node.type === 'file') index[arg] = node.content;
            else Object.assign(index, gitWalkWorkingFiles(node, arg));
          }
          gitWriteIndex(ctx, index);
          return null;
        }
        case 'commit': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const mIdx = rest.findIndex((a) => a === '-m');
          const message = mIdx >= 0 ? rest[mIdx + 1] : null;
          if (!message) return "error: switch `m' requires a value — use: git commit -m \"message\"";
          const index = gitReadIndex(ctx);
          const branch = gitCurrentBranch(ctx);
          const parentId = gitRefCommit(ctx, branch);
          const parentFiles = parentId ? gitReadCommit(ctx, parentId)?.files ?? {} : {};
          const files = { ...index };
          const noChanges = parentId !== null && JSON.stringify(files) === JSON.stringify(parentFiles);
          if (Object.keys(files).length === 0 || noChanges) {
            return 'nothing to commit, working tree clean';
          }
          const id = pseudoId(message + Date.now() + Math.random());
          const commit: GitCommit = {
            id,
            parent: parentId,
            message,
            author: 'learner <learner@learninx-sandbox>',
            date: `${new Date().toDateString()} ${new Date().toTimeString().split(' ')[0]}`,
            files,
          };
          ensureDir(ctx, '.git/commits');
          writeFile(ctx, `.git/commits/${id}`, JSON.stringify(commit));
          writeFile(ctx, `.git/refs/${branch}`, id);
          return `[${branch} ${id}] ${message}\n ${Object.keys(files).length} file(s) changed`;
        }
        case 'log': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const branch = gitCurrentBranch(ctx);
          let id: string | null = gitRefCommit(ctx, branch);
          if (!id) return `fatal: your current branch '${branch}' does not have any commits yet`;
          const out: string[] = [];
          while (id) {
            const commit = gitReadCommit(ctx, id);
            if (!commit) break;
            out.push(`commit ${commit.id}`, `Author: ${commit.author}`, `Date:   ${commit.date}`, '', `    ${commit.message}`, '');
            id = commit.parent;
          }
          return out.join('\n').trimEnd();
        }
        case 'branch': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const refsDir = resolveNode(ctx, '.git/refs');
          const branches = refsDir && refsDir.type === 'dir' ? Object.keys(refsDir.children) : [];
          if (rest.length === 0) {
            const current = gitCurrentBranch(ctx);
            return branches.map((b) => (b === current ? `* ${b}` : `  ${b}`)).join('\n');
          }
          const name = rest[0];
          const current = gitCurrentBranch(ctx);
          const headId = gitRefCommit(ctx, current);
          if (!headId) return "fatal: not a valid object name: 'HEAD'.";
          writeFile(ctx, `.git/refs/${name}`, headId);
          return null;
        }
        case 'checkout': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const createNew = rest[0] === '-b';
          const name = createNew ? rest[1] : rest[0];
          if (!name) return 'error: switch requires a value';
          if (createNew) {
            const current = gitCurrentBranch(ctx);
            const headId = gitRefCommit(ctx, current);
            writeFile(ctx, `.git/refs/${name}`, headId ?? '');
            writeFile(ctx, '.git/HEAD', name);
            return `Switched to a new branch '${name}'`;
          }
          const refsDir = resolveNode(ctx, '.git/refs');
          const exists = refsDir && refsDir.type === 'dir' && name in refsDir.children;
          if (!exists) return `error: pathspec '${name}' did not match any file(s) known to git`;
          // A real checkout doesn't just write the target branch's files —
          // it also removes files that were only ever committed on the
          // branch being left, so the working tree actually matches the
          // target branch (this is the whole point of branches: switching
          // makes files appear AND disappear). Untracked files (never
          // committed on either branch) are left alone either way.
          const fromId = gitRefCommit(ctx, gitCurrentBranch(ctx));
          const fromFiles = fromId ? gitReadCommit(ctx, fromId)?.files ?? {} : {};
          const targetId = gitRefCommit(ctx, name);
          const toFiles = targetId ? gitReadCommit(ctx, targetId)?.files ?? {} : {};
          for (const path of Object.keys(fromFiles)) {
            if (!(path in toFiles)) {
              const loc = resolveParent(ctx, path);
              if (loc) delete loc.parent.children[loc.name];
            }
          }
          for (const [path, content] of Object.entries(toFiles)) writeFile(ctx, path, content);
          writeFile(ctx, '.git/HEAD', name);
          return `Switched to branch '${name}'`;
        }
        case 'diff': {
          if (!gitDir(ctx)) return NOT_A_REPO;
          const index = gitReadIndex(ctx);
          const cwdNode = resolveNode(ctx, '.');
          const working = cwdNode ? gitWalkWorkingFiles(cwdNode, '') : {};
          const out: string[] = [];
          const paths = new Set([...Object.keys(index), ...Object.keys(working)]);
          for (const path of paths) {
            const a = index[path] ?? '';
            const b = working[path] ?? '';
            if (a === b) continue;
            out.push(`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`);
            const aLines = a.split('\n');
            const bLines = b.split('\n');
            const max = Math.max(aLines.length, bLines.length);
            for (let i = 0; i < max; i++) {
              if (aLines[i] !== bLines[i]) {
                if (aLines[i] !== undefined) out.push(`-${aLines[i]}`);
                if (bLines[i] !== undefined) out.push(`+${bLines[i]}`);
              }
            }
          }
          return out.length ? out.join('\n') : '';
        }
        default:
          return `git: '${sub}' is not a git command. See 'git --help'.`;
      }
    },
  },

  // ── archives: zip (simulated, same approach as tar) ──
  zip: {
    name: 'zip',
    summary: 'create a zip archive (simulated) — zip [-r] <archive.zip> <file...>',
    run: (args, ctx) => {
      const positional = args.filter((a) => !a.startsWith('-'));
      const archivePath = positional[0];
      const sources = positional.slice(1);
      if (!archivePath || sources.length === 0) return 'zip: usage: zip [-r] <archive.zip> <file...>';
      const entries: { name: string; node: FsNode }[] = [];
      for (const src of sources) {
        const node = resolveNode(ctx, src);
        if (!node) return `zip warning: name not matched: ${src}`;
        const name = src.replace(/\/+$/, '').split('/').pop() ?? src;
        entries.push(...zipWalkEntries(name, JSON.parse(JSON.stringify(node))));
      }
      const manifest = JSON.stringify(entries);
      writeFile(ctx, archivePath, `LEARNINX_ZIP_V1\n${btoa(manifest)}`);
      return [`  adding: ${archivePath}`, ...entries.map((e) => `  adding: ${e.name}`)].join('\n');
    },
  },
  unzip: {
    name: 'unzip',
    summary: 'extract a zip archive (simulated) — -l lists contents without extracting',
    run: (args, ctx) => {
      const listOnly = args.includes('-l');
      const archivePath = args.find((a) => !a.startsWith('-'));
      if (!archivePath) return 'unzip: usage: unzip [-l] <archive.zip>';
      const raw = readInput(archivePath, ctx);
      if (raw === null) return `unzip:  cannot find or open ${archivePath}`;
      if (!raw.startsWith('LEARNINX_ZIP_V1\n')) {
        return `unzip: ${archivePath}: not a zip archive this sandbox created`;
      }
      let entries: { name: string; node: FsNode }[];
      try {
        entries = JSON.parse(atob(raw.slice('LEARNINX_ZIP_V1\n'.length)));
      } catch {
        return `unzip: ${archivePath}: corrupt archive`;
      }
      if (listOnly) {
        return [
          `Archive:  ${archivePath}`,
          '  Length      Name',
          '  ------      ----',
          ...entries.map(
            (e) => `  ${String(e.node.type === 'file' ? e.node.content.length : 0).padStart(8)}  ${e.name}`,
          ),
        ].join('\n');
      }
      const cwdNode = resolveNode(ctx, '.');
      if (!cwdNode || cwdNode.type !== 'dir') return `unzip: ${ctx.cwd}: not a directory`;
      for (const e of entries) {
        const parts = e.name.split('/');
        const fileName = parts.pop()!;
        let dir: FsDir = cwdNode;
        for (const part of parts) {
          let next = dir.children[part];
          if (!next || next.type !== 'dir') {
            next = { type: 'dir', children: {} };
            dir.children[part] = next;
          }
          dir = next as FsDir;
        }
        dir.children[fileName] = JSON.parse(JSON.stringify(e.node));
      }
      return [`Archive:  ${archivePath}`, ...entries.map((e) => `  inflating: ${e.name}`)].join('\n');
    },
  },

  // ── docker (simplified simulated container engine) ──
  docker: {
    name: 'docker',
    summary: 'simulated container engine — pull, images, run, ps, stop, rm, rmi, build',
    run: (args, ctx) => {
      if (args.length === 0) return 'Usage: docker [OPTIONS] COMMAND';
      const [sub, ...rest] = args;
      switch (sub) {
        case 'pull': {
          const ref = rest[0];
          if (!ref) return 'docker: "docker pull" requires exactly 1 argument';
          const result = dockerPullImage(ctx, ref);
          if (!result) {
            const { repo } = dockerParseImageRef(ref);
            return `Error response from daemon: pull access denied for ${repo}, repository does not exist or may require 'docker login'`;
          }
          return result.lines.join('\n');
        }
        case 'images': {
          const state = dockerReadState(ctx);
          const header = 'REPOSITORY          TAG                 IMAGE ID       CREATED         SIZE';
          if (state.images.length === 0) return header;
          return [
            header,
            ...state.images.map(
              (i) =>
                `${i.repo.padEnd(20)}${i.tag.padEnd(20)}${i.id.padEnd(15)}${'Less than a minute ago'.padEnd(24)}${i.size}`,
            ),
          ].join('\n');
        }
        case 'run': {
          const detached = rest.includes('-d');
          const nameIdx = rest.findIndex((a) => a === '--name');
          const explicitName = nameIdx >= 0 ? rest[nameIdx + 1] : null;
          const positional = rest.filter((a, i) => !a.startsWith('-') && (nameIdx < 0 || i !== nameIdx + 1));
          const ref = positional[0];
          if (!ref) return 'docker: "docker run" requires at least 1 argument';
          const command = positional.slice(1).join(' ') || '/bin/sh';
          const { repo, tag } = dockerParseImageRef(ref);
          if (!(repo in DOCKER_HUB_CATALOG)) {
            return `Unable to find image '${ref}' locally\ndocker: Error response from daemon: pull access denied for ${repo}, repository does not exist or may require 'docker login'.`;
          }
          const pullResult = dockerPullImage(ctx, ref);
          const state = dockerReadState(ctx);
          const id = pseudoSha256(ref + Date.now() + Math.random());
          const name = explicitName ?? `${repo}_${pseudoId(id).slice(0, 5)}`;
          const container: DockerContainer = {
            id,
            name,
            image: `${repo}:${tag}`,
            command,
            status: 'running',
            createdAt: Date.now(),
          };
          state.containers.push(container);
          dockerWriteState(ctx, state);
          const pullLines =
            pullResult && !pullResult.alreadyPresent
              ? [`Unable to find image '${ref}' locally`, ...pullResult.lines, '']
              : [];
          return [...pullLines, detached ? id : `(simulated) running \`${command}\` in container ${id.slice(0, 12)}`].join(
            '\n',
          );
        }
        case 'ps': {
          const all = rest.includes('-a') || rest.includes('--all');
          const state = dockerReadState(ctx);
          const rows = all ? state.containers : state.containers.filter((c) => c.status === 'running');
          const header = 'CONTAINER ID   IMAGE          COMMAND           CREATED          STATUS          NAMES';
          if (rows.length === 0) return header;
          return [
            header,
            ...rows.map(
              (c) =>
                `${c.id.slice(0, 12).padEnd(15)}${c.image.padEnd(15)}${`"${c.command}"`.padEnd(18)}${'Less than a minute ago'.padEnd(24)}${(c.status === 'running' ? 'Up Less than a minute' : 'Exited (0)').padEnd(24)}${c.name}`,
            ),
          ].join('\n');
        }
        case 'stop': {
          const target = rest[0];
          if (!target) return 'docker: "docker stop" requires at least 1 argument';
          const state = dockerReadState(ctx);
          const c = state.containers.find((x) => x.id.startsWith(target) || x.name === target);
          if (!c) return `Error response from daemon: No such container: ${target}`;
          c.status = 'exited';
          dockerWriteState(ctx, state);
          return c.name;
        }
        case 'rm': {
          const target = rest[0];
          if (!target) return 'docker: "docker rm" requires at least 1 argument';
          const state = dockerReadState(ctx);
          const idx = state.containers.findIndex((x) => x.id.startsWith(target) || x.name === target);
          if (idx < 0) return `Error response from daemon: No such container: ${target}`;
          const [removed] = state.containers.splice(idx, 1);
          dockerWriteState(ctx, state);
          return removed.name;
        }
        case 'rmi': {
          const target = rest[0];
          if (!target) return 'docker: "docker rmi" requires at least 1 argument';
          const state = dockerReadState(ctx);
          const { repo, tag } = dockerParseImageRef(target);
          const idx = state.images.findIndex((i) => i.repo === repo && i.tag === tag);
          if (idx < 0) return `Error response from daemon: No such image: ${target}`;
          const [removed] = state.images.splice(idx, 1);
          dockerWriteState(ctx, state);
          return `Untagged: ${removed.repo}:${removed.tag}\nDeleted: sha256:${removed.id}`;
        }
        case 'build': {
          const tIdx = rest.findIndex((a) => a === '-t');
          const tag = tIdx >= 0 ? rest[tIdx + 1] : null;
          const dockerfile = resolveNode(ctx, 'Dockerfile');
          if (!dockerfile) {
            return 'unable to prepare context: unable to evaluate symlinks in Dockerfile path: lstat Dockerfile: no such file or directory';
          }
          if (!tag) return "docker: 'docker build' requires -t <name:tag>";
          const { repo, tag: imgTag } = dockerParseImageRef(tag);
          const state = dockerReadState(ctx);
          const id = pseudoId(repo + imgTag + Date.now()).slice(0, 12);
          state.images.push({ repo, tag: imgTag, id, size: '42.1MB' });
          dockerWriteState(ctx, state);
          return ['Step 1/1 : FROM scratch', ' ---> Using cache', `Successfully built ${id}`, `Successfully tagged ${repo}:${imgTag}`].join(
            '\n',
          );
        }
        default:
          return `docker: '${sub}' is not a docker command.\nSee 'docker --help'`;
      }
    },
  },
  gcloud: {
    name: 'gcloud',
    summary: 'simulated Google Cloud CLI — config, projects, iam, compute, storage, run, container',
    run: (args, ctx) =>
      runGcloud(args, {
        readState: () => {
          const node = resolveNode(ctx, GCLOUD_STATE_PATH);
          return node && node.type === 'file' ? node.content : null;
        },
        writeState: (json) => {
          ensureDir(ctx, '/home/learner/.config/gcloud');
          writeFile(ctx, GCLOUD_STATE_PATH, json);
        },
        readFile: (path) => {
          const node = resolveNode(ctx, path);
          return node && node.type === 'file' ? node.content : null;
        },
        writeFile: (path, content) => {
          if (path.startsWith('/home/learner/.kube/')) ensureDir(ctx, '/home/learner/.kube');
          return writeFile(ctx, path, content);
        },
      }),
  },
};

/** Where the simulated gcloud keeps its projects, VMs, buckets, and so on. */
const GCLOUD_STATE_PATH = '/home/learner/.config/gcloud/learninx-state.json';

export const COMMAND_NAMES = Object.keys(COMMANDS).sort();

// ────────────────────────────────────────────────── chain / pipe ──

// Split a command line into individual statements on ;, &&, || (preserving pipes).
function splitStatements(
  line: string,
): { line: string; op: ';' | '&&' | '||' | null }[] {
  const out: { line: string; op: ';' | '&&' | '||' | null }[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  // `op` on each entry means "the operator connecting the PREVIOUS statement
  // to this one" (so the caller can decide whether to run it based on the
  // previous statement's result) — not "the operator that follows it". That
  // means the operator we just scanned describes the statement we're about
  // to start accumulating, not the one we just finished.
  let pendingOp: ';' | '&&' | '||' | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '&' && line[i + 1] === '&') {
      out.push({ line: cur.trim(), op: pendingOp });
      cur = '';
      pendingOp = '&&';
      i++;
      continue;
    }
    if (ch === '|' && line[i + 1] === '|') {
      out.push({ line: cur.trim(), op: pendingOp });
      cur = '';
      pendingOp = '||';
      i++;
      continue;
    }
    if (ch === ';') {
      out.push({ line: cur.trim(), op: pendingOp });
      cur = '';
      pendingOp = ';';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push({ line: cur.trim(), op: pendingOp });
  return out;
}

// Extracts the command name of the LAST stage of a (possibly piped)
// statement, e.g. "cat file | grep foo" -> "grep". Used only for the
// success/failure heuristic above — a lightweight, non-quote-aware split is
// fine here since it only needs to be right for typical commands, not for
// pipes containing a literal `|` inside quotes.
function lastPipelineStageCommand(line: string): string {
  const stages = line.split('|');
  const lastStage = stages[stages.length - 1]?.trim() ?? '';
  return /^(\S+)/.exec(lastStage)?.[1] ?? '';
}

const STDIN_CONSUMERS = new Set([
  'cat', 'head', 'tail', 'wc', 'grep', 'sort', 'diff', 'xxd', 'base64',
  'tac', 'rev', 'nl', 'uniq', 'cut', 'tr', 'sed', 'awk', 'od', 'strings', 'tee', 'md5sum', 'sha256sum',
]);

function injectStdin(cmd: string, args: string[], stdin: string): string[] {
  // A command only needs piped stdin injected when it has no explicit file
  // operand yet — i.e. every arg so far is a flag (starts with '-'). This
  // lets flag-only invocations like `ps aux | wc -l` or `history | sort -u`
  // receive the piped text; commands that already named a real file operand
  // are left alone so that operand wins, matching real shell precedence.
  const hasFileOperand = args.some((a) => !a.startsWith('-'));
  if (STDIN_CONSUMERS.has(cmd) && !hasFileOperand) {
    return [`__STDIN__:${stdin}`, ...args];
  }
  return args;
}

interface Redirections {
  /** Everything left after stripping `>`, `>>` and `<` clauses. */
  cmdLine: string;
  outFile: string | null;
  append: boolean;
  inFile: string | null;
}

// Scans a single statement (already isolated from `;`, `&&`, `||`) for
// unquoted `>`, `>>` and `<` redirection operators, extracts their target
// filenames, and returns the remaining command line with those clauses
// removed. Redirection targets can themselves be quoted, e.g. `> "my file"`.
function stripRedirections(line: string): Redirections {
  let cmdLine = '';
  let quote: '"' | "'" | null = null;
  let outFile: string | null = null;
  let append = false;
  let inFile: string | null = null;

  function readTarget(startAt: number): { file: string; next: number } {
    let j = startAt;
    while (line[j] === ' ') j++;
    let file = '';
    let fq: '"' | "'" | null = null;
    while (j < line.length) {
      const c = line[j];
      if (fq) {
        if (c === fq) {
          fq = null;
          j++;
          continue;
        }
        file += c;
        j++;
        continue;
      }
      if (c === '"' || c === "'") {
        fq = c;
        j++;
        continue;
      }
      if (/\s/.test(c)) break;
      file += c;
      j++;
    }
    return { file, next: j };
  }

  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (quote) {
      cmdLine += ch;
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cmdLine += ch;
      i++;
      continue;
    }
    if (ch === '>') {
      const isAppend = line[i + 1] === '>';
      const { file, next } = readTarget(i + (isAppend ? 2 : 1));
      outFile = file || outFile;
      append = isAppend;
      i = next;
      continue;
    }
    if (ch === '<') {
      const { file, next } = readTarget(i + 1);
      inFile = file || inFile;
      i = next;
      continue;
    }
    cmdLine += ch;
    i++;
  }
  return { cmdLine: cmdLine.trim(), outFile, append, inFile };
}

// Expands `$NAME` and `${NAME}` references against `ctx.env`, the same way
// `export` populates it. Respects quoting like a real shell: expansion is
// suppressed inside single quotes, but happens unquoted and inside double
// quotes. An unset variable expands to the empty string.
function expandVariables(line: string, ctx: ShellContext): string {
  let out = '';
  let quote: '"' | "'" | null = null;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (quote === "'") {
      out += ch;
      if (ch === "'") quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = quote === ch ? null : quote ?? ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '$') {
      if (line[i + 1] === '{') {
        const end = line.indexOf('}', i + 2);
        if (end !== -1) {
          const name = line.slice(i + 2, end);
          out += ctx.env[name] ?? '';
          i = end + 1;
          continue;
        }
      }
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(i + 1));
      if (m) {
        out += ctx.env[m[0]] ?? '';
        i += 1 + m[0].length;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

function runStatement(rawLine: string, ctx: ShellContext): string | string[] | null {
  const line = expandVariables(rawLine, ctx);
  const { cmdLine, outFile, append, inFile } = stripRedirections(line);

  let inputContent = '';
  if (inFile) {
    const content = readInput(inFile, ctx);
    if (content === null) return `${inFile}: No such file or directory`;
    inputContent = content;
  }

  // Split on unquoted pipes.
  const stages: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < cmdLine.length; i++) {
    const ch = cmdLine[i];
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '|') {
      stages.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  stages.push(cur.trim());

  let prevOut = inFile ? inputContent : '';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const tokens = tokenize(stage);
    if (tokens.length === 0) continue;
    const cmd = tokens[0];
    const args = tokens.slice(1);
    const impl = resolveCommand(cmd);
    if (!impl) return `${cmd}: command not found`;
    const hasStdin = i > 0 || (i === 0 && Boolean(inFile));
    const pipedArgs = hasStdin ? injectStdin(cmd, args, prevOut) : args;
    ctx.__lastStdin = hasStdin ? prevOut : '';
    const out = impl.run(pipedArgs, ctx);
    const text = out == null ? '' : Array.isArray(out) ? out.join('\n') : out;
    if (text === '__CLEAR__') return text;
    prevOut = text;
  }

  if (outFile) {
    const prevContent = append ? (readInput(outFile, ctx) ?? '') : '';
    writeFile(ctx, outFile, prevContent + prevOut);
    return null;
  }
  return prevOut;
}

/**
 * Read a file for one of the real in-terminal editors (nano/vim/emacs —
 * see Terminal.tsx and lib/shell/editors.ts). Unlike `cat`, opening a
 * path that doesn't exist yet is not an error — every real editor just
 * starts with an empty buffer, same as `nano newfile.txt` on a real
 * system.
 */
export function readFileForEditor(
  ctx: ShellContext,
  path: string,
): { ok: true; content: string } | { ok: false; error: string } {
  const node = resolveNode(ctx, path);
  if (!node) return { ok: true, content: '' };
  if (node.type === 'dir') return { ok: false, error: `${path}: Is a directory` };
  return { ok: true, content: node.content };
}

/** Writes an editor's buffer back to the virtual filesystem, creating the file if it's new. */
export function writeFileForEditor(ctx: ShellContext, path: string, content: string): boolean {
  return writeFile(ctx, path, content);
}

/** Resolves a path exactly the way every shell command does, relative to `ctx.cwd`. */
export function resolveEditorPath(ctx: ShellContext, path: string): string {
  return joinPath(ctx.cwd, path);
}

/**
 * Path completion for the terminal's Tab key (see Terminal.tsx). Given
 * whatever the learner has typed as a path so far — possibly with a
 * directory portion, e.g. `src/le` — returns every matching entry in
 * that directory, written back out with the original directory portion
 * reattached (so the caller can splice it straight into the command
 * line) and a trailing `/` on directories, exactly like real shell
 * completion.
 */
export function completePathCandidates(ctx: ShellContext, partial: string): string[] {
  const lastSlash = partial.lastIndexOf('/');
  const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : '';
  const namePrefix = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;
  const lookupDir = dirPart === '' ? '.' : dirPart;
  const node = resolveNode(ctx, lookupDir);
  if (!node || node.type !== 'dir') return [];
  return Object.keys(node.children)
    .filter((name) => name.startsWith(namePrefix))
    .sort()
    .map((name) => dirPart + name + (node.children[name].type === 'dir' ? '/' : ''));
}

export function runCommand(input: string, ctx: ShellContext): string | string[] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  ctx.history.push(trimmed);

  // A single trailing `&` (not `&&`) backgrounds the whole preceding list,
  // same as a real shell. This sandbox has no true concurrency, so the
  // command still runs to completion immediately — it's just recorded as a
  // finished job instead of printing inline, for `jobs` / `fg` / `bg`.
  const backgrounded = trimmed.endsWith('&') && !trimmed.endsWith('&&');
  const effective = backgrounded ? trimmed.slice(0, -1).trim() : trimmed;
  if (backgrounded && !effective) return null;

  const statements = splitStatements(effective);
  let lastExitOk = true;
  let lastOut: string | string[] | null = null;
  for (const { line, op } of statements) {
    if (!line) continue;
    if (op === '&&' && !lastExitOk) break;
    if (op === '||' && lastExitOk) continue;
    lastOut = runStatement(line, ctx);
    const text =
      lastOut == null ? '' : Array.isArray(lastOut) ? lastOut.join('\n') : lastOut;
    if (text === '__CLEAR__') return lastOut;
    // No command here returns a real exit code — every implementation just
    // returns a string. Every error message in this file follows the same
    // convention real Unix tools use, `<command>: <what went wrong>`, so we
    // treat output starting with the *actually invoked* command's own name
    // and a colon as a failure. Matching against the specific command that
    // ran (not just any leading word) keeps this from misfiring on file
    // content that happens to start with "word: ".
    const failedCmd = lastPipelineStageCommand(line);
    lastExitOk =
      text !== '__NUL__' &&
      !(failedCmd !== '' && text.startsWith(`${failedCmd}: `)) &&
      // gcloud's own error convention: `ERROR: (gcloud.compute.instances.create) ...`
      !(failedCmd !== '' && text.startsWith(`ERROR: (${failedCmd}`));
  }

  if (backgrounded) {
    ctx.jobs = ctx.jobs ?? [];
    const id = ctx.jobs.length + 1;
    const pid = 20000 + (Math.abs(hashCode(effective)) % 9999);
    ctx.jobs.push({ id, pid, cmd: effective });
    const text = lastOut == null ? '' : Array.isArray(lastOut) ? lastOut.join('\n') : lastOut;
    const header = `[${id}] ${pid}`;
    return text ? `${header}\n${text}` : header;
  }

  return lastOut;
}

// ────────────────────────────────────────────────── tokenizer ──

function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) {
        quote = null;
        continue;
      }
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur);
        cur = '';
      }
      continue;
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
