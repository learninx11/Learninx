/**
 * Library of shell-command snippets for the typing test.
 *
 * Every snippet is plain text with no markup, and must be valid
 * shell-like text that a learner might actually type at a terminal.
 * The list is intentionally small so the test can be replayed many
 * times without ever seeing the same exact snippet twice in a row.
 *
 * `usage` is a one-line, plain-English explanation of what the command
 * actually does, shown under it during the test — so typing speed
 * practice doubles as a quick "what does this do" refresher instead of
 * just muscle-memory copying of unfamiliar text.
 *
 * `difficulty` uses the same scale as lessons and boss levels
 * (`@/lib/types`), and drives the easy → intermediate → advanced →
 * expert progression in the typing test itself: short, single-idea
 * commands are `beginner`; everything with a pipe, chain, or more
 * than a couple of flags ramps up from there.
 */

import type { Difficulty } from '@/lib/types';

export interface TypingSnippet {
  text: string;
  usage: string;
  difficulty: Difficulty;
}

export const TYPING_SNIPPETS: TypingSnippet[] = [
  // --- beginner: one idea, minimal flags ---------------------------------
  { text: 'pwd', usage: 'Print the current working directory.', difficulty: 'beginner' },
  { text: 'whoami', usage: 'Print the currently logged-in username.', difficulty: 'beginner' },
  { text: 'ls -la /var/log', usage: 'List every file in /var/log, including hidden ones, in long format.', difficulty: 'beginner' },
  { text: 'cd /etc && cat hosts', usage: 'Jump into /etc and print the hosts file.', difficulty: 'beginner' },
  { text: 'mkdir backup && cd backup', usage: 'Create a new backup directory and move into it.', difficulty: 'beginner' },
  { text: 'crontab -e', usage: "Open the current user's cron schedule for editing.", difficulty: 'beginner' },

  // --- intermediate: one pipe or chain, a few flags -----------------------
  { text: 'find . -name "*.log"', usage: 'Find every .log file under the current directory.', difficulty: 'intermediate' },
  { text: 'grep -r "ERROR" /var/log', usage: 'Recursively search /var/log for lines containing ERROR.', difficulty: 'intermediate' },
  { text: 'ps aux | grep nginx', usage: 'List every process and filter it down to lines mentioning nginx.', difficulty: 'intermediate' },
  {
    text: 'tail -n 100 -f /var/log/syslog',
    usage: 'Show the last 100 lines of syslog, then keep following new lines live.',
    difficulty: 'intermediate',
  },
  {
    text: 'du -sh * | sort -h',
    usage: 'Show the size of every item in the current directory, sorted smallest to largest.',
    difficulty: 'intermediate',
  },
  { text: 'docker run --rm -it alpine sh', usage: 'Start a throwaway Alpine container with an interactive shell.', difficulty: 'intermediate' },
  { text: 'chmod 755 deploy.sh && ./deploy.sh', usage: 'Make deploy.sh executable, then run it.', difficulty: 'intermediate' },

  // --- advanced: longer flags, chaining, sudo, remote ops -----------------
  {
    text: 'sudo apt update && sudo apt upgrade -y',
    usage: 'Refresh the package index, then upgrade every installed package without prompting.',
    difficulty: 'advanced',
  },
  {
    text: 'tar -czvf backup.tar.gz /home/user',
    usage: 'Create a gzip-compressed archive of /home/user, listing files as it goes.',
    difficulty: 'advanced',
  },
  {
    text: 'ssh -i ~/.ssh/id_rsa user@server',
    usage: 'Log into a remote server over SSH using a specific private key.',
    difficulty: 'advanced',
  },
  {
    text: 'systemctl restart nginx && systemctl status nginx',
    usage: 'Restart the nginx service, then show its current status.',
    difficulty: 'advanced',
  },
  {
    text: 'git log --oneline --graph --decorate --all',
    usage: 'Show a compact, branch-graph view of every commit in the repo.',
    difficulty: 'advanced',
  },
  { text: 'sed -i "s/old/new/g" file.txt', usage: 'Replace every occurrence of old with new directly inside file.txt.', difficulty: 'advanced' },
  {
    text: 'rsync -avz ./build/ user@host:/var/www/',
    usage: 'Sync the build/ directory to a remote server, compressed and preserving file attributes.',
    difficulty: 'advanced',
  },

  // --- expert: multiple pipes, field parsing, long chains ------------------
  {
    text: 'curl -fsSL https://example.com/install.sh | bash',
    usage: 'Silently download a script and pipe it straight into bash to run.',
    difficulty: 'expert',
  },
  {
    text: 'awk "{print $1}" access.log | sort | uniq -c | sort -rn',
    usage: 'Count how often each first field (e.g. an IP address) appears in access.log, most frequent first.',
    difficulty: 'expert',
  },
  {
    text: 'history | awk "{print $4}" | sort | uniq -c | sort -rn | head',
    usage: 'Show the most frequently used commands from your shell history.',
    difficulty: 'expert',
  },
  {
    text: 'find /var/log -mtime +30 -name "*.log" -exec rm {} \\;',
    usage: "Delete every .log file under /var/log that's older than 30 days.",
    difficulty: 'expert',
  },
  {
    text: 'docker ps -a --format "{{.Names}}: {{.Status}}" | grep -v Up',
    usage: "List every container's name and status, filtered to the ones that aren't currently running.",
    difficulty: 'expert',
  },
];
