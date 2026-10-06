/**
 * Command explainer: turn a shell one-liner into a token-by-token
 * explanation, the way explainshell.com does, using only data that
 * ships with the app (the cheatsheet plus a curated flag table).
 *
 * Pure and dependency-free apart from the cheatsheet, so it runs in
 * the static export and is easy to unit-test.
 */

import { CHEATSHEET, type CheatEntry } from './cheatsheet';

export interface FlagInfo {
  text: string;
  /** True when the flag consumes the next token as its value. */
  takesValue?: boolean;
}

type FlagTable = Record<string, Record<string, FlagInfo | string>>;

/**
 * Hand-written flag notes for the commands learners meet most. Keys
 * are command names; values map a flag to a description (or to a
 * FlagInfo when the flag takes a value).
 */
const FLAGS: FlagTable = {
  gcloud: {
    '--project': { text: 'Run this one command against a different project than the configured default.', takesValue: true },
    '--zone': { text: 'The zone the resource lives in, e.g. us-central1-a.', takesValue: true },
    '--region': { text: 'The region the resource lives in, e.g. us-central1.', takesValue: true },
    '--location': { text: 'A region or zone, for commands that accept either (GKE clusters).', takesValue: true },
    '--machine-type': { text: 'VM size: vCPUs and memory, e.g. e2-medium.', takesValue: true },
    '--image-family': { text: 'Boot from the newest image in this family, e.g. debian-12.', takesValue: true },
    '--image-project': { text: 'The project that hosts a public image, e.g. debian-cloud.', takesValue: true },
    '--image': { text: 'Container image to deploy (Cloud Run).', takesValue: true },
    '--allow-unauthenticated': 'Make a Cloud Run service public by granting roles/run.invoker to allUsers.',
    '--member': { text: 'The principal to grant, with a type prefix such as user: or serviceAccount:.', takesValue: true },
    '--role': { text: 'The IAM role to grant, e.g. roles/storage.objectViewer.', takesValue: true },
    '--network': { text: 'The VPC network to use (defaults to "default").', takesValue: true },
    '--allow': { text: 'Protocols and ports the firewall rule allows, e.g. tcp:22.', takesValue: true },
    '--source-ranges': { text: 'Where allowed traffic may come from. Omitted on an ingress rule means 0.0.0.0/0.', takesValue: true },
    '--target-tags': { text: 'Apply the firewall rule only to VMs with these network tags.', takesValue: true },
    '--subnet-mode': { text: 'auto (one subnet per region) or custom (you create subnets).', takesValue: true },
    '--default-storage-class': { text: 'Storage class for new objects: standard, nearline, coldline, or archive.', takesValue: true },
    '--format': { text: 'Output format: json, yaml, csv, or value(FIELDS) for script-friendly output.', takesValue: true },
    '--quiet': 'Answer yes to every prompt. Use in scripts.',
  },
  ls: {
    '-l': 'Long listing: permissions, links, owner, group, size, and modified time.',
    '-a': 'Show hidden entries, the ones whose names start with a dot.',
    '-A': 'Like -a, but leave out the `.` and `..` entries.',
    '-h': 'Human-readable sizes such as 4.0K and 12M (used with -l).',
    '-t': 'Sort by modification time, newest first.',
    '-r': 'Reverse the sort order.',
    '-S': 'Sort by file size, largest first.',
    '-R': 'List subdirectories recursively.',
    '-1': 'One entry per line.',
    '-d': 'List directories themselves, not their contents.',
  },
  grep: {
    '-i': 'Ignore case when matching.',
    '-v': 'Invert the match: print lines that do NOT match.',
    '-r': 'Search directories recursively.',
    '-R': 'Search recursively and follow symlinks.',
    '-n': 'Prefix each match with its line number.',
    '-c': 'Print only a count of matching lines.',
    '-l': 'Print only the names of files that contain a match.',
    '-w': 'Match whole words only.',
    '-x': 'Match whole lines only.',
    '-E': 'Use extended regular expressions (`+`, `?`, `|` and groups without backslashes).',
    '-F': 'Treat the pattern as a fixed string, not a regex.',
    '-o': 'Print only the matched part of each line.',
    '-q': 'Quiet: print nothing, just set the exit status.',
    '-A': { text: 'Print N lines of context after each match.', takesValue: true },
    '-B': { text: 'Print N lines of context before each match.', takesValue: true },
    '-C': { text: 'Print N lines of context around each match.', takesValue: true },
    '-e': { text: 'Use the next argument as the pattern (handy when it starts with -).', takesValue: true },
  },
  rm: {
    '-r': 'Remove directories and everything inside them, recursively.',
    '-R': 'Same as -r.',
    '-f': 'Force: never prompt, and ignore files that do not exist.',
    '-i': 'Ask before every removal.',
    '-v': 'Print each file as it is removed.',
    '-d': 'Remove empty directories.',
  },
  cp: {
    '-r': 'Copy directories recursively.',
    '-R': 'Same as -r.',
    '-a': 'Archive mode: recursive, and preserve permissions, owners, and timestamps.',
    '-i': 'Ask before overwriting an existing file.',
    '-n': 'Never overwrite an existing file.',
    '-v': 'Print each file as it is copied.',
    '-p': 'Preserve mode, ownership, and timestamps.',
    '-u': 'Copy only when the source is newer than the destination.',
  },
  mv: {
    '-i': 'Ask before overwriting an existing file.',
    '-n': 'Never overwrite an existing file.',
    '-f': 'Overwrite without asking.',
    '-v': 'Print each file as it is moved.',
    '-u': 'Move only when the source is newer than the destination.',
  },
  mkdir: {
    '-p': 'Create missing parent directories, and do not complain if the directory exists.',
    '-v': 'Print each directory as it is created.',
    '-m': { text: 'Set the permission mode of the new directory, e.g. 755.', takesValue: true },
  },
  chmod: {
    '-R': 'Apply the change recursively to everything inside a directory.',
    '-v': 'Print every file that is processed.',
    '-c': 'Print only the files whose mode actually changed.',
  },
  chown: {
    '-R': 'Change ownership recursively.',
    '-v': 'Print every file that is processed.',
    '-h': 'Change a symlink itself instead of the file it points to.',
  },
  tar: {
    '-c': 'Create a new archive.',
    '-x': 'Extract files from an archive.',
    '-t': 'List the contents of an archive.',
    '-v': 'Verbose: list files as they are processed.',
    '-f': { text: 'Use the next argument as the archive file name.', takesValue: true },
    '-z': 'Compress or decompress with gzip (.tar.gz / .tgz).',
    '-j': 'Compress or decompress with bzip2 (.tar.bz2).',
    '-J': 'Compress or decompress with xz (.tar.xz).',
    '-C': { text: 'Change to this directory before doing anything.', takesValue: true },
    '--exclude': 'Skip files that match the given pattern.',
  },
  find: {
    '-name': { text: 'Match file names against a glob pattern (case-sensitive).', takesValue: true },
    '-iname': { text: 'Like -name, but case-insensitive.', takesValue: true },
    '-type': { text: 'Filter by type: f for files, d for directories, l for symlinks.', takesValue: true },
    '-size': { text: 'Filter by size, e.g. +10M for larger than 10 MB.', takesValue: true },
    '-mtime': { text: 'Filter by days since last modification, e.g. -7 for the past week.', takesValue: true },
    '-maxdepth': { text: 'Descend at most N directory levels.', takesValue: true },
    '-mindepth': { text: 'Skip matches shallower than N levels.', takesValue: true },
    '-user': { text: 'Match files owned by this user.', takesValue: true },
    '-perm': { text: 'Match files with these permission bits.', takesValue: true },
    '-path': { text: 'Match the whole path against a glob pattern.', takesValue: true },
    '-empty': 'Match empty files and directories.',
    '-delete': 'Delete every match. Run without it first to check what matches.',
    '-print': 'Print the path of each match (the default action).',
    '-exec': 'Run a command on each match. `{}` is replaced by the path, and the command ends at `\\;` or `+`.',
    '-not': 'Negate the test that follows.',
    '-o': 'OR: match if either the test before or after succeeds.',
  },
  ps: {
    aux: 'BSD style: every process (a), with the owning user (u), including ones with no terminal (x).',
    '-e': 'Select every process.',
    '-f': 'Full format listing, including the parent PID and the full command line.',
    '-ef': 'Every process in full format. The System V twin of `ps aux`.',
    '-u': { text: 'Show processes owned by this user.', takesValue: true },
    '-p': { text: 'Show only these process IDs.', takesValue: true },
    '--sort': 'Sort the output by the given column, e.g. -%mem.',
  },
  head: {
    '-n': { text: 'Print the first N lines (default 10).', takesValue: true },
    '-c': { text: 'Print the first N bytes.', takesValue: true },
  },
  tail: {
    '-n': { text: 'Print the last N lines (default 10).', takesValue: true },
    '-f': 'Follow: keep printing new lines as the file grows. Ctrl+C stops it.',
    '-F': 'Follow by name, and reopen the file if it is rotated.',
    '-c': { text: 'Print the last N bytes.', takesValue: true },
  },
  sort: {
    '-n': 'Sort numerically instead of alphabetically.',
    '-r': 'Reverse the order.',
    '-u': 'Output only the first of each run of equal lines.',
    '-h': 'Sort human-readable sizes such as 2K and 1G.',
    '-k': { text: 'Sort by this field (column), e.g. -k2.', takesValue: true },
    '-t': { text: 'Use this character as the field separator.', takesValue: true },
    '-f': 'Ignore case.',
  },
  uniq: {
    '-c': 'Prefix each line with how many times it occurred.',
    '-d': 'Print only lines that are repeated.',
    '-u': 'Print only lines that are not repeated.',
    '-i': 'Ignore case when comparing.',
  },
  wc: {
    '-l': 'Count lines.',
    '-w': 'Count words.',
    '-c': 'Count bytes.',
    '-m': 'Count characters.',
  },
  cut: {
    '-d': { text: 'Use this character as the field delimiter (default is tab).', takesValue: true },
    '-f': { text: 'Select these fields, e.g. 1,3 or 2-4.', takesValue: true },
    '-c': { text: 'Select these character positions.', takesValue: true },
  },
  sed: {
    '-n': 'Do not print every line automatically. Only lines you `p`rint are shown.',
    '-i': 'Edit the file in place instead of printing to stdout.',
    '-e': { text: 'Add the next argument as a script expression.', takesValue: true },
    '-E': 'Use extended regular expressions.',
    '-r': 'Use extended regular expressions (GNU spelling).',
  },
  awk: {
    '-F': { text: 'Use this as the field separator instead of whitespace.', takesValue: true },
    '-v': { text: 'Set an awk variable before the program runs, e.g. -v n=5.', takesValue: true },
  },
  du: {
    '-h': 'Human-readable sizes.',
    '-s': 'Summarise: one total per argument instead of every subdirectory.',
    '-a': 'Include files, not just directories.',
    '-c': 'Print a grand total at the end.',
    '-d': { text: 'Show totals only N levels deep.', takesValue: true },
  },
  df: {
    '-h': 'Human-readable sizes.',
    '-T': 'Show the filesystem type.',
    '-i': 'Show inode usage instead of block usage.',
  },
  free: {
    '-h': 'Human-readable sizes.',
    '-m': 'Show sizes in mebibytes.',
    '-g': 'Show sizes in gibibytes.',
  },
  curl: {
    '-s': 'Silent: hide the progress meter and errors.',
    '-S': 'Show errors even when -s is used.',
    '-L': 'Follow redirects.',
    '-o': { text: 'Write the response body to this file.', takesValue: true },
    '-O': 'Save to a file named after the last part of the URL.',
    '-I': 'Fetch only the response headers (HEAD request).',
    '-i': 'Include the response headers in the output.',
    '-v': 'Verbose: show the request and response headers.',
    '-X': { text: 'Use this HTTP method, e.g. POST or DELETE.', takesValue: true },
    '-H': { text: 'Add this request header.', takesValue: true },
    '-d': { text: 'Send this data as the request body (implies POST).', takesValue: true },
    '-f': 'Fail with a non-zero exit code on HTTP errors instead of printing the error page.',
    '-k': 'Skip TLS certificate verification. Avoid outside testing.',
  },
  wget: {
    '-O': { text: 'Write the download to this file (- for stdout).', takesValue: true },
    '-q': 'Quiet: no output.',
    '-c': 'Continue a partially downloaded file.',
    '-r': 'Download recursively.',
  },
  ssh: {
    '-p': { text: 'Connect to this port instead of 22.', takesValue: true },
    '-i': { text: 'Use this private key file.', takesValue: true },
    '-L': { text: 'Forward a local port to a remote address (local:host:remote).', takesValue: true },
    '-v': 'Verbose: print debugging messages about the connection.',
    '-N': 'Do not run a remote command. Useful with port forwarding.',
  },
  ln: {
    '-s': 'Make a symbolic link instead of a hard link.',
    '-f': 'Replace an existing destination file.',
    '-n': 'Treat a symlink to a directory as a normal file.',
  },
  cat: {
    '-n': 'Number every output line.',
    '-b': 'Number non-blank output lines.',
    '-A': 'Show non-printing characters, tabs as ^I and line ends as $.',
  },
  kill: {
    '-9': 'Send SIGKILL: the process is stopped immediately and cannot clean up.',
    '-15': 'Send SIGTERM (the default): ask the process to exit cleanly.',
    '-l': 'List the signal names.',
    '-s': { text: 'Send the named signal, e.g. -s HUP.', takesValue: true },
  },
  journalctl: {
    '-u': { text: 'Show logs for this systemd unit.', takesValue: true },
    '-f': 'Follow new log entries as they arrive.',
    '-n': { text: 'Show the last N entries.', takesValue: true },
    '-b': 'Show logs from the current boot.',
    '-p': { text: 'Filter by priority, e.g. err.', takesValue: true },
    '--since': { text: 'Show entries newer than this time, e.g. "1 hour ago".', takesValue: true },
  },
  xargs: {
    '-n': { text: 'Pass at most N arguments per command run.', takesValue: true },
    '-I': { text: 'Replace this placeholder in the command with each input item.', takesValue: true },
    '-0': 'Input items are separated by NUL characters (pairs with find -print0).',
    '-P': { text: 'Run up to N commands in parallel.', takesValue: true },
  },
  tee: {
    '-a': 'Append to the files instead of overwriting them.',
  },
  echo: {
    '-n': 'Do not print the trailing newline.',
    '-e': 'Interpret backslash escapes such as \\n and \\t.',
  },
  history: {
    '-c': 'Clear the history list.',
  },
  uname: {
    '-a': 'Print everything: kernel name, host, release, version, and machine.',
    '-r': 'Print the kernel release.',
    '-m': 'Print the machine hardware name.',
  },
  systemctl: {
    '--now': 'With enable/disable, also start/stop the unit right away.',
    '--user': 'Talk to the per-user service manager instead of the system one.',
  },
  gzip: {
    '-d': 'Decompress.',
    '-k': 'Keep the original file.',
    '-r': 'Compress files in directories recursively.',
    '-9': 'Best (slowest) compression.',
    '-1': 'Fastest (weakest) compression.',
  },
  diff: {
    '-u': 'Unified format: the one patches and code review tools use.',
    '-r': 'Compare directories recursively.',
    '-q': 'Report only whether the files differ.',
  },
};

/** Subcommands that are worth naming even though they are not flags. */
const SUBCOMMANDS: Record<string, Record<string, string>> = {
  gcloud: {
    init: 'Sign in and choose a default project, region, and zone, interactively.',
    config: 'View or change gcloud properties such as core/project and compute/zone.',
    auth: 'Manage the accounts gcloud is signed in with.',
    projects: 'List projects and manage their IAM allow policy.',
    iam: 'Manage service accounts and roles.',
    services: 'Enable or list Google Cloud APIs on the project.',
    compute: 'Compute Engine: VMs, disks, networks, and firewall rules.',
    storage: 'Cloud Storage: buckets and the objects in them.',
    run: 'Cloud Run: deploy and manage serverless container services.',
    container: 'Google Kubernetes Engine (GKE) clusters.',
  },
  systemctl: {
    start: 'Start the unit now.',
    stop: 'Stop the unit now.',
    restart: 'Stop the unit, then start it again.',
    reload: 'Ask the unit to reload its configuration without stopping.',
    status: 'Show whether the unit is running, plus its most recent log lines.',
    enable: 'Start the unit automatically at boot.',
    disable: 'Stop starting the unit at boot.',
    'daemon-reload': 'Re-read unit files after you edit them.',
  },
  apt: {
    update: 'Refresh the package index from the configured repositories.',
    upgrade: 'Install newer versions of every installed package.',
    install: 'Install the named packages.',
    remove: 'Uninstall the named packages, keeping their config files.',
    purge: 'Uninstall the named packages and their config files.',
    search: 'Search the package index.',
    list: 'List packages (use --installed for installed ones).',
  },
};

export type TokenKind =
  | 'command'
  | 'subcommand'
  | 'flag'
  | 'value'
  | 'argument'
  | 'operator'
  | 'redirect'
  | 'assignment';

export interface ExplainedToken {
  text: string;
  kind: TokenKind;
  /** Human explanation. Empty for plain arguments. */
  note: string;
}

export interface ExplainedSegment {
  /** The cheatsheet entry for the command, if it is known. */
  entry: CheatEntry | null;
  command: string;
  tokens: ExplainedToken[];
}

export interface Explanation {
  /** Commands and operators, in the order they appear. */
  parts: (ExplainedSegment | ExplainedToken)[];
  /** Commands that were not found in the cheatsheet. */
  unknown: string[];
}

const OPERATORS: Record<string, string> = {
  '|': 'Pipe: send the output of the command on the left into the input of the command on the right.',
  '&&': 'AND: run the next command only if the previous one succeeded (exit status 0).',
  '||': 'OR: run the next command only if the previous one failed.',
  ';': 'Run the next command afterwards, whether or not this one succeeded.',
  '&': 'Run the command in the background and return to the prompt right away.',
};

const REDIRECTS: Record<string, string> = {
  '>': 'Write standard output to this file, replacing whatever was in it.',
  '>>': 'Append standard output to the end of this file.',
  '<': 'Read standard input from this file.',
  '2>': 'Write error messages (stderr) to this file.',
  '2>>': 'Append error messages (stderr) to this file.',
  '&>': 'Write both output and errors to this file.',
  '2>&1': 'Send errors (stderr) to the same place as normal output (stdout).',
};

const PREFIX_COMMANDS = new Set(['sudo', 'time', 'nohup', 'nice', 'watch', 'timeout', 'xargs', 'exec']);

/** Split a command line into words and operators, respecting quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let buf = '';
  let quote: '"' | "'" | null = null;
  let hasBuf = false;
  const flush = () => {
    if (hasBuf) out.push(buf);
    buf = '';
    hasBuf = false;
  };
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      hasBuf = true;
      continue;
    }
    if (ch === '\\' && i + 1 < line.length) {
      buf += ch + line[i + 1]!;
      hasBuf = true;
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      flush();
      continue;
    }
    const rest = line.slice(i);
    const op = ['2>&1', '2>>', '&&', '||', '>>', '&>', '2>', '|', ';', '&', '>', '<'].find(
      (o) => rest.startsWith(o) && (o !== '2>' && o !== '2>>' && o !== '2>&1' ? true : !hasBuf),
    );
    if (op) {
      flush();
      out.push(op);
      i += op.length - 1;
      continue;
    }
    buf += ch;
    hasBuf = true;
  }
  flush();
  return out;
}

const ENTRY_BY_NAME: Map<string, CheatEntry> = (() => {
  const map = new Map<string, CheatEntry>();
  for (const e of CHEATSHEET) {
    const names = e.cmd
      .replace(/\(.*?\)/g, '')
      .split('/')
      .map((s) => s.trim().split(' ')[0]!.toLowerCase())
      .filter(Boolean);
    for (const n of names) {
      // Prefer the first (main) entry over "(advanced)" follow-ups.
      if (!map.has(n)) map.set(n, e);
    }
  }
  return map;
})();

export function findEntry(name: string): CheatEntry | null {
  return ENTRY_BY_NAME.get(name.toLowerCase()) ?? null;
}

function lookupFlag(cmd: string, flag: string): FlagInfo | null {
  const table = FLAGS[cmd];
  const raw = table?.[flag];
  if (raw) return typeof raw === 'string' ? { text: raw } : raw;
  return null;
}

/** Find a sentence in the cheatsheet prose that mentions `flag`. */
function flagFromProse(entry: CheatEntry | null, flag: string): string | null {
  if (!entry) return null;
  const needle = `\`${flag}\``;
  if (!entry.long.includes(needle)) return null;
  const sentence = entry.long
    .split(/(?<=\.)\s+/)
    .find((s) => s.includes(needle));
  return sentence ? sentence.replace(/`/g, '') : null;
}

function explainFlag(cmd: string, entry: CheatEntry | null, flag: string): { notes: ExplainedToken[]; takesValue: boolean } {
  const [name, inlineValue] = flag.startsWith('--') && flag.includes('=')
    ? [flag.slice(0, flag.indexOf('=')), flag.slice(flag.indexOf('=') + 1)]
    : [flag, undefined];

  const direct = lookupFlag(cmd, name);
  if (direct) {
    const note = inlineValue !== undefined ? `${direct.text} Value: ${inlineValue}.` : direct.text;
    return {
      notes: [{ text: flag, kind: 'flag', note }],
      takesValue: !!direct.takesValue && inlineValue === undefined,
    };
  }
  // A value-taking short option with its value attached: `-d:`, `-k2`.
  if (/^-[A-Za-z]./.test(flag)) {
    const head = lookupFlag(cmd, flag.slice(0, 2));
    if (head?.takesValue) {
      return {
        notes: [{ text: flag, kind: 'flag', note: `${head.text} Value: ${flag.slice(2)}` }],
        takesValue: false,
      };
    }
  }

  const prose = flagFromProse(entry, name);
  if (prose) return { notes: [{ text: flag, kind: 'flag', note: prose }], takesValue: false };

  // Bundled short flags: `-la` is `-l` plus `-a`. Stop at the first
  // letter that takes a value; the rest of the bundle is its value
  // (`-n5`) or the next word is.
  if (/^-[A-Za-z0-9]{2,}$/.test(flag)) {
    const parts: string[] = [];
    let takesValue = false;
    for (let i = 1; i < flag.length; i += 1) {
      const single = `-${flag[i]}`;
      const info = lookupFlag(cmd, single);
      const text = info?.text ?? flagFromProse(entry, single) ?? 'Option (no description available).';
      parts.push(`${single}: ${text}`);
      if (info?.takesValue) {
        const rest = flag.slice(i + 1);
        if (rest) parts.push(`Value: ${rest}`);
        else takesValue = true;
        break;
      }
    }
    return { notes: [{ text: flag, kind: 'flag', note: parts.join(' ') }], takesValue };
  }
  return { notes: [{ text: flag, kind: 'flag', note: 'Option (no description available).' }], takesValue: false };
}

function explainSegment(words: string[]): ExplainedSegment[] {
  const segments: ExplainedSegment[] = [];
  let i = 0;
  const tokens: ExplainedToken[] = [];

  // Leading VAR=value assignments only apply to this one command.
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]!)) {
    const w = words[i]!;
    tokens.push({
      text: w,
      kind: 'assignment',
      note: `Set the environment variable ${w.split('=')[0]} for this command only.`,
    });
    i += 1;
  }
  if (i >= words.length) {
    if (tokens.length > 0) segments.push({ entry: null, command: '', tokens });
    return segments;
  }

  const cmd = words[i]!;
  const cmdLower = cmd.toLowerCase();
  const entry = findEntry(cmdLower);
  tokens.push({ text: cmd, kind: 'command', note: entry ? entry.short : 'Command not in the cheatsheet.' });
  i += 1;

  let expectValue = false;
  let seenSub = false;
  for (; i < words.length; i += 1) {
    const w = words[i]!;
    if (REDIRECTS[w]) {
      tokens.push({ text: w, kind: 'redirect', note: REDIRECTS[w]! });
      if (w !== '2>&1' && i + 1 < words.length) {
        tokens.push({ text: words[i + 1]!, kind: 'value', note: 'Redirect target.' });
        i += 1;
      }
      continue;
    }
    if (expectValue) {
      tokens.push({ text: w, kind: 'value', note: 'Value for the option before it.' });
      expectValue = false;
      continue;
    }
    // `sudo ls -la`: explain the wrapped command as its own segment.
    if (PREFIX_COMMANDS.has(cmdLower) && !w.startsWith('-') && findEntry(w)) {
      segments.push({ entry, command: cmd, tokens });
      return [...segments, ...explainSegment(words.slice(i))];
    }
    const sub = SUBCOMMANDS[cmdLower]?.[w];
    if (sub && !seenSub) {
      tokens.push({ text: w, kind: 'subcommand', note: sub });
      seenSub = true;
      continue;
    }
    const looksLikeFlag =
      (w.startsWith('-') && w.length > 1 && w !== '--') || (cmdLower === 'ps' && lookupFlag('ps', w));
    if (looksLikeFlag) {
      const { notes, takesValue } = explainFlag(cmdLower, entry, w);
      tokens.push(...notes);
      expectValue = takesValue;
      continue;
    }
    tokens.push({ text: w, kind: 'argument', note: '' });
  }
  segments.push({ entry, command: cmd, tokens });
  return segments;
}

/** Explain a full command line. */
export function explainCommand(line: string): Explanation {
  const words = tokenize(line.trim().replace(/^\$\s+/, ''));
  const parts: Explanation['parts'] = [];
  const unknown: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length === 0) return;
    for (const seg of explainSegment(current)) {
      parts.push(seg);
      if (seg.command && !seg.entry && !unknown.includes(seg.command)) unknown.push(seg.command);
    }
    current = [];
  };
  for (const w of words) {
    if (OPERATORS[w]) {
      flush();
      parts.push({ text: w, kind: 'operator', note: OPERATORS[w]! });
    } else {
      current.push(w);
    }
  }
  flush();
  return { parts, unknown };
}

export function isSegment(part: ExplainedSegment | ExplainedToken): part is ExplainedSegment {
  return (part as ExplainedSegment).tokens !== undefined;
}

/** Ready-made examples shown as one-click chips on the page. */
export const EXPLAIN_EXAMPLES = [
  'ls -lah /var/log',
  'ps aux | grep nginx | wc -l',
  "find . -name '*.log' -mtime +7 -delete",
  'tar -czvf backup.tar.gz ~/projects',
  "grep -rn 'TODO' src | sort | uniq -c",
  'du -sh * | sort -h | tail -n 5',
  'mkdir -p build && cp -r src/* build/ 2>/dev/null',
  "cut -d: -f1 /etc/passwd | sort > users.txt",
  'sudo systemctl restart nginx',
  'curl -sSL https://example.com -o page.html',
];
