/**
 * Daily Linux tips. One is "today's tip" based on the current UTC
 * date — the rotation is deterministic so every visitor on the same
 * day sees the same tip.
 */

export interface DailyTip {
  title: string;
  body: string;
  example: string;
}

const TIPS: DailyTip[] = [
  {
    title: 'Tab completion saves your fingers',
    body: 'In the in-browser sandbox, pressing Tab once completes the current command. Try typing whoa then Tab — it will fill in to whoami.',
    example: 'whoa<Tab>  →  whoami',
  },
  {
    title: 'The `-h` flag is your friend',
    body: 'Almost every command accepts `-h` or `--help` to print a quick summary of its flags. `free -h`, `df -h` and `du -h` are the most useful.',
    example: 'df -h',
  },
  {
    title: 'Use `!!` to repeat the last command',
    body: 'In a real terminal, `!!` expands to whatever you ran most recently. Combined with `sudo !!` it is the canonical "I forgot to sudo" recovery.',
    example: 'sudo !!',
  },
  {
    title: 'Press `Ctrl+L` to clear the screen',
    body: 'It does not erase your history, it just scrolls the prompt back to the top. Your typed commands are still in the buffer.',
    example: 'Ctrl + L',
  },
  {
    title: '`less` is more than `cat`',
    body: '`cat` dumps the whole file. `less` opens a pager. Inside `less`, use `/` to search, `q` to quit. Our sandbox simulates `less` so you can try it safely.',
    example: 'less /etc/passwd',
  },
  {
    title: 'Combine commands with pipes',
    body: 'The `|` operator feeds the output of one command into the next. `ls | wc -l` counts the number of entries in the current directory.',
    example: 'ls | wc -l',
  },
  {
    title: '`grep` is the search workhorse',
    body: '`grep PATTERN file` prints only the lines that contain PATTERN. Use `grep -i` to ignore case and `grep -v` to invert the match.',
    example: 'grep -i error /var/log/syslog',
  },
  {
    title: 'Use `man -k` when you forget a command',
    body: '`man -k keyword` searches the man-page index. `man -k "list files"` is a great way to find a tool when you only remember the task.',
    example: 'man -k archive',
  },
  {
    title: 'A single `&` backgrounds a process',
    body: 'Append `&` to run a command in the background. The terminal prints the job id and a PID, and you can keep working while it runs.',
    example: 'sleep 5 &',
  },
  {
    title: '`history` keeps a log of everything',
    body: 'The shell records every command you typed. Use the up arrow to step through them, or `history | grep cp` to find past uses of a specific command.',
    example: 'history | grep cp',
  },
  {
    title: 'Read the path of the executable',
    body: '`which ls` prints the full path of the command that will run. Useful for figuring out which `python` you are about to call.',
    example: 'which python3',
  },
  {
    title: 'Quoting matters',
    body: '`echo hello world` prints two words. `echo "hello world"` prints one. Single quotes suppress expansion; double quotes allow `$VARIABLE` to be substituted.',
    example: 'echo "today is $(date)"',
  },
];

export function getDailyTip(now: Date = new Date()): {
  tip: DailyTip;
  dayKey: string;
} {
  const dayKey = now.toISOString().slice(0, 10);
  // Convert YYYY-MM-DD into a stable integer seed.
  const seed = Number(dayKey.replace(/-/g, '')) || 1;
  const idx = seed % TIPS.length;
  return { tip: TIPS[idx], dayKey };
}

export function getAllTips(): DailyTip[] {
  return TIPS;
}
