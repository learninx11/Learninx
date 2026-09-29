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
 */

export interface TypingSnippet {
  text: string;
  usage: string;
}

export const TYPING_SNIPPETS: TypingSnippet[] = [
  { text: 'ls -la /var/log', usage: 'List every file in /var/log, including hidden ones, in long format.' },
  { text: 'cd /etc && cat hosts', usage: "Jump into /etc and print the hosts file." },
  { text: 'find . -name "*.log"', usage: 'Find every .log file under the current directory.' },
  { text: 'grep -r "ERROR" /var/log', usage: 'Recursively search /var/log for lines containing ERROR.' },
  {
    text: 'sudo apt update && sudo apt upgrade -y',
    usage: 'Refresh the package index, then upgrade every installed package without prompting.',
  },
  {
    text: 'tar -czvf backup.tar.gz /home/user',
    usage: 'Create a gzip-compressed archive of /home/user, listing files as it goes.',
  },
  {
    text: 'ssh -i ~/.ssh/id_rsa user@server',
    usage: 'Log into a remote server over SSH using a specific private key.',
  },
  { text: 'chmod 755 deploy.sh && ./deploy.sh', usage: 'Make deploy.sh executable, then run it.' },
  { text: 'ps aux | grep nginx', usage: 'List every process and filter it down to lines mentioning nginx.' },
  {
    text: 'tail -n 100 -f /var/log/syslog',
    usage: 'Show the last 100 lines of syslog, then keep following new lines live.',
  },
  {
    text: 'du -sh * | sort -h',
    usage: 'Show the size of every item in the current directory, sorted smallest to largest.',
  },
  {
    text: 'curl -fsSL https://example.com/install.sh | bash',
    usage: 'Silently download a script and pipe it straight into bash to run.',
  },
  {
    text: 'systemctl restart nginx && systemctl status nginx',
    usage: 'Restart the nginx service, then show its current status.',
  },
  { text: 'docker run --rm -it alpine sh', usage: 'Start a throwaway Alpine container with an interactive shell.' },
  {
    text: 'git log --oneline --graph --decorate --all',
    usage: 'Show a compact, branch-graph view of every commit in the repo.',
  },
  {
    text: 'awk "{print $1}" access.log | sort | uniq -c | sort -rn',
    usage: 'Count how often each first field (e.g. an IP address) appears in access.log, most frequent first.',
  },
  { text: 'sed -i "s/old/new/g" file.txt', usage: 'Replace every occurrence of old with new directly inside file.txt.' },
  { text: 'crontab -e', usage: "Open the current user's cron schedule for editing." },
  {
    text: 'rsync -avz ./build/ user@host:/var/www/',
    usage: 'Sync the build/ directory to a remote server, compressed and preserving file attributes.',
  },
  {
    text: 'history | awk "{print $4}" | sort | uniq -c | sort -rn | head',
    usage: 'Show the most frequently used commands from your shell history.',
  },
];
