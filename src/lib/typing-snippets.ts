/**
 * Library of shell-command snippets for the typing test.
 *
 * Every snippet is plain text with no markup, and must be valid
 * shell-like text that a learner might actually type at a terminal.
 * The list is intentionally small so the test can be replayed many
 * times without ever seeing the same exact snippet twice in a row.
 */

export const TYPING_SNIPPETS: string[] = [
  'ls -la /var/log',
  'cd /etc && cat hosts',
  'find . -name "*.log"',
  'grep -r "ERROR" /var/log',
  'sudo apt update && sudo apt upgrade -y',
  'tar -czvf backup.tar.gz /home/user',
  'ssh -i ~/.ssh/id_rsa user@server',
  'chmod 755 deploy.sh && ./deploy.sh',
  'ps aux | grep nginx',
  'tail -n 100 -f /var/log/syslog',
  'du -sh * | sort -h',
  'curl -fsSL https://example.com/install.sh | bash',
  'systemctl restart nginx && systemctl status nginx',
  'docker run --rm -it alpine sh',
  'git log --oneline --graph --decorate --all',
  'awk "{print $1}" access.log | sort | uniq -c | sort -rn',
  'sed -i "s/old/new/g" file.txt',
  'crontab -e',
  'rsync -avz ./build/ user@host:/var/www/',
  'history | awk "{print $4}" | sort | uniq -c | sort -rn | head',
];
