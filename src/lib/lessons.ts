/**
 * Lesson catalogue and quiz questions — single source of truth, in code.
 *
 * The previous version of this project stored lessons and quiz questions in a
 * SQLite database via Prisma. That layer has been removed. Lessons and quizzes
 * now ship directly in the JavaScript bundle so the app needs no DB to run.
 *
 * Per-visitor progress (which lessons are completed, quiz scores) is stored
 * in a signed cookie — see `./progress.ts`. This keeps the app stateless
 * server-side while still giving each browser a persistent "profile" without
 * a signup flow.
 */

import type { Lesson, QuizQuestion } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 'getting-started',
    slug: 'getting-started',
    title: 'Getting Started with Linux',
    description: 'What Linux is, the shell, and your first commands.',
    difficulty: 'beginner',
    order: 1,
    trackCommand: 'whoami',
    challenge: 'Use a single command to print the word `linux` to the screen.',
    solution: 'echo linux',
    content: `# Getting Started with Linux

**Linux** is a free, open-source operating system kernel that powers everything from phones to supercomputers. Most servers on the internet run Linux, and it is the single most important skill for anyone in DevOps, cloud, or backend development.

## What is the shell?

The **shell** is a program that takes commands from your keyboard and gives them to the operating system. The most common shell on Linux is called **bash**.

When you open a terminal, you see a *prompt* that ends with a dollar sign \`$\`. Everything you type after that prompt is a command.

## Your first commands

Try these in the terminal on the right:

\`\`\`bash
whoami          # show your current user
date            # show the current date and time
echo hello      # print "hello"
clear           # clear the screen
\`\`\`

> Lines that start with \`#\` are **comments**; the shell ignores them. They are just for you.

## Why learn the command line?

- Far faster than clicking through menus.
- Automatable; write a **script** once, run it forever.
- Works the same on a tiny VM or a giant cluster.

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'filesystem-navigation',
    slug: 'filesystem-navigation',
    title: 'Filesystem Navigation',
    description: 'Move around the filesystem with `pwd`, `ls`, and `cd`.',
    difficulty: 'beginner',
    order: 2,
    trackCommand: 'ls',
    challenge: 'From `/home/learner`, change into the `projects` directory.',
    solution: 'cd projects',
    content: `# Filesystem Navigation

Linux organises everything under a single root directory \`/\`. Unlike Windows, there are no drive letters; everything branches off \`/\`.

## Three commands you will use constantly

| Command | What it does                  | Example         |
| ------- | ----------------------------- | --------------- |
| \`pwd\`   | Print current directory       | \`pwd\`          |
| \`ls\`    | List files in current dir     | \`ls -la\`       |
| \`cd\`    | Change directory              | \`cd /tmp\`      |

## Paths

- **Absolute paths** start at \`/\`, e.g. \`/home/learner\`.
- **Relative paths** start from where you are, e.g. \`../projects\`.

Special directory shortcuts:

- \`.\` - the current directory
- \`..\` - the parent directory
- \`~\` - your home directory

## Try it

\`\`\`bash
pwd                # shows something like /home/learner
ls                 # list contents
ls -la             # long format, including hidden files
cd /tmp            # jump to /tmp
pwd                # confirm you're now in /tmp
cd ~               # back home
\`\`\`
`,
  },
  {
    id: 'files-and-dirs',
    slug: 'files-and-dirs',
    title: 'Creating and Manipulating Files',
    description: 'touch, mkdir, cp, mv, rm - the core file operations.',
    difficulty: 'beginner',
    order: 3,
    trackCommand: 'mkdir',
    challenge:
      'Create a new directory called `lab` and then create an empty file `lab/notes.txt` inside it. Do it in two commands.',
    solution: 'mkdir lab && touch lab/notes.txt',
    content: `# Creating and Manipulating Files

In this lesson you'll learn the everyday verbs for working with files and directories.

## Make

\`\`\`bash
mkdir projects          # create a directory
mkdir -p a/b/c          # create nested directories (-p = parents)
touch notes.txt         # create an empty file (or update timestamp)
\`\`\`

## Inspect

\`\`\`bash
cat notes.txt           # print file contents
less notes.txt          # page through a file (q to quit)
head -n 5 notes.txt     # first 5 lines
wc -l notes.txt         # count lines
\`\`\`

## Move / copy / delete

\`\`\`bash
cp notes.txt copy.txt        # copy
mv notes.txt renamed.txt     # rename / move
rm renamed.txt               # delete a file
rm -r projects               # delete a directory recursively
\`\`\`

> Warning: \`rm\` is **permanent**. There is no recycle bin. Triple-check before running \`rm -rf /\`.

## Edit

You'll often edit files straight from the terminal:

- \`nano notes.txt\` - beginner-friendly editor
- \`vim notes.txt\` - powerful but steep learning curve
`,
  },
  {
    id: 'pipes-and-redirection',
    slug: 'pipes-and-redirection',
    title: 'Pipes and Redirection',
    description: 'Chain commands with pipes, and send output to files with > and >>.',
    difficulty: 'beginner',
    order: 4,
    trackCommand: 'echo',
    challenge:
      'Write the text `deploy ready` into a new file called `status.txt` using a single redirected command.',
    solution: 'echo deploy ready > status.txt',
    content: `# Pipes and Redirection

Every command you run has three data streams attached to it:

- **stdin** (standard input) - where it reads input from; by default, your keyboard.
- **stdout** (standard output) - where it writes results; by default, your screen.
- **stderr** (standard error) - where it writes error messages; also your screen, by default.

Two shell features let you rewire those streams: **redirection** (send a stream to or from a file) and **pipes** (send one command's stdout straight into the next command's stdin).

## Redirecting output to a file

\`\`\`bash
ls > listing.txt          # overwrite listing.txt with the output of ls
echo "hello" > note.txt   # overwrite note.txt with "hello"
\`\`\`

\`>\` always **overwrites** the target file, creating it if it does not exist. Use \`>>\` to **append** instead of overwriting:

\`\`\`bash
echo "first line" > log.txt
echo "second line" >> log.txt
cat log.txt
\`\`\`

## Redirecting input from a file

\`<\` feeds a file's contents in as a command's stdin - the opposite direction from \`>\`:

\`\`\`bash
wc -l < log.txt          # count the lines in log.txt
\`\`\`

## Pipes: connecting commands

A pipe (\`|\`) takes the stdout of the command on its left and feeds it in as the stdin of the command on its right. Instead of one giant command, you chain small, single-purpose tools together:

\`\`\`bash
ps aux | grep root       # only the process lines mentioning "root"
ls | wc -l               # count how many entries are in the current directory
history | grep cd        # find cd commands you've already run
\`\`\`

You can chain more than two: \`cat access.log | grep ERROR | wc -l\` counts how many lines mention "ERROR".

> This sandbox keeps things approachable and does not separately model stderr (\`2>\`) - everything a command prints goes through the same stream you see redirected with \`>\`.

## Try it

\`\`\`bash
echo "queued" > status.txt
cat status.txt
echo "shipped" >> status.txt
cat status.txt
wc -l < status.txt
\`\`\`

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - its chapter on redirection is the clearest treatment of this topic you'll find, and covers file descriptors and \`2>\` in full.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains the same ideas from the kernel's point of view, including how file descriptors actually work under the hood.
`,
  },
  {
    id: 'environment-variables',
    slug: 'environment-variables',
    title: 'Environment Variables and PATH',
    description: 'Read and set variables with $VAR, export, and understand PATH.',
    difficulty: 'beginner',
    order: 5,
    trackCommand: 'export',
    challenge:
      'Create an environment variable named `BUILD_ENV` with the value `staging`, then print it back with `echo`. Do both in one line.',
    solution: 'export BUILD_ENV=staging && echo $BUILD_ENV',
    content: `# Environment Variables and PATH

Every running process, including your shell, keeps a table of **environment variables** - named strings like \`HOME\`, \`USER\`, or \`PATH\` that configure how programs behave.

## Reading a variable

Put a \`$\` in front of a variable's name and the shell substitutes its value before running the command:

\`\`\`bash
echo $HOME
echo "Logged in as $USER"
\`\`\`

Wrap the name in \`\${ }\` when you need to be explicit about where the name ends, which matters right before more text:

\`\`\`bash
echo "\${USER}_backup.tar"
\`\`\`

Variables only expand when **unquoted** or inside **double quotes**. Single quotes turn expansion off - \`echo '$HOME'\` prints the literal text \`$HOME\`, not its value.

## Setting a variable

\`\`\`bash
export STAGE=production   # define STAGE for this shell and any command it starts
echo $STAGE
env                        # list every variable currently exported
\`\`\`

Any process you start after \`export\` inherits a copy of these variables - that is what "environment" means: it travels with the process, not just the current line.

## PATH: how the shell finds commands

\`PATH\` is the most important environment variable of all. It is a colon-separated list of directories the shell searches, in order, whenever you type a bare command name like \`ls\` instead of a full path like \`/bin/ls\`. A typical value looks like:

\`\`\`
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
\`\`\`

If a command reports "not found" even though the file exists, it is almost always because the directory holding it is missing from \`PATH\`.

## Try it

\`\`\`bash
export BUILD_ENV=staging
echo $BUILD_ENV
export BUILD_ENV=production
echo "now building for $BUILD_ENV"
env
\`\`\`

## Further reading

- **"Learning the bash Shell"** by Cameron Newham (O'Reilly) - the definitive guide to shell variables, quoting rules, and the startup files (\`.bashrc\`, \`.bash_profile\`) that set them up for you automatically.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - the "Environment" chapter in Part II walks through exactly this material with more real-world examples.
`,
  },
  {
    id: 'users-and-permissions',
    slug: 'users-and-permissions',
    title: 'Users and Permissions',
    description: 'Understand users, groups, and the chmod / chown commands.',
    difficulty: 'intermediate',
    order: 6,
    trackCommand: 'chmod',
    challenge:
      'Make `script.sh` executable for the owner only (no permissions for group or others).',
    solution: 'chmod 700 script.sh',
    content: `# Users and Permissions

Linux is a **multi-user** system. Every file belongs to a user and a group, and has three permission sets: **owner**, **group**, and **everyone else**.

## Reading permissions

Run \`ls -l\` and you will see something like:

\`\`\`
-rwxr-x---  1  alice  devs  1024  Jun 28  script.sh
\`\`\`

Breakdown:

- \`-\` - regular file (\`d\` for directory)
- \`rwx\` - owner can read, write, execute
- \`r-x\` - group can read and execute
- \`---\` - others have no access

## Changing permissions

\`\`\`bash
chmod 755 script.sh      # owner: rwx, group+other: rx
chmod +x script.sh       # add execute for everyone
chmod 600 secret.txt     # owner only
\`\`\`

The numbers are octal:

| Digit | r | w | x |
| ----- | - | - | - |
| 7     | yes | yes | yes |
| 6     | yes | yes |     |
| 5     | yes |     | yes |
| 4     | yes |     |     |

## Changing ownership

Permissions are only half the story - each file also has an **owner** (a user) and a **group**. \`chown\` changes one or both:

\`\`\`bash
chown alice script.sh          # give ownership to alice
chown alice:devs script.sh     # set owner AND group in one go
chown :devs script.sh          # change only the group
\`\`\`

A common real pattern: put teammates in a shared group, then \`chown :teamgroup\` a project's files and \`chmod g+rwx\` the directory so everyone in that group can collaborate without being the file's owner.

## Why this matters

Servers get hacked because files are too permissive. When in doubt, *least privilege* - grant only what is needed.
`,
  },
  {
    id: 'text-processing',
    slug: 'text-processing',
    title: 'Text Processing with grep, sed, and awk',
    description: 'Search, transform, and extract fields from text on the command line.',
    difficulty: 'intermediate',
    order: 7,
    trackCommand: 'grep',
    challenge:
      'In `report.txt`, replace every occurrence of `TODO` with `DONE` and print the result. Do it in one command.',
    solution: "sed 's/TODO/DONE/g' report.txt",
    content: `# Text Processing with grep, sed, and awk

Three small tools handle almost every text-processing job you will run into on the command line: **grep** finds lines, **sed** transforms them, and **awk** extracts fields out of them. Learn these three and you can process logs, configs, and CSVs without ever opening an editor.

## grep: finding lines that match

\`\`\`bash
grep ERROR app.log          # lines containing "ERROR"
grep -i error app.log       # case-insensitive
grep -v INFO app.log        # invert: lines that do NOT match
grep -n ERROR app.log       # show line numbers
\`\`\`

grep reads from a file *or* from a pipe, which is how it is most often used in practice:

\`\`\`bash
ps aux | grep nginx
\`\`\`

## sed: transforming text

\`sed\` is a **stream editor** - it reads text, applies an edit, and prints the result. The classic edit is substitution, \`s/find/replace/\`:

\`\`\`bash
sed 's/TODO/DONE/' report.txt      # replaces the FIRST match on each line
sed 's/TODO/DONE/g' report.txt     # the g flag replaces EVERY match on each line
\`\`\`

By itself, \`sed\` only prints the changed text - it does not touch the file. To keep the result, pipe it into \`tee\` and write back to the same filename:

\`\`\`bash
sed 's/TODO/DONE/g' report.txt | tee report.txt
\`\`\`

## awk: extracting fields

Text is often organized into whitespace-separated fields - a process list, a log line, a CSV row. \`awk\` refers to them as \`$1\`, \`$2\`, and so on (\`$0\` is the whole line):

\`\`\`bash
echo "alice 27 engineer" | awk '{print $1}'   # -> alice
echo "alice 27 engineer" | awk '{print $2}'   # -> 27
\`\`\`

\`cut\` does a simpler version of the same job when your data has an explicit delimiter, like a colon or comma:

\`\`\`bash
echo "alice:27:engineer" | cut -d ":" -f 2    # -> 27
\`\`\`

## Try it

\`\`\`bash
echo "TODO fix the login bug" > report.txt
echo "TODO write the changelog" >> report.txt
cat report.txt
sed 's/TODO/DONE/g' report.txt
grep -c TODO report.txt
\`\`\`

## Further reading

- **"sed & awk"** by Dale Dougherty and Arnold Robbins (O'Reilly) - the definitive, classic reference for both tools, still relevant decades after publication.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - its text-processing chapters cover \`grep\`, \`sed\`, and \`awk\` together with plenty of realistic examples, plus an introduction to regular expressions.
`,
  },
  {
    id: 'finding-files',
    slug: 'finding-files',
    title: 'Finding Files with find and xargs',
    description: 'Locate files by name or pattern, then act on all of them at once.',
    difficulty: 'intermediate',
    order: 8,
    trackCommand: 'find',
    challenge:
      'Find every `.log` file under `/var` and delete them all in one command, using `find` piped into `xargs`.',
    solution: 'find /var -name "*.log" | xargs rm',
    content: `# Finding Files with find and xargs

\`ls\` only shows you what is in one directory. When you need to search an entire tree - "every \`.log\` file anywhere under \`/var\`" - that is a job for \`find\`.

## find: searching by name

\`\`\`bash
find /var -name "*.log"        # every .log file under /var, at any depth
find . -name "*.txt"           # every .txt file under the current directory
\`\`\`

\`find\` prints one path per line, which makes it perfect for feeding into another command.

## xargs: turning a list into a command

Piping a list of paths into a command like \`rm\` does not work directly, because \`rm\` expects paths as *arguments*, not as piped-in text. \`xargs\` bridges that gap: it reads whitespace-separated tokens from stdin and runs a command once for each one, appending the token as an argument.

\`\`\`bash
find /var -name "*.log" | xargs rm     # delete every match
find . -name "*.tmp" | xargs cat       # print the contents of every match
\`\`\`

This "find it, then xargs it" pattern is one of the most useful idioms in the entire command line - it turns a search into a bulk operation with almost no code.

## Try it

\`\`\`bash
mkdir -p /var/log/app
echo "boot ok" > /var/log/app/one.log
echo "boot ok" > /var/log/app/two.log
find /var -name "*.log"
find /var -name "*.log" | xargs rm
find /var -name "*.log"
\`\`\`

The list is empty on the last line - every match was deleted in one step.

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - its chapter on finding files walks through \`find\`'s many test expressions (by size, by age, by permissions) well beyond \`-name\`.
- **"UNIX and Linux System Administration Handbook"** by Nemeth, Snyder, Hein, Whaley, and Mackin (Pearson) - shows this exact \`find | xargs\` idiom used for real sysadmin cleanup and auditing tasks.
`,
  },
  {
    id: 'processes-and-system',
    slug: 'processes-and-system',
    title: 'Processes and the System',
    description: 'ps, top, kill, and how to find what is running.',
    difficulty: 'intermediate',
    order: 9,
    trackCommand: 'ps',
    challenge:
      'Show the top of the `ps aux` output filtered to lines containing the word `root`.',
    solution: 'ps aux | grep root',
    content: `# Processes and the System

A **process** is a running program. Linux gives every process a numeric ID called a **PID**.

## Inspecting processes

\`\`\`bash
ps aux                 # snapshot of all processes
top                    # live, updating view (q to quit)
pgrep -a node          # find processes by name
\`\`\`

## Killing processes

\`\`\`bash
kill 1234              # polite shutdown (SIGTERM)
kill -9 1234           # force kill (SIGKILL) - last resort
pkill -f "python app"  # kill by pattern
\`\`\`

## System info

\`\`\`bash
uname -a               # kernel info
uptime                 # how long the system has been up
free -h                # memory usage
df -h                  # disk space
\`\`\`

## Foreground vs background

- Run normally: \`python app.py\` (foreground)
- Run in background: \`python app.py &\`
- Bring back to foreground: \`fg\`

These tools are your first stop when something is wrong on a server.
`,
  },
  {
    id: 'archives-and-compression',
    slug: 'archives-and-compression',
    title: 'Archives and Compression',
    description: 'Bundle files with tar, and shrink them with gzip.',
    difficulty: 'intermediate',
    order: 10,
    trackCommand: 'tar',
    challenge: 'Bundle the `site` directory into a single archive called `site.tar` using tar.',
    solution: 'tar -cf site.tar site',
    content: `# Archives and Compression

Two separate ideas get bundled together so often that people mix them up: **archiving** (combining many files into one) and **compression** (shrinking the size of a file). \`tar\` does the first, \`gzip\` does the second, and together they produce the \`.tar.gz\` files you have almost certainly downloaded before.

## tar: packing many files into one

The name is short for "tape archive" - it dates back to literal magnetic tape backups, which is why the flags feel a bit old-fashioned. Three flags cover most of what you need:

\`\`\`bash
tar -cf site.tar site/        # create an archive from the site/ directory
tar -tf site.tar               # list what's inside, without extracting
tar -xf site.tar               # extract into the current directory
\`\`\`

Read the letters as: \`c\`reate, e\`x\`tract, \`t\`able-of-contents, and \`f\`ile (always followed by the archive's name).

## Adding compression

\`tar\` bundles files but does not shrink them by itself. Add \`-z\` to also gzip-compress the result, which is where the familiar \`.tar.gz\` (or \`.tgz\`) extension comes from:

\`\`\`bash
tar -czf site.tar.gz site/     # create AND compress in one step
tar -xzf site.tar.gz            # decompress AND extract in one step
\`\`\`

## gzip and gunzip on their own

You do not need \`tar\` to compress a single file:

\`\`\`bash
gzip access.log          # replaces access.log with access.log.gz
gunzip access.log.gz     # reverses it, restoring access.log
gzip -k access.log       # -k keeps the original instead of replacing it
\`\`\`

## Try it

\`\`\`bash
mkdir -p site/css
echo "<h1>hi</h1>" > site/index.html
echo "body { color: navy; }" > site/css/style.css
tar -czf site.tar.gz site
tar -tzf site.tar.gz
rm -r site
tar -xzf site.tar.gz
cat site/index.html
\`\`\`

Everything comes back exactly as it was, even though \`site/\` itself was deleted in between.

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - its chapter on archiving and backup covers \`tar\`, \`gzip\`, and their relatives (\`bzip2\`, \`xz\`, \`zip\`) side by side, including when to reach for each one.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains what compression is actually doing to the bytes, which demystifies why some file types (already-compressed video or images) barely shrink at all.
`,
  },
  {
    id: 'package-management',
    slug: 'package-management',
    title: 'Package Management',
    description: 'Install, remove, and search for software with apt.',
    difficulty: 'intermediate',
    order: 11,
    trackCommand: 'apt',
    challenge:
      'Install the `tree` package with apt, in a single command that also refreshes the package index first.',
    solution: 'apt update && apt install tree',
    content: `# Package Management

Every Linux distribution ships a **package manager**: a tool that installs software along with everything it depends on, tracks exactly which files belong to which program, and can cleanly remove it all again later. This is the single biggest reason Linux servers rarely end up with the tangled, half-installed software that plagues systems without one.

## apt: Debian and Ubuntu's package manager

\`apt\` is the tool you will meet on Debian, Ubuntu, and their many derivatives.

\`\`\`bash
apt update                # refresh the local index of what's available
apt install tree          # install a package (and its dependencies)
apt remove tree           # remove it again
apt search editor         # search the index for a term
apt list --installed      # show everything currently installed
\`\`\`

\`apt update\` does not install or upgrade anything by itself - it just refreshes apt's *knowledge* of what versions are available from your configured repositories. Get in the habit of running it before an \`install\`, so you are not installing a version that's already out of date.

## dpkg: what apt is built on

Underneath \`apt\` is \`dpkg\`, the lower-level tool that actually unpacks \`.deb\` files and records which files belong to which package (traditionally under \`/var/lib/dpkg\`). You will rarely need it directly, but it explains why apt can tell you precisely what is installed: it is reading that same bookkeeping.

## Other distributions, other tools

The concept is universal even though the command names differ:

| Distribution family      | Package manager        |
| ------------------------ | ----------------------- |
| Debian, Ubuntu, Mint      | \`apt\` (built on \`dpkg\`)   |
| Fedora, RHEL, CentOS      | \`dnf\` (formerly \`yum\`, built on \`rpm\`) |
| Arch Linux, Manjaro       | \`pacman\`                |

Once you understand one of them - update the index, install a name, remove a name, search a term - the others are just a different vocabulary for the same four ideas.

## Try it

\`\`\`bash
apt update
apt search git
apt install git
apt list --installed
apt remove git
\`\`\`

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - its package management chapter covers both the Debian (\`apt\`/\`dpkg\`) and Red Hat (\`dnf\`/\`rpm\`) families in detail.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains what a package actually contains and how dependency resolution works under the hood.
- **"UNIX and Linux System Administration Handbook"** by Nemeth, Snyder, Hein, Whaley, and Mackin (Pearson) - covers package management as part of real production server administration, including keeping systems patched and up to date.
`,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-gs-1',
    lessonId: 'getting-started',
    order: 0,
    prompt: 'Which command prints text to the screen?',
    answer: 'echo',
  },
  {
    id: 'q-gs-2',
    lessonId: 'getting-started',
    order: 1,
    prompt: 'What does `whoami` tell you?',
    answer: 'user',
  },
  {
    id: 'q-fs-1',
    lessonId: 'filesystem-navigation',
    order: 0,
    prompt: 'Which command prints the current working directory?',
    answer: 'pwd',
  },
  {
    id: 'q-fs-2',
    lessonId: 'filesystem-navigation',
    order: 1,
    prompt: 'Which symbol means "your home directory"?',
    answer: '~',
  },
  {
    id: 'q-fd-1',
    lessonId: 'files-and-dirs',
    order: 0,
    prompt: 'What flag on `mkdir` creates nested directories?',
    answer: '-p',
  },
  {
    id: 'q-fd-2',
    lessonId: 'files-and-dirs',
    order: 1,
    prompt: 'Which command deletes an empty file?',
    answer: 'rm',
  },
  {
    id: 'q-up-1',
    lessonId: 'users-and-permissions',
    order: 0,
    prompt: 'In `chmod 755`, what does the first digit control?',
    answer: 'owner',
  },
  {
    id: 'q-up-2',
    lessonId: 'users-and-permissions',
    order: 1,
    prompt:
      'True or false: `chmod +x` adds execute permission. (answer: true or false)',
    answer: 'true',
  },
  {
    id: 'q-up-3',
    lessonId: 'users-and-permissions',
    order: 2,
    prompt: 'Which command changes a file\'s owner and/or group?',
    answer: 'chown',
  },
  {
    id: 'q-ps-1',
    lessonId: 'processes-and-system',
    order: 0,
    prompt: 'Which command shows a live, updating process list?',
    answer: 'top',
  },
  {
    id: 'q-ps-2',
    lessonId: 'processes-and-system',
    order: 1,
    prompt: 'Which signal number forces a kill?',
    answer: '9',
  },
  {
    id: 'q-pr-1',
    lessonId: 'pipes-and-redirection',
    order: 0,
    prompt: 'Which operator appends output to a file instead of overwriting it?',
    answer: '>>',
  },
  {
    id: 'q-pr-2',
    lessonId: 'pipes-and-redirection',
    order: 1,
    prompt: "Which character connects one command's output to the next command's input?",
    answer: '|',
  },
  {
    id: 'q-ev-1',
    lessonId: 'environment-variables',
    order: 0,
    prompt: 'Which command prints every currently exported environment variable?',
    answer: 'env',
  },
  {
    id: 'q-ev-2',
    lessonId: 'environment-variables',
    order: 1,
    prompt: "Which character do you put before a variable's name to read its value?",
    answer: '$',
  },
  {
    id: 'q-tp-1',
    lessonId: 'text-processing',
    order: 0,
    prompt: "Which sed flag makes a substitution apply to every match on a line, not just the first?",
    answer: 'g',
  },
  {
    id: 'q-tp-2',
    lessonId: 'text-processing',
    order: 1,
    prompt: 'Which command prints one field of delimited text, such as a CSV column?',
    answer: 'cut',
  },
  {
    id: 'q-ff-1',
    lessonId: 'finding-files',
    order: 0,
    prompt: 'Which flag on `find` matches files by name pattern?',
    answer: '-name',
  },
  {
    id: 'q-ff-2',
    lessonId: 'finding-files',
    order: 1,
    prompt: 'Which command builds and runs a command line for each item read from stdin?',
    answer: 'xargs',
  },
  {
    id: 'q-ac-1',
    lessonId: 'archives-and-compression',
    order: 0,
    prompt: 'Which tar flag lists an archive\'s contents without extracting it?',
    answer: '-t',
  },
  {
    id: 'q-ac-2',
    lessonId: 'archives-and-compression',
    order: 1,
    prompt: 'Which command reverses gzip, restoring the original file?',
    answer: 'gunzip',
  },
  {
    id: 'q-pm-1',
    lessonId: 'package-management',
    order: 0,
    prompt: 'Which apt subcommand refreshes the local package index from the repositories?',
    answer: 'update',
  },
  {
    id: 'q-pm-2',
    lessonId: 'package-management',
    order: 1,
    prompt: 'On Debian/Ubuntu, which lower-level tool does apt use to actually unpack packages?',
    answer: 'dpkg',
  },
];

/** Lessons sorted by `order` — what every page renders. */
export function getAllLessons(): Lesson[] {
  return [...LESSONS].sort((a, b) => a.order - b.order);
}

/** Look up a lesson by slug. Returns `null` if it doesn't exist. */
export function getLessonBySlug(slug: string): Lesson | null {
  return LESSONS.find((l) => l.slug === slug) ?? null;
}

/** Quiz questions for a given lesson, ordered. */
export function getQuestionsForLesson(lessonId: string): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter((q) => q.lessonId === lessonId).sort(
    (a, b) => a.order - b.order,
  );
}
