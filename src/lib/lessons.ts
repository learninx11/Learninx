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
import { GCP_LESSONS, GCP_QUIZ_QUESTIONS } from './lessons-gcp';

const CORE_LESSONS: Lesson[] = [
  {
    id: 'getting-started',
    slug: 'getting-started',
    title: 'Getting Started with Linux',
    description: 'What Linux is, the shell, and your first commands.',
    difficulty: 'beginner',
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
    track: 'linux',
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
  {
    id: 'linux-history',
    slug: 'linux-history',
    title: 'The History of Linux',
    description: 'From Unix at Bell Labs to the kernel that runs the cloud, decade by decade.',
    difficulty: 'beginner',
    track: 'linux',
    order: 0,
    content: `# The History of Linux

Linux did not appear out of nowhere. It is the latest chapter in a story that starts decades before Linus Torvalds ever wrote a line of kernel code. Knowing that story makes the *why* behind Linux's design - "everything is a file," small tools piped together, free and open source - make a lot more sense.

## Before Linux: Unix (1969)

In 1969, **Ken Thompson** and **Dennis Ritchie** at Bell Labs (AT&T) started building a new operating system, later named **Unix**. A few years later they rewrote it in a new language Ritchie designed for the job: **C**. That decision is why Unix - and everything descended from it, including Linux - could run on wildly different hardware with only small changes: the OS was no longer tied to one machine's assembly language.

Unix introduced ideas that still define Linux today:

- **Everything is a file** - devices, pipes, and many kernel interfaces are accessed through the filesystem.
- **Small tools, composed together** - one program does one job well; pipes (\`|\`) chain them into pipelines.
- **A multi-user, multi-tasking system** from the start, with permissions built in.

## The Unix family splits (1970s-1980s)

AT&T licensed Unix to universities and companies. The University of California, Berkeley produced its own variant, **BSD** (Berkeley Software Distribution), adding features like the \`vi\` editor and TCP/IP networking. Commercial vendors then built their own Unix flavors on top of AT&T's code - Sun's SunOS/Solaris, HP-UX, IBM's AIX, SGI's IRIX - each proprietary, each incompatible in its own small ways. By the mid-1980s "Unix" had splintered into a family of similar but license-encumbered systems, none of them free to study, share, or modify.

## The GNU Project (1983)

In 1983, **Richard Stallman** announced the **GNU Project** ("GNU's Not Unix") with a specific goal: build a complete, Unix-compatible operating system that was **free software** - free to run, study, share, and modify. Over the next several years the project produced the essential tools: the \`gcc\` compiler, the \`bash\` shell, and the GNU coreutils (\`ls\`, \`cp\`, \`grep\`, and the rest of the commands you've already been using in this course).

GNU had almost everything a full operating system needs - except the **kernel**, the core piece that talks to hardware and manages processes and memory. That piece was still missing in 1991.

## The Linux kernel is born (1991)

On August 25, 1991, a 21-year-old Finnish student named **Linus Torvalds** posted to a Usenet newsgroup:

> "I'm doing a (free) operating system (just a hobby, won't be big and professional like gnu) for 386(486) AT clones."

That "hobby" was the **Linux kernel**. Torvalds released it under the **GNU General Public License (GPL)**, which meant it could legally be combined with the GNU tools that already existed. The result - the Linux kernel plus the GNU userland - formed a complete, free operating system, properly called **GNU/Linux**, though most people just say "Linux."

## Distributions emerge (1993-1996)

A bare kernel plus loose GNU tools isn't something most people can install. A **distribution** ("distro") packages the kernel, the GNU tools, an installer, and a package manager into one coherent system:

| Year | Distribution     | Notable for |
| ---- | ----------------- | ----------- |
| 1993 | Slackware         | Oldest surviving distro, minimal and manual |
| 1993 | Debian            | Community-governed; ancestor of Ubuntu and Mint |
| 1994 | Red Hat Linux     | Commercial support; ancestor of Fedora and RHEL |
| 1994 | Linux kernel 1.0  | First official "stable" kernel release |
| 1996 | SUSE Linux        | Popular in Europe; ancestor of openSUSE |

## Growth through the 2000s

Through the 2000s Linux moved from hobbyist curiosity to enterprise infrastructure. **IBM** invested a billion dollars in Linux development in 2000. **Red Hat** went public and built a business model around paid support for free software. In 2004, **Ubuntu** launched with a mission to make Linux approachable on the desktop, and quickly became the default recommendation for newcomers.

The single biggest growth moment of the decade had nothing to do with desktops or servers: in 2008, Google shipped **Android**, a mobile OS built on the Linux kernel. Within a few years, the Linux kernel became the most-deployed kernel on Earth by device count - not because of servers or desktops, but because of phones.

## systemd and the modern init system (2010s)

For decades, Linux distributions started services at boot using **SysV init**, a design inherited from Unix - plain shell scripts run in sequence. Starting around 2010, **systemd** offered a replacement: parallel service startup, dependency-based ordering, unified logging (\`journalctl\`), and one consistent \`systemctl\` command to manage everything. It was controversial - critics argued it strayed from the "small tools" Unix philosophy - but by the mid-2010s nearly every major distribution (Debian, Ubuntu, Fedora, RHEL, SUSE, Arch) had adopted it as the default. It remains the standard today; you'll use it yourself in the systemd lesson.

## The cloud and container era (2013-present)

Two Linux kernel features quietly enabled the next revolution: **namespaces** (isolating what a process can see) and **cgroups** (limiting what resources a process can use). In 2013, **Docker** packaged those primitives into an easy developer workflow: build an image, run a container. In 2014, Google open-sourced **Kubernetes** to orchestrate fleets of containers across many machines.

The result: virtually the entire cloud - AWS, Google Cloud, Azure, and every major hosting provider - runs on Linux. Every one of the world's 500 fastest supercomputers runs Linux. Most web servers on the internet run Linux. Counting servers, phones, and embedded devices together, it is by a wide margin the most-used operating system kernel in the world.

## Linux on new frontiers

- **Chrome OS** (2011) - a Linux-based OS built around the Chrome browser, common in schools.
- **Windows Subsystem for Linux / WSL** (2016) - Microsoft shipped a real Linux kernel inside Windows, letting Windows users run this exact command line without dual-booting.
- **Steam Deck / SteamOS** (2022) - a Linux distribution built for gaming, proof Linux gaming has gone mainstream.

## Linux today

Modern Linux keeps evolving: **immutable, image-based distributions** (Fedora Silverblue, openSUSE MicroOS) that update atomically and roll back safely; **Wayland** gradually replacing the decades-old X11 display server; and, in recent years, **Rust** code accepted directly into the kernel alongside its traditional C - the first new systems language let into Linux's core since C itself. Linus Torvalds still leads the kernel's development today, coordinating thousands of contributors from companies and individuals worldwide, on a predictable release every 9-10 weeks.

From a hobby project announced almost apologetically on Usenet in 1991, Linux has become the operating system underneath most of the internet, most of the world's phones, and most of the world's supercomputers - all while remaining free, open source software anyone can read, modify, and run.

## Further reading

- **"Just for Fun"** by Linus Torvalds and David Diamond - Torvalds' own account of building Linux and the culture that grew around it.
- **"The Cathedral and the Bazaar"** by Eric S. Raymond - the classic essay on why Linux's open, chaotic development model worked.
- **"Free as in Freedom"** by Sam Williams - a biography of Richard Stallman and the free software movement behind the GNU tools Linux depends on.
`,
  },
  {
    id: 'shell-scripting',
    slug: 'shell-scripting',
    title: 'Shell Scripting Basics',
    description: 'Turn a sequence of commands into a reusable script: variables, conditionals, loops, and functions.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 12,
    trackCommand: 'chmod',
    challenge:
      'Create a script file `greet.sh` whose first line is `#!/bin/bash` and whose second line is `echo "hello, world"` (one `echo` with `>`, one with `>>`), then make it executable. Do all three steps in one line joined with `&&`.',
    solution: `echo '#!/bin/bash' > greet.sh && echo 'echo "hello, world"' >> greet.sh && chmod +x greet.sh`,
    content: `# Shell Scripting Basics

Every command you've typed so far in this course, you typed by hand, one at a time. A **shell script** is just those same commands saved in a file so you - or a server, or a scheduled job - can run the whole sequence with one word. Scripting is what turns "things I can do" into "things that happen automatically."

## The shebang

The first line of a script tells the system which interpreter should run it. By convention it starts with \`#!\` (pronounced "shebang") followed by the interpreter's path:

\`\`\`bash
#!/bin/bash
echo "hello, world"
\`\`\`

Without a shebang, running the file falls back to whatever shell happens to be interpreting it, which isn't guaranteed to match what you wrote the script for. Always include one.

## Making a script runnable

A script needs **execute permission** before you can run it directly - you covered \`chmod\` in the permissions lesson:

\`\`\`bash
chmod +x greet.sh
./greet.sh          # the ./ means "run the file in THIS directory", not a PATH lookup
\`\`\`

Without execute permission (or the \`./\`), you can still run a script by naming the interpreter explicitly: \`bash greet.sh\`.

## Variables

Scripts use the same \`NAME=value\` syntax you already know from \`export\`, usually without \`export\` unless the variable needs to be visible to programs the script *calls*:

\`\`\`bash
name="learner"
echo "hello, $name"
\`\`\`

No spaces around \`=\` - \`name = "learner"\` is a syntax error, not an assignment.

## Arguments and special variables

When a script runs, the shell hands it a set of built-in variables:

| Variable | Meaning |
| -------- | ------- |
| \`$1\`, \`$2\`, ... | The first, second, ... argument passed to the script |
| \`$@\` | All arguments, as separate words |
| \`$#\` | The number of arguments |
| \`$0\` | The script's own name |
| \`$?\` | The exit status of the last command (\`0\` means success) |

\`\`\`bash
#!/bin/bash
echo "script name: $0"
echo "first arg: $1"
echo "arg count: $#"
\`\`\`

## Conditionals

\`\`\`bash
if [ "$1" = "prod" ]; then
  echo "deploying to production"
elif [ "$1" = "staging" ]; then
  echo "deploying to staging"
else
  echo "usage: $0 <prod|staging>"
fi
\`\`\`

\`[ ... ]\` is itself a command (a synonym for \`test\`) - that's why the spaces around the brackets matter. Modern bash also supports \`[[ ... ]]\`, which is more forgiving and adds pattern matching.

## Loops

\`\`\`bash
for f in *.log; do
  echo "found: $f"
done

count=0
while [ $count -lt 3 ]; do
  echo "count is $count"
  count=$((count + 1))
done
\`\`\`

## Functions

\`\`\`bash
greet() {
  echo "hello, $1"
}

greet "world"
\`\`\`

## Comments and exit codes

Lines starting with \`#\` are comments, except the very first \`#!\` line, which is special. A script's own exit code - what \`$?\` will hold for whoever calls it - is set with \`exit\`:

\`\`\`bash
if [ ! -f "config.yml" ]; then
  echo "missing config.yml"
  exit 1
fi
exit 0
\`\`\`

By convention, \`0\` means success and any non-zero number means failure. This is exactly how the \`&&\` and \`||\` chains you learned earlier, and every CI pipeline, decide whether a step "worked."

> This browser sandbox is a small teaching REPL, not a full shell interpreter - it does not execute \`if\`, \`for\`, \`while\`, or \`./script.sh\`. Use it to build and inspect script *files*; run them for real in an actual Linux terminal or WSL to see the control flow in action.

## Try it

\`\`\`bash
echo '#!/bin/bash' > greet.sh
echo 'echo "hello, world"' >> greet.sh
cat greet.sh
chmod +x greet.sh
\`\`\`

\`cat\` shows you exactly what you wrote: a shebang line and an \`echo\`. On a real system, \`./greet.sh\` would now print the greeting.

## Further reading

- **"Learning the bash Shell"** by Cameron Newham (O'Reilly) - a complete, approachable guide to scripting in bash, from variables through functions.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - Part III is entirely dedicated to writing shell scripts, building up from this exact material to a full program.
`,
  },
  {
    id: 'networking-basics',
    slug: 'networking-basics',
    title: 'Networking Basics',
    description: 'How Linux machines talk to each other: ping, curl, wget, ssh, and interfaces.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 13,
    trackCommand: 'ping',
    challenge:
      'Check whether `example.com` is reachable with ping, then fetch only its HTTP response headers with curl. Do both in one line joined with `&&`.',
    solution: 'ping example.com && curl -I example.com',
    content: `# Networking Basics

Almost nothing on a modern Linux box runs in isolation - servers talk to databases, containers talk to each other, and your laptop talks to the internet. This lesson covers the handful of commands you'll reach for constantly to test and inspect those connections.

## Addresses and ports

Every machine on a network has an **IP address** (like \`192.168.1.42\`), and every network service on that machine listens on a numbered **port**. A connection is really identified by the pair: address *and* port.

| Port | Service |
| ---- | ------- |
| 22   | SSH (remote shell) |
| 53   | DNS (domain name lookups) |
| 80   | HTTP |
| 443  | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |

**DNS** is the system that turns a name like \`example.com\` into an IP address, so you rarely have to type addresses by hand.

## ping: is anyone there?

\`ping\` sends small ICMP "echo request" packets to a host and reports whether - and how quickly - it answers back. It's the first thing to try when something "isn't working":

\`\`\`bash
ping example.com
\`\`\`

No reply usually means either the host is down, or a firewall is silently dropping ICMP traffic (many servers do this on purpose - ping failing doesn't always mean the service itself is down).

## curl and wget: talking HTTP

\`curl\` fetches a URL and prints the response - the same request your browser makes, minus the rendering:

\`\`\`bash
curl https://example.com          # print the response body
curl -I https://example.com       # -I: headers only, no body
\`\`\`

\`wget\` does a similar job but is built around **saving** what it downloads to disk rather than printing it:

\`\`\`bash
wget https://example.com/file.tar.gz
\`\`\`

A useful rule of thumb: reach for \`curl\` when you're inspecting or scripting against an API, and \`wget\` when you're downloading a file.

## Interfaces: ifconfig and ip

Every network connection - your Ethernet port, your Wi-Fi card, the loopback interface used for talking to yourself - shows up as a named interface:

\`\`\`bash
ifconfig            # classic, older tool
ip addr             # modern replacement, "ip a" for short
\`\`\`

You'll typically see \`lo\` (loopback, always \`127.0.0.1\`) alongside a real interface like \`eth0\`, each with its own IP address.

## ssh: a remote shell

\`ssh\` opens an interactive shell on another machine over an encrypted connection - it's how almost every remote Linux server is administered:

\`\`\`bash
ssh alice@203.0.113.10
\`\`\`

The username comes before the \`@\`, the host after it. Production servers are almost always configured to accept **key-based authentication** instead of passwords - you'll cover exactly why, and how, in the security lesson.

## Try it

\`\`\`bash
ping example.com
curl example.com
curl -I example.com
ifconfig
ip addr
ssh learner@example.com
\`\`\`

## Further reading

- **"TCP/IP Illustrated, Volume 1"** by W. Richard Stevens (Addison-Wesley) - the definitive, detailed explanation of what actually happens on the wire.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - its networking chapter covers these exact tools with more real-world troubleshooting examples.
`,
  },
  {
    id: 'systemd-and-services',
    slug: 'systemd-and-services',
    title: 'systemd and Services',
    description: 'How modern Linux starts, supervises, and logs background services with systemctl.',
    difficulty: 'advanced',
    track: 'linux',
    order: 14,
    trackCommand: 'systemctl',
    challenge:
      'Enable the `nginx` service so it starts automatically on boot, then start it immediately. Do both in one line joined with `&&`.',
    solution: 'systemctl enable nginx && systemctl start nginx',
    content: `# systemd and Services

Every long-running program on a Linux server - a web server, a database, a queue worker - needs something to start it at boot, restart it if it crashes, and collect its logs. That something is **systemd**, the init system used by nearly every major Linux distribution today (you saw why it won out over the older SysV init in the history lesson).

## systemd is PID 1

When the kernel finishes booting, it starts exactly one process by hand: \`systemd\`, which always gets **process ID 1**. Every other process on the system is, directly or indirectly, a child of PID 1. systemd's job is to bring the rest of the system up in the right order and keep it running.

## Units and services

systemd manages **units** - services, mount points, timers, sockets, and more - each described by a small configuration file. A service unit looks roughly like this:

\`\`\`ini
[Unit]
Description=My web application

[Service]
ExecStart=/usr/bin/node /srv/app/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
\`\`\`

- \`[Unit]\` - metadata and dependencies (what must start before this).
- \`[Service]\` - how to start it, and what to do if it dies.
- \`[Install]\` - which boot target should pull this service in when it's enabled.

You won't need to write one of these files in this course, but recognizing the shape of a unit file will help the moment you open one on a real server.

## systemctl: the one command that controls it all

\`\`\`bash
systemctl start nginx        # start it right now
systemctl stop nginx         # stop it right now
systemctl restart nginx      # stop, then start
systemctl status nginx       # is it running? recent log lines?
systemctl enable nginx       # start it automatically on every future boot
systemctl disable nginx      # stop starting it automatically on boot
systemctl daemon-reload      # re-read unit files after editing one
\`\`\`

## start vs. enable - the distinction that trips everyone up

- \`start\` affects **right now**, this boot only.
- \`enable\` affects **every future boot**, by creating a symlink into a target like \`multi-user.target.wants/\` - it does *not* start the service immediately.

That's why deploying a new service almost always means running both: \`systemctl enable myapp && systemctl start myapp\`.

## Reading the logs: journalctl

systemd also owns centralized logging through \`journalctl\`, which replaces hunting through scattered files under \`/var/log\`:

\`\`\`bash
journalctl -u nginx          # every log line from the nginx unit
journalctl -u nginx -f       # follow new lines live, like tail -f
journalctl -b                # everything logged since the last boot
\`\`\`

> This sandbox simulates both \`systemctl\` and \`journalctl\` so you can practice the full workflow below - just keep in mind \`journalctl\`'s log lines are generated on the spot rather than reflecting anything \`systemctl\` actually did, and \`-f\` can't truly stream new lines the way it does on a real system.

## Try it

\`\`\`bash
systemctl status nginx
systemctl enable nginx
systemctl start nginx
systemctl restart nginx
journalctl -u nginx
systemctl stop nginx
systemctl disable nginx
\`\`\`

## Further reading

- **"How Linux Works"** by Brian Ward (No Starch Press) - its systemd chapter explains unit files, targets, and dependency ordering from first principles.
- \`man systemd\` and \`man systemctl\` on any real Linux box - systemd ships extensive, accurate manual pages.
`,
  },
  {
    id: 'linux-security-basics',
    slug: 'linux-security-basics',
    title: 'Linux Security Basics',
    description: 'sudo, least privilege, SSH keys, and the habits that keep a server from getting hacked.',
    difficulty: 'advanced',
    track: 'linux',
    order: 15,
    trackCommand: 'sudo',
    challenge: 'Use sudo to refresh the package index with a single elevated command.',
    solution: 'sudo apt update',
    content: `# Linux Security Basics

Most Linux servers don't get hacked through some exotic exploit - they get hacked because a password was reused, a file was too permissive, or a system went unpatched for a year. This lesson covers the everyday habits that prevent almost all of that.

## sudo: elevate one command, not your whole session

Logging in directly as \`root\` (the all-powerful administrator account) is dangerous - one typo in a root shell can wipe a system. \`sudo\` is the alternative: it runs a **single command** with elevated privileges, then hands control straight back to your normal, limited account.

\`\`\`bash
sudo apt update            # run just this one command as root
sudo whoami                # -> root, but only for this command
\`\`\`

Which users are allowed to \`sudo\`, and what they're allowed to run, is controlled by \`/etc/sudoers\` (edited safely with \`visudo\`, which validates the syntax before saving). On most desktop distributions, being in the \`sudo\` (or \`wheel\`) group is what grants this access.

## Least privilege, revisited

You met this idea in the permissions lesson: grant only the access a task actually needs, nothing more. In practice that means:

- Application processes run as a dedicated, unprivileged user - never as \`root\`.
- Config files with secrets in them get \`chmod 600\` (owner-only), not \`644\`.
- A user or service account that only needs to read something is never given write access "just in case."

## SSH keys instead of passwords

Passwords can be guessed, phished, or brute-forced. **SSH key pairs** are the standard alternative for logging into a remote Linux server:

- A **private key** stays on your laptop, ideally itself protected by a passphrase, and is never shared.
- A **public key** is copied onto the server, into \`~/.ssh/authorized_keys\`.
- Logging in proves you hold the private key mathematically, without ever sending a secret over the network.

The private key file itself needs tight permissions - SSH will actually refuse to use it otherwise:

\`\`\`bash
chmod 600 ~/.ssh/id_ed25519       # private key: owner read/write only
chmod 644 ~/.ssh/id_ed25519.pub   # public key: fine for anyone to read
\`\`\`

Well-run servers go a step further and disable password login entirely, accepting only key-based authentication.

## Firewalls: default deny

A firewall decides which network traffic is allowed to reach your machine at all. The safest default posture is **deny everything, then open exactly what's needed** - for a typical web server, that usually means allowing only SSH (22), HTTP (80), and HTTPS (443), and nothing else. On Ubuntu-family systems this is commonly managed with \`ufw\` (a friendly wrapper); everywhere else it's usually \`iptables\` or \`nftables\` directly.

## Keep the system patched

Most real-world break-ins exploit a **known, already-patched** vulnerability on a system nobody got around to updating. You already know the commands from the package management lesson - the security habit is simply running them regularly:

\`\`\`bash
sudo apt update && sudo apt upgrade
\`\`\`

## Try it

\`\`\`bash
sudo apt update
sudo whoami
mkdir -p ~/.ssh
touch ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519
ls -la ~/.ssh
\`\`\`

Notice the \`-rw-------\` on the key file in the listing - owner read/write, nothing for anyone else. That's exactly what a real SSH client expects before it will trust the key.

## Further reading

- **"UNIX and Linux System Administration Handbook"** by Nemeth, Snyder, Hein, Whaley, and Mackin (Pearson) - its security chapters cover \`sudo\` policy, SSH hardening, and firewalls in real production detail.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains the permission and privilege model this lesson builds on, from the kernel's point of view.
`,
  },
  {
    id: 'job-scheduling',
    slug: 'job-scheduling',
    title: 'Job Scheduling',
    description: 'Run commands automatically with cron, at, and their modern systemd-timer replacement.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 16,
    trackCommand: 'echo',
    challenge:
      'Write a crontab line into a file called `mycron` that runs `/usr/local/bin/backup.sh` every day at 2:30 AM, using a single redirected `echo`.',
    solution: "echo '30 2 * * * /usr/local/bin/backup.sh' > mycron",
    content: `# Job Scheduling

So far, every command you've run happened because you typed it. Production systems also need work that happens **without anyone typing anything** - a nightly backup, an hourly cleanup, a report generated every Monday morning. Linux has had a tool for exactly that since the 1970s: **cron**.

## crontab: the classic scheduler

Every user can have their own **crontab** (cron table) - a small file of scheduled jobs, managed with the \`crontab\` command:

\`\`\`bash
crontab -e     # edit your crontab in your default editor
crontab -l     # list your current scheduled jobs
crontab -r     # remove your entire crontab
\`\`\`

Each line in a crontab has six fields: five that describe **when**, and one that says **what**:

\`\`\`
minute hour day-of-month month day-of-week   command
30     2    *             *     *             /usr/local/bin/backup.sh
\`\`\`

A \`*\` means "every value" for that field. The line above reads: run \`backup.sh\` at **02:30**, every day of the month, every month, every day of the week - in other words, every night at 2:30 AM.

## Reading cron syntax

| Field | Allowed values | Example |
| ----- | --------------- | ------- |
| minute | 0-59 | \`0\` = on the hour |
| hour | 0-23 | \`2\` = 2 AM |
| day of month | 1-31 | \`1\` = the 1st |
| month | 1-12 | \`6\` = June |
| day of week | 0-6 (0 = Sunday) | \`1\` = Monday |

A few more real examples:

\`\`\`
0 * * * *      /usr/local/bin/hourly-check.sh     # every hour, on the hour
0 9 * * 1      /usr/local/bin/monday-report.sh    # 9 AM every Monday
*/15 * * * *   /usr/local/bin/poll.sh             # every 15 minutes
0 0 1 * *      /usr/local/bin/monthly-invoice.sh  # midnight on the 1st of every month
\`\`\`

\`*/15\` means "every 15 units," a shorthand you'll see constantly in real crontabs.

## Shortcuts

Most cron implementations also accept these special strings in place of the five fields:

\`\`\`
@reboot    run once, when the system boots
@daily     same as 0 0 * * *
@hourly    same as 0 * * * *
@weekly    same as 0 0 * * 0
\`\`\`

## at: run something once

When you need a job to run **one time**, not on a recurring schedule, \`at\` is the simpler tool:

\`\`\`bash
echo "/usr/local/bin/deploy.sh" | at 23:00     # run once, tonight at 11 PM
atq                                             # list pending at jobs
\`\`\`

## The modern alternative: systemd timers

On systems that already use systemd (which you met in the previous lesson), a **systemd timer** unit can do everything cron does, with two real advantages: it logs to \`journalctl\` like every other service, and it can easily "catch up" a missed run after the machine was off (\`Persistent=true\`). A timer unit pairs with a matching \`.service\` unit:

\`\`\`ini
# backup.timer
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

Which one you reach for is mostly a matter of what the system already uses: cron is simpler and universal across every Unix-like system; systemd timers integrate better if everything else on the box is already a systemd service.

> This sandbox simulates \`crontab\` and \`at\` well enough to practice the real commands below - just keep in mind nothing is actually scheduled in the background afterward, since a browser tab has no daemon sitting behind it the way a real system does.

## Try it

\`\`\`bash
echo '30 2 * * * /usr/local/bin/backup.sh' > mycron
crontab mycron
crontab -l
echo "/usr/local/bin/deploy.sh" | at 23:00
atq
\`\`\`

\`crontab mycron\` installs that file as your schedule, and \`crontab -l\` reads it straight back - the same round trip you'd do on a real system.

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - covers \`cron\`, \`at\`, and \`anacron\` (cron's laptop-friendly cousin) together.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains systemd timers as a direct comparison to cron, including the \`Persistent=\` behavior above.
`,
  },
  {
    id: 'disks-and-filesystems',
    slug: 'disks-and-filesystems',
    title: 'Disks and Filesystems',
    description: 'Block devices, partitions, mount points, df vs du, inodes, and hard vs symbolic links.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 17,
    trackCommand: 'lsblk',
    challenge:
      'Show human-readable free space for every mounted filesystem, then show a human-readable, summarized size of the `/var` directory. Do both in one line joined with `&&`.',
    solution: 'df -h && du -sh /var',
    content: `# Disks and Filesystems

Every byte you've written in this course - every file you \`touch\`ed, every directory you \`mkdir\`'d - lives on a **block device**, formatted with a **filesystem** that knows how to organize bytes into files and directories. This lesson is about seeing that structure instead of taking it for granted.

## Block devices and partitions

\`lsblk\` ("list block devices") shows the physical (or virtual) disks attached to a machine, and how each one is sliced into **partitions**:

\`\`\`bash
lsblk
\`\`\`

\`\`\`
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda           8:0    0    50G  0 disk
├─sda1        8:1    0    50G  0 part  /
└─sda2        8:2    0   512M  0 part  [SWAP]
\`\`\`

\`sda\` is the whole disk; \`sda1\` and \`sda2\` are partitions carved out of it. One partition holds the root filesystem (\`/\`); another is **swap** - disk space the kernel uses as overflow memory when RAM runs low.

## Mounting: attaching a filesystem to a path

A partition on its own isn't usable - it has to be **mounted**: attached to a directory (a "mount point") so its files appear as part of the single filesystem tree everything in Linux lives under. The kernel remembers these attachments in \`/etc/fstab\` so they're restored automatically at every boot:

\`\`\`bash
mount /dev/sdb1 /mnt/data      # attach sdb1's filesystem at /mnt/data
umount /mnt/data               # detach it again
\`\`\`

This is exactly why Linux has no drive letters like \`C:\` or \`D:\` - a second disk doesn't get its own root, it gets grafted into the existing tree at whatever path you choose.

## Filesystem types

The partition also has a **filesystem format** - the on-disk data structure that actually tracks which blocks belong to which file:

| Filesystem | Common on |
| ---------- | --------- |
| ext4 | The default on most Linux distributions; mature and reliable |
| xfs | High-performance, common on RHEL/CentOS and large storage servers |
| btrfs | Snapshots and built-in RAID-like features; default on some SUSE and Fedora installs |
| vfat / exFAT | USB drives and interoperability with Windows |
| ntfs | Windows' native filesystem, readable (and writable) from Linux |

## df vs. du: the question everyone confuses

Both report disk usage, but at different levels:

\`\`\`bash
df -h          # how full is each MOUNTED FILESYSTEM?
du -sh /var    # how much space does this one DIRECTORY use?
\`\`\`

\`df\` answers "is this disk about to fill up?" \`du\` answers "which directory is the one filling it?" A classic troubleshooting sequence runs both back to back: \`df -h\` to spot a filesystem that's nearly full, then \`du -sh /*\` on it to find the directory responsible.

## Inodes: the other thing that can run out

Every file has metadata - owner, permissions, timestamps, and where its data blocks live - stored in a structure called an **inode**. \`stat\` shows you a file's inode number directly:

\`\`\`bash
stat notes.txt
\`\`\`

A filesystem has a *fixed number* of inodes set aside when it's formatted. It's entirely possible to have free disk space (per \`df -h\`) but zero free inodes - usually caused by millions of tiny files - and get "No space left on device" anyway. \`df -i\` reports inode usage instead of byte usage on a real system.

## Hard links vs. symbolic links

\`ln\` creates a link, but there are two different kinds:

\`\`\`bash
ln source.txt hardlink.txt        # hard link: another name for the SAME inode
ln -s source.txt symlink.txt      # symbolic link: a small file that just points at a path
\`\`\`

A **hard link** is indistinguishable from the original - both names point at the same data, and deleting either one leaves the file intact under its other name. A **symbolic link** ("symlink") is its own tiny file containing a path; delete the original and the symlink is left pointing at nothing (a "broken link").

## Try it

\`\`\`bash
lsblk
df -h
du -sh /var
stat welcome.txt
mount /dev/sdb1 /mnt/data
mount
umount /mnt/data
\`\`\`

## Further reading

- **"How Linux Works"** by Brian Ward (No Starch Press) - its filesystem chapter explains inodes, mounting, and how ext4 actually lays out data on disk.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - practical coverage of \`df\`, \`du\`, \`mount\`, and \`/etc/fstab\`.
`,
  },
  {
    id: 'vim-editor',
    slug: 'vim-editor',
    title: 'Vim Editor Mastery',
    description: 'Modes, motions, and the editing workflow behind the editor on almost every Linux box.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 18,
    trackCommand: 'vim',
    challenge:
      'Create `notes.txt` containing the line `first draft`, open it in vim to see the sandbox preview, then append the line `reviewed` to it - all using commands this sandbox actually runs.',
    solution: 'echo "first draft" > notes.txt && echo "reviewed" >> notes.txt',
    content: `# Vim Editor Mastery

You've already met \`nano\` for quick edits. \`vim\` (and its ancestor \`vi\`) is the editor you'll find **preinstalled on almost every Linux system on Earth** - minimal containers, embedded devices, and freshly provisioned servers all ship it, often without \`nano\`. Learning enough vim to comfortably edit a config file over SSH is one of the highest-leverage skills in this entire course.

## Why vim feels strange at first

Vim is a **modal** editor: the same keys do different things depending on which **mode** you're in. That's the whole design - once memorized, editing becomes a sequence of small, composable commands instead of constant mouse-and-arrow-key movement.

| Mode | Purpose | How you get there |
| ---- | ------- | ------------------ |
| Normal | Navigation and commands (the default mode) | \`Esc\` from any other mode |
| Insert | Typing text, like a normal editor | \`i\`, \`a\`, or \`o\` from Normal mode |
| Visual | Selecting text to act on | \`v\` (character), \`V\` (line), \`Ctrl-v\` (block) |
| Command-line | Saving, quitting, search-and-replace | \`:\` from Normal mode |

The single most common beginner mistake is typing text while still in Normal mode - it looks like nothing is happening (or worse, like random commands are firing) because every letter is being read as a command, not as text.

## Moving around (Normal mode)

| Keys | Moves to |
| ---- | -------- |
| \`h\` \`j\` \`k\` \`l\` | left / down / up / right (the original arrow keys, still muscle memory for many admins) |
| \`w\` / \`b\` | next word / previous word |
| \`0\` / \`$\` | start / end of the current line |
| \`gg\` / \`G\` | start / end of the whole file |
| \`Ctrl-f\` / \`Ctrl-b\` | page down / page up |

## Editing (Normal mode)

| Keys | Does |
| ---- | ---- |
| \`i\` | enter Insert mode before the cursor |
| \`a\` | enter Insert mode after the cursor |
| \`o\` | open a new line below and enter Insert mode |
| \`x\` | delete the character under the cursor |
| \`dd\` | delete (cut) the current line |
| \`yy\` | yank (copy) the current line |
| \`p\` | paste after the cursor / current line |
| \`u\` | undo |
| \`Ctrl-r\` | redo |
| \`.\` | repeat the last change |

Most of vim's power comes from combining a count, an operator, and a motion: \`3dd\` deletes three lines, \`d$\` deletes to the end of the line, \`dw\` deletes to the start of the next word.

## Search and replace

\`\`\`
/pattern          search forward for "pattern"
n                  jump to the next match
N                  jump to the previous match
:%s/old/new/g      replace every "old" with "new", in the whole file
\`\`\`

That last one is the command you'll type most often once you're comfortable - it's the same substitution idea as \`sed\`'s \`s/find/replace/g\`, because vim and \`sed\` share the same lineage.

## Saving and quitting (Command-line mode)

| Command | Does |
| ------- | ---- |
| \`:w\` | write (save) the file |
| \`:q\` | quit (fails if there are unsaved changes) |
| \`:wq\` or \`ZZ\` | save and quit |
| \`:q!\` | quit and discard changes |

> Typing \`vim <file>\` (or \`vi <file>\`) on its own line in this sandbox opens a **real, interactive vim session** - the modes and motions above all work for real. Two simplifications versus real vim: Visual mode (\`v\`/\`V\`/\`Ctrl-v\`) always selects whole lines here, like real vim's Visual *Line* mode specifically, and \`.\` (repeat last change) isn't implemented. Piping or chaining \`vim\` with another command falls back to a read-only preview instead, since a full-screen app doesn't compose with pipes in a way that means anything.

## Try it

\`\`\`bash
echo "first draft" > notes.txt
vim notes.txt
\`\`\`

That opens the real editor. From there: press \`i\`, type a sentence, \`Esc\`, then \`:wq\` to save and quit - or work through the motions and editing commands from this lesson directly. Every Linux system also ships a free, interactive, 30-minute tutorial for the real thing: run \`vimtutor\`.

## Further reading

- **"Practical Vim"** by Drew Neil (Pragmatic Bookshelf) - the best modern book on thinking in vim's language of operators and motions.
- Run \`vimtutor\` on any real Linux machine - a free, interactive, 30-minute tutorial that ships with vim itself.
`,
  },
  {
    id: 'getting-help',
    slug: 'getting-help',
    title: 'Getting Help: man, help, and Reading Docs',
    description: 'man pages, --help, apropos, and the habit of looking things up instead of memorizing them.',
    difficulty: 'beginner',
    track: 'linux',
    order: 19,
    trackCommand: 'man',
    challenge:
      'Look up the manual entry for `ls`, then confirm where `grep` would run from - both in one line joined with `&&`.',
    solution: 'man ls && which grep',
    content: `# Getting Help: man, help, and Reading Docs

No one memorizes every flag of every command - not even people who have used Linux for twenty years. The actual skill is knowing *where to look*, fast, without leaving the terminal. This lesson is short on purpose: it's a habit, not a topic.

## man: the manual, built in

Nearly every command on a real Linux system ships a **manual page** installed right alongside it:

\`\`\`bash
man ls
man grep
man 5 passwd
\`\`\`

That \`5\` in the last example is a **section number** - man pages are organized into numbered sections so the same word can mean different things:

| Section | Contents |
| ------- | -------- |
| 1 | User commands (\`ls\`, \`grep\`, ...) |
| 5 | File formats (\`/etc/passwd\`'s layout, \`crontab\`'s syntax) |
| 8 | System administration commands (\`useradd\`, \`mount\`) |

\`man passwd\` alone opens section 1 (the *command* that changes a password); \`man 5 passwd\` opens section 5 (the *file format* of \`/etc/passwd\` itself) - same word, different manual.

On a real terminal, \`man\` opens in a pager: **space** or **f** for the next page, **b** for the previous page, **/word** to search, **n** for the next match, and **q** to quit.

## --help: the quick version

Most commands also understand a \`--help\` flag that prints a short usage summary straight to the terminal, without opening a pager - useful when you just need a flag's name, not the full manual:

\`\`\`bash
grep --help
tar --help
\`\`\`

## Finding the *right* command

- \`apropos <word>\` searches every man page's short description for a keyword - use it when you know what you want to do but not the command's name.
- \`whatis <command>\` prints just a command's one-line summary.
- \`which <command>\` prints the full path of the program that would actually run.
- \`type <command>\` reports whether a name is a shell builtin, an alias, or a program on disk - useful when a command doesn't behave the way its man page says it should.

\`\`\`bash
apropos copy
whatis cp
which python3
\`\`\`

## info: the deeper alternative

A handful of GNU tools (notably \`bash\` itself, and \`coreutils\`) ship even more detailed **info** pages, browsable as a hyperlinked document with \`info <command>\`. You'll meet it far less often than \`man\`, but it's worth knowing it exists when a man page feels incomplete.

## Try it

\`\`\`bash
man grep
man nosuchcommand
which python3
which totallymadeupcmd
apropos copy
\`\`\`

Notice \`man nosuchcommand\` fails cleanly with "No manual entry" - that's the correct, expected response for a command that was never installed, exactly like a real system.

## Further reading

- **"The Linux Command Line"** by William Shotts (No Starch Press) - opens with a chapter on exactly this: how to explore and learn commands you don't already know, using the system's own documentation.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains how man pages are packaged and installed, which demystifies why some minimal systems are missing them entirely.
`,
  },
  {
    id: 'regular-expressions',
    slug: 'regular-expressions',
    title: 'Regular Expressions',
    description: 'Anchors, character classes, quantifiers, and alternation - pattern matching with grep and sed.',
    difficulty: 'intermediate',
    track: 'linux',
    order: 20,
    trackCommand: 'grep',
    challenge:
      'In `log.txt`, print every line that starts with either `ERROR` or `WARN`, using a single grep command with `-E`.',
    solution: "grep -E '^(ERROR|WARN)' log.txt",
    content: `# Regular Expressions

\`grep\`'s \`-i\`/\`-v\`/\`-n\` flags and \`sed\`'s \`s/find/replace/\` only get you so far when "find" needs to mean "any of these shapes" instead of one exact string. A **regular expression** (regex) is a tiny pattern language for describing shapes of text - and it's the single most useful skill layered on top of everything you've learned about \`grep\` and \`sed\` so far.

> This sandbox's \`grep\` and \`sed\` use real, JavaScript-flavored regex syntax (the same family as \`grep -E\`, Python, and Perl) - bare parentheses for grouping, no backslash needed before \`+\`, \`?\`, or \`|\`. That is the modern, most-transferable dialect, so every pattern in this lesson runs here exactly as written.

## Anchors: where in the line

\`\`\`bash
grep '^ERROR' log.txt      # lines that START WITH "ERROR"
grep 'timeout$' log.txt    # lines that END WITH "timeout"
grep '^$' log.txt          # completely empty lines
\`\`\`

\`^\` anchors to the start of the line, \`$\` anchors to the end. Without an anchor, a pattern matches *anywhere* in the line.

## Character classes: one of a set

\`\`\`bash
grep '[0-9]' log.txt       # any line containing at least one digit
grep '[A-Z]' log.txt       # any line containing an uppercase letter
grep '[^0-9]' log.txt      # lines containing a NON-digit character
\`\`\`

\`[...]\` matches exactly one character from the set inside the brackets. A leading \`^\` inside the brackets *inverts* the set - \`[^0-9]\` means "any character that isn't a digit."

## The dot: any character

\`\`\`bash
grep 'l.ne' log.txt        # matches "line", "lane", "l3ne" - any single character in that spot
\`\`\`

\`.\` matches literally any one character. If you actually want to match a literal period, escape it: \`\\.\`.

## Quantifiers: how many

| Symbol | Means |
| ------ | ----- |
| \`*\` | zero or more of the previous thing |
| \`+\` | one or more |
| \`?\` | zero or one (optional) |
| \`{2,4}\` | between 2 and 4, inclusive |

\`\`\`bash
grep 'ERRO*R' log.txt      # "ERR", "ERROR", "ERROOOR" - zero or more O's
grep '[0-9]+' log.txt      # one or more digits in a row
grep 'colou?r' log.txt     # matches BOTH "color" and "colour"
\`\`\`

## Alternation: this OR that

\`\`\`bash
grep -E '^(ERROR|WARN)' log.txt   # lines starting with either word
\`\`\`

\`|\` means "or," and parentheses group the alternatives so \`^\` applies to the whole \`(ERROR|WARN)\`, not just \`ERROR\`. \`-E\` isn't strictly required in this sandbox (its regex is always "extended"), but typing it is good muscle memory for real \`grep\`, where plain \`grep\` needs it to enable \`|\`, \`+\`, \`?\`, and unescaped \`()\`.

## Groups and backreferences with sed

Parentheses don't just group alternatives - they **capture** the text they matched, so you can reuse it in a replacement. \`sed\` refers to captured groups as \`\\1\`, \`\\2\`, and so on:

\`\`\`bash
echo "John Smith" > name.txt
sed 's/([A-Z][a-z]+) ([A-Z][a-z]+)/\\2 \\1/' name.txt
\`\`\`

That swaps first and last name: group 1 captures "John," group 2 captures "Smith," and the replacement \`\\2 \\1\` writes them back in reverse order.

## Try it

\`\`\`bash
printf 'ERROR: disk full\\nWARN: low memory\\nline three\\n' > log.txt
grep '^ERROR' log.txt
grep -E '^(ERROR|WARN)' log.txt
grep '[0-9]' log.txt
echo "John Smith" > name.txt
sed 's/([A-Z][a-z]+) ([A-Z][a-z]+)/\\2 \\1/' name.txt
\`\`\`

## Further reading

- **"Mastering Regular Expressions"** by Jeffrey Friedl (O'Reilly) - the definitive, exhaustive book on regex across every major tool and language.
- **"sed & awk"** by Dale Dougherty and Arnold Robbins (O'Reilly) - ties regex directly into real \`sed\` and \`awk\` usage, with the classic POSIX dialects this lesson's modern syntax evolved from.
`,
  },
  {
    id: 'advanced-networking',
    slug: 'advanced-networking',
    title: 'Advanced Networking & Diagnostics',
    description: 'Reading netstat/ss output, DNS with dig, and tracing a route hop by hop.',
    difficulty: 'advanced',
    track: 'linux',
    order: 21,
    trackCommand: 'ss',
    challenge:
      'Check which ports are currently listening with `ss`, then trace the network path to `example.com`. Do both in one line joined with `&&`.',
    solution: 'ss && traceroute example.com',
    content: `# Advanced Networking & Diagnostics

The Networking Basics lesson covered *reaching* a host. This one is about *diagnosing* a connection that isn't behaving: what's listening locally, what DNS actually resolved, and where along the path things are slow or broken.

## netstat and ss: what's listening

Before you can debug "why won't clients connect," check whether anything is even listening on the port you expect:

\`\`\`bash
netstat
ss
\`\`\`

\`ss\` ("socket statistics") is the modern replacement for \`netstat\` - faster on a real system, and the one you'll find preinstalled going forward. Both report the same shape of information:

\`\`\`
Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port
tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*
\`\`\`

\`State: LISTEN\` on \`0.0.0.0:22\` means: something is bound to port 22, accepting connections from any address. If your own service's port is missing from this list entirely, the problem isn't the network - the service never started, or it's not listening where you think it is.

## dig and nslookup: is it DNS?

A surprising fraction of "the server is down" reports are actually DNS problems - the name never resolved to the right address in the first place.

\`\`\`bash
dig example.com
nslookup example.com
\`\`\`

\`dig\`'s output is the more detailed of the two, structured in sections:

\`\`\`
;; QUESTION SECTION:
;example.com.       IN  A

;; ANSWER SECTION:
example.com.  300   IN  A  203.0.113.10

;; Query time: 24 msec
;; SERVER: 127.0.0.53#53(127.0.0.53)
\`\`\`

The **ANSWER SECTION** is what you came for: the actual IP address that name resolved to, and a TTL (\`300\`, in seconds) telling you how long that answer can be cached before it should be looked up again. \`nslookup\` prints the same core answer in a shorter, older format.

## traceroute: where does it slow down or stop

Once you know DNS is correct, \`traceroute\` shows every network hop between you and the destination, with the round-trip time to each one:

\`\`\`bash
traceroute example.com
\`\`\`

\`\`\`
traceroute to example.com (203.0.113.10), 30 hops max
1   10.0.1.1        7 ms
2   10.0.2.1       10 ms
3   203.0.113.10   27 ms
\`\`\`

Reading it: latency climbing steadily across hops is normal (you're crossing more distance and more routers). A hop that suddenly times out or spikes hard, followed by hops *after* it recovering, usually points at one overloaded or misconfigured router in the middle - not a problem with your machine or the destination.

## A troubleshooting order that actually works

1. **Is it DNS?** \`dig\` the hostname - does it resolve, and to the address you expect?
2. **Is it reachable at all?** \`ping\` the resolved IP directly, bypassing DNS.
3. **Is the port open?** \`ss\`/\`netstat\` on the server, or a direct connection attempt from the client.
4. **Where's it slow?** \`traceroute\` to see which hop introduces the delay.

Working in that order - name, then host, then port, then path - finds the actual fault far faster than guessing.

## Try it

\`\`\`bash
ss
netstat
dig example.com
nslookup example.com
traceroute example.com
\`\`\`

## Further reading

- **"TCP/IP Illustrated, Volume 1"** by W. Richard Stevens (Addison-Wesley) - the deep, authoritative reference for what \`dig\` and \`traceroute\` are actually showing you on the wire.
- **"UNIX and Linux System Administration Handbook"** by Nemeth, Snyder, Hein, Whaley, and Mackin (Pearson) - walks through exactly this kind of layered network troubleshooting on real production systems.
`,
  },
  {
    id: 'process-signals-and-jobs',
    slug: 'process-signals-and-jobs',
    title: 'Process Signals & Job Control',
    description: 'What kill actually sends, the signals worth knowing, and running work in the background.',
    difficulty: 'advanced',
    track: 'linux',
    order: 22,
    trackCommand: 'jobs',
    challenge: 'Start `sleep 30` as a background job with a single command.',
    solution: 'sleep 30 &',
    content: `# Process Signals & Job Control

\`kill\` is a misleading name - it doesn't only kill things. It **sends a signal**, and different signals ask a process to do very different things. Understanding signals turns "kill -9 everything" from a reflex into an actual choice.

## Signals: small messages, not just death

A **signal** is a tiny, asynchronous notification the kernel delivers to a process - "someone hung up," "please terminate," "stop running for now." The process can choose how to react to most of them (or ignore them entirely).

| Signal | Number | Meaning |
| ------ | ------ | ------- |
| \`SIGHUP\` | 1 | Terminal hung up - conventionally also means "reload your config" |
| \`SIGINT\` | 2 | Interrupt - what Ctrl-C sends |
| \`SIGKILL\` | 9 | Terminate immediately - **cannot be caught, blocked, or ignored** |
| \`SIGTERM\` | 15 | Please terminate gracefully - the *default* signal \`kill\` sends |
| \`SIGSTOP\` | 19 | Pause the process - cannot be caught or ignored |
| \`SIGCONT\` | 18 | Resume a stopped process |

\`\`\`bash
kill 1234          # sends SIGTERM (15) - "please shut down"
kill -9 1234        # sends SIGKILL - immediate, no cleanup, last resort
kill -HUP 1234      # sends SIGHUP - many daemons reload config on this instead of restarting
\`\`\`

## Why SIGTERM before SIGKILL

\`SIGTERM\` gives a process a chance to close files, flush buffers, and shut down its children cleanly. \`SIGKILL\` gives it no chance at all - the kernel just removes it, which can leave temp files, locks, or half-written data behind. The right habit: try plain \`kill\` (SIGTERM) first, and only reach for \`kill -9\` when a process is well and truly stuck ignoring it.

## Job control: foreground, background, and back again

Every command you run occupies your terminal until it finishes - unless you tell the shell otherwise:

\`\`\`bash
sleep 30            # foreground: your prompt is blocked until this returns
sleep 30 &           # background: prompt comes back immediately
jobs                 # list jobs you've started with &, in this session
fg                   # bring the most recent background job to the foreground
fg %1                # bring job number 1 specifically to the foreground
bg %1                # resume a STOPPED job (e.g. after Ctrl-Z) in the background
\`\`\`

\`jobs\` prints each background job with a number like \`[1]\`; that number is what \`%1\` in \`fg\`/\`bg\` refers to. On a real terminal, **Ctrl-Z** suspends (stops, not kills) whatever's currently in the foreground, handing you back the prompt - \`bg\` then resumes it in the background, and \`fg\` resumes it in the foreground.

> This sandbox has no true concurrency, so a backgrounded command still runs to completion immediately rather than continuing alongside your next command - \`jobs\` will show it as already \`Done\`. The commands and their purpose are exactly what you'd use on a real system; only the timing is simplified.

## nohup: surviving a closed terminal

A background job is still a child of your shell - close the terminal, and it normally gets \`SIGHUP\` and dies with it. \`nohup\` makes a command immune to that specific signal, which is why it's the standard way to start something that should outlive your SSH session:

\`\`\`bash
nohup ./long-running-job.sh &
\`\`\`

Output that would have gone to your terminal is redirected into a file called \`nohup.out\` instead, so you can check on it later even after logging out.

## Try it

\`\`\`bash
sleep 30 &
jobs
fg
kill -9 1234
kill -HUP 1234
nohup ping example.com
\`\`\`

## Further reading

- **"How Linux Works"** by Brian Ward (No Starch Press) - explains signals from the kernel's side: how they're delivered, queued, and why some can't be blocked.
- **"The Linux Command Line"** by William Shotts (No Starch Press) - its job control chapter covers \`fg\`/\`bg\`/\`jobs\`/Ctrl-Z with the exact terminal-driver mechanics behind them.
`,
  },
  {
    id: 'firewalls-and-network-security',
    slug: 'firewalls-and-network-security',
    title: 'Firewalls & Network Security',
    description: 'Default-deny thinking, ufw in practice, and how it relates to iptables underneath.',
    difficulty: 'advanced',
    track: 'linux',
    order: 23,
    trackCommand: 'ufw',
    challenge: 'Enable the firewall, then allow SSH traffic through it. Do both in one line joined with `&&`.',
    solution: 'ufw enable && ufw allow 22',
    content: `# Firewalls & Network Security

The Security Basics lesson mentioned firewalls in passing: "default deny, then open exactly what's needed." This lesson is that idea put into practice with the actual tool.

## Default deny, one more time

A firewall's whole job is deciding which network traffic is allowed to reach a machine. The safe posture is always the same: **block everything by default, then explicitly allow only what the box actually needs to serve.** For a typical web server, that's usually just three ports: SSH (22) to manage it, and HTTP/HTTPS (80/443) to serve traffic - nothing else.

## ufw: the friendly front-end

On Ubuntu and Debian-family systems, \`ufw\` ("Uncomplicated Firewall") is the tool you'll reach for day to day:

\`\`\`bash
ufw status              # is it even on? what's currently allowed?
ufw enable               # turn the firewall on
ufw disable               # turn it off
ufw allow 22               # allow traffic on port 22 (SSH)
ufw allow 80                # allow traffic on port 80 (HTTP)
ufw deny 23                  # explicitly block port 23 (telnet - don't run this anyway)
\`\`\`

\`ufw status\` after adding rules shows exactly what's permitted:

\`\`\`
Status: active

To                         Action      From
--                         ------      ----
22                         ALLOW       Anywhere
80                         ALLOW       Anywhere
\`\`\`

Anything not listed here is denied by default the moment \`ufw\` is enabled - that's the entire point.

## iptables: what ufw is a front-end for

Underneath \`ufw\` (and every other Linux firewall tool) is the kernel's own packet filter, configured through \`iptables\` (or its modern successor, \`nftables\`). \`iptables\` organizes rules into **chains**:

\`\`\`bash
iptables -L
\`\`\`

\`\`\`
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
\`\`\`

- **INPUT** - traffic destined for this machine.
- **FORWARD** - traffic passing through this machine to somewhere else (relevant for routers).
- **OUTPUT** - traffic leaving this machine.

Each chain has a default **policy** (\`ACCEPT\` or \`DROP\`), and rules are checked top to bottom until one matches. \`ufw\` exists because hand-writing \`iptables\` rules correctly - and in the right order - is genuinely fiddly; \`ufw allow 22\` quietly generates the equivalent \`iptables\` rule for you.

## Beyond the firewall itself

A firewall controls *reachability*, not the whole security picture:

- **fail2ban** watches log files (like SSH's) for repeated failed login attempts and temporarily firewalls off the offending address - a firewall rule that writes itself in response to abuse.
- **Cloud security groups** (AWS, GCP, Azure) are the same default-deny idea, enforced one layer up, outside the machine entirely - useful because a misconfigured in-instance firewall can't accidentally lock out a security group's protection.

## Try it

\`\`\`bash
ufw status
ufw enable
ufw allow 22
ufw allow 80
ufw status
iptables -L
\`\`\`

## Further reading

- **"UNIX and Linux System Administration Handbook"** by Nemeth, Snyder, Hein, Whaley, and Mackin (Pearson) - covers firewall design as part of real production hardening, including the default-deny reasoning this lesson leads with.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains \`iptables\`' chain-and-policy model from the kernel's packet-filtering code outward.
`,
  },
  {
    id: 'linux-boot-process',
    slug: 'linux-boot-process',
    title: 'The Linux Boot Process & Kernel',
    description: 'From power-on to a login prompt: firmware, bootloader, kernel, initramfs, and PID 1.',
    difficulty: 'expert',
    track: 'linux',
    order: 24,
    trackCommand: 'dmesg',
    challenge: 'Print detailed kernel version information, then view the kernel\'s boot log. Do both in one line joined with `&&`.',
    solution: 'uname -a && dmesg',
    content: `# The Linux Boot Process & Kernel

Every command in this course runs *after* a machine has already finished an elaborate handoff of control - from firmware, to a tiny bootloader, to the kernel itself, to the first real process. Knowing that sequence is what turns "the server won't come back up" from a mystery into a checklist.

## 1. Firmware: BIOS or UEFI

The moment a machine powers on, firmware built into the motherboard runs first - either the older **BIOS** or the modern, more capable **UEFI**. Its only job is to initialize just enough hardware to find a storage device with a bootloader on it, then hand control over.

## 2. The bootloader: GRUB

On most Linux systems, that bootloader is **GRUB** (GRand Unified Bootloader). GRUB shows the menu you sometimes see for a few seconds at startup - pick a kernel version, or boot into recovery mode. Its configuration lives at \`/boot/grub/grub.cfg\`, generated from \`/etc/default/grub\` and the kernels actually installed in \`/boot\`. GRUB's job ends the moment it loads a kernel image into memory and jumps to it.

## 3. The kernel and initramfs

The kernel image (\`/boot/vmlinuz-<version>\`) is the Linux kernel itself. But it needs drivers to even *read* the real root filesystem - a chicken-and-egg problem solved by the **initramfs** (initial RAM filesystem): a small, temporary filesystem loaded into memory alongside the kernel, containing just enough drivers and tools to find and mount the real root disk. Once that's mounted, the kernel switches over to it and initramfs's job is done.

## 4. PID 1: systemd takes over

The kernel then starts exactly one process by hand - conventionally \`/sbin/init\`, which on virtually every modern distribution is a symlink to **systemd**. That process always gets **process ID 1**, and everything else on the system - every service, every shell, every one of the commands you've run in this course - is its descendant, directly or indirectly. This is exactly where the systemd lesson picked up the story; boot is the part that happens *before* \`systemctl\` has anything to manage yet.

## Watching it happen: dmesg

The kernel logs everything it does during this process into an in-memory **ring buffer**, readable with \`dmesg\`:

\`\`\`bash
dmesg
\`\`\`

\`\`\`
[    0.000000] Linux version 5.15.0 (gcc 11.4.0)
[    0.012345] Command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1 ro quiet
[    0.456789] EXT4-fs (sda1): mounted filesystem with ordered data mode
[    1.012345] systemd[1]: Starting Journal Service...
\`\`\`

Those bracketed numbers are seconds since boot - \`dmesg\` is the single best place to find *why* a boot failed: a missing driver, a filesystem that wouldn't mount, a device that timed out.

## Kernel modules

The kernel doesn't ship every driver built permanently in - most are **modules**, loaded on demand:

\`\`\`bash
lsmod                     # list currently loaded kernel modules
modprobe <name>           # load a module (and anything it depends on)
rmmod <name>              # unload a module
\`\`\`

This is why plugging in a new USB device can "just work" without a reboot: the kernel detects it and \`modprobe\`s the matching driver module on the spot.

## /proc and /sys: the kernel as a filesystem

Once running, the kernel exposes live information about itself through two virtual filesystems that exist only in memory, never on disk:

- **/proc** - one directory per running process (\`/proc/1284\`), plus system-wide info like \`/proc/cpuinfo\` and \`/proc/meminfo\`. \`uname\`, \`free\`, and \`ps\` all ultimately read from here.
- **/sys** - a structured view of devices, drivers, and kernel parameters, organized by the hardware they represent.

Both are why so many "reading system state" commands are actually just formatted \`cat\`s of a file under one of these two trees.

## Try it

\`\`\`bash
uname -a
dmesg
lsmod
modprobe nonexistent-driver
\`\`\`

## Further reading

- **"How Linux Works"** by Brian Ward (No Starch Press) - its boot chapter walks through firmware, GRUB, initramfs, and systemd startup in exactly this order, with real config file locations.
- **"Linux Kernel Development"** by Robert Love (Addison-Wesley) - goes further into what the kernel is actually doing once control reaches it, for anyone curious past the boot sequence itself.
`,
  },
  {
    id: 'containers-from-first-principles',
    slug: 'containers-from-first-principles',
    title: 'Containers From First Principles',
    description: 'The kernel features - namespaces and cgroups - that Docker and Kubernetes are built on.',
    difficulty: 'expert',
    track: 'linux',
    order: 25,
    trackCommand: 'ps',
    challenge: 'Print the current kernel version, then list every running process - the two things a container runtime checks before it starts anything. Do both in one line joined with `&&`.',
    solution: 'uname -a && ps aux',
    content: `# Containers From First Principles

The history lesson mentioned that Docker "packaged two kernel primitives into an easy developer workflow." This lesson is what those two primitives actually are - because a container is not a lightweight virtual machine, and understanding the real mechanism explains almost everything about how containers behave.

## A container is not a VM

A virtual machine runs a full, separate kernel on top of virtualized hardware - genuinely isolated, but heavy. A **container** runs on the exact same kernel as its host; there is no second kernel booting anywhere. What makes it look like an isolated machine is entirely the kernel *pretending*, very convincingly, that a normal process can't see or touch anything outside its container. That illusion is built from two features.

## Namespaces: what a process can SEE

A **namespace** wraps a process so that, within it, some global resource appears to be its own private copy - even though everyone is still sharing the one real kernel:

| Namespace | Isolates |
| --------- | -------- |
| PID | Process IDs - a containerized process can be PID 1 inside its own namespace, unaware of every other process on the host |
| NET | Network interfaces, IP addresses, routing tables - a container gets what looks like its own network stack |
| MNT | Mount points - a container sees its own filesystem tree, not the host's |
| UTS | Hostname - a container can have its own hostname, independent of the host's |
| IPC | Inter-process communication - message queues and shared memory don't leak between namespaces |
| USER | User and group IDs - "root" inside a container can map to an unprivileged user outside it |

\`unshare\` and \`nsenter\` are the raw tools that create and enter namespaces directly - Docker calls the same kernel APIs those wrap, just automatically, every time you run \`docker run\`.

## cgroups: what a process can USE

**Control groups** (cgroups) are the second half: they *limit and account for* resources - CPU time, memory, disk I/O, network bandwidth - for a group of processes, instead of just hiding things from view. A container's memory and CPU limits (\`docker run --memory=512m\`) are cgroup rules under the hood. This is also how the kernel enforces the **OOM killer** decision when a container tries to use more memory than its cgroup allows: the offending process inside it gets killed, without touching anything outside that cgroup.

## The third piece: a union filesystem

Namespaces and cgroups explain isolation and limits, but not images - the ability to layer a small Alpine base, then add your app on top, and ship just the diff. That's a **union filesystem** (commonly OverlayFS on Linux): multiple read-only layers stacked underneath one writable layer on top. Each image layer is one of those read-only slices; a running container only ever writes into its own thin top layer, which is why deleting a container leaves the shared, cached base layers untouched for the next one.

## chroot: the ancestor of the idea

Long before namespaces existed, \`chroot\` gave a process a different *apparent* root directory - a primitive, partial ancestor of the mount namespace, dating back to 1979 Unix. \`chroot\` alone is trivially escapable and was never meant as real security isolation; namespaces and cgroups are what turned "a different-looking root directory" into "a genuinely contained process."

## Putting it together

\`\`\`
docker run --memory=512m myapp
                  │
                  ├── new PID, NET, MNT, UTS, IPC, USER namespaces  (isolation)
                  ├── a cgroup capping memory at 512MB               (limits)
                  └── myapp's image, mounted via OverlayFS            (filesystem)
\`\`\`

Every "container" is really just: an ordinary Linux process, wrapped in namespaces it can't see past, metered by a cgroup it can't exceed, and rooted at an OverlayFS mount it thinks is the whole disk.

## Try it

\`\`\`bash
uname -a
ps aux
chroot /some/path
unshare --pid echo hi
docker run alpine
\`\`\`

## Further reading

- **"How Linux Works"** by Brian Ward (No Starch Press) - covers namespaces and cgroups directly, as kernel features independent of any specific container tool.
- **"The Cathedral and the Bazaar"** by Eric S. Raymond, and the Linux history lesson in this course - for the "why did this get built" context: Docker's 2013 breakthrough was packaging, not invention.
`,
  },
  {
    id: 'performance-troubleshooting',
    slug: 'performance-troubleshooting',
    title: 'Performance Troubleshooting',
    description: 'Reading load average, top, and vmstat to find whether CPU, memory, or I/O is the bottleneck.',
    difficulty: 'expert',
    track: 'linux',
    order: 26,
    trackCommand: 'top',
    challenge:
      'Get a live process snapshot, then check memory and system load in human-readable form. Chain all three in one line with `&&`.',
    solution: 'top && free -h && uptime',
    content: `# Performance Troubleshooting

"The server is slow" is not a diagnosis - it's a starting point. This lesson is a systematic way to turn that complaint into an actual bottleneck: CPU, memory, or I/O, in that order of how fast you can usually check them.

## Load average: the first number to check

\`uptime\` and \`top\` both report **load average** - three numbers, averaged over the last 1, 5, and 15 minutes:

\`\`\`bash
uptime
\`\`\`

\`\`\`
14:32:05 up 3 days, load average: 4.21, 3.87, 2.10
\`\`\`

A load average is the average number of processes wanting CPU time - either running or waiting for their turn. The number alone means nothing without context: it needs to be read **relative to CPU count**. Check that first:

\`\`\`bash
nproc
\`\`\`

A load average of \`4.21\` on an 8-core box (\`nproc\` → 8) means the machine is roughly half-utilized - fine. That same \`4.21\` on a 2-core box means work is queuing up, over double what the machine can run at once - a real problem. The rising trend across the three windows (\`4.21, 3.87, 2.10\`) also matters: climbing means it's getting worse right now; falling means whatever caused it is already easing off.

## top: who's actually using it

\`\`\`bash
top
\`\`\`

\`\`\`
%Cpu(s):  2.3 us,  1.0 sy,  0.0 ni, 96.5 id
MiB Mem :   7898.4 total,   5343.0 free,   1257.4 used

  PID USER   %CPU  %MEM    VIRT    RES  COMMAND
 4821 www    89.2   12.4  820000 380000  nginx
\`\`\`

- **%CPU / %MEM** per process - the columns you'll look at first to find a runaway process.
- **VIRT** - total virtual memory a process has *mapped*, including memory it hasn't actually touched yet. Usually much bigger than reality, and rarely the number that matters.
- **RES** - resident memory: what the process is *actually* using in RAM right now. This is the number worth watching for a real leak.

## free: memory, read correctly

\`\`\`bash
free -h
\`\`\`

\`\`\`
              total    used    free   buff/cache   available
Mem:          7.7Gi    1.2Gi   5.1Gi      1.4Gi        6.3Gi
\`\`\`

The trap almost everyone falls into once: \`free\` doesn't mean *problem*. Linux deliberately uses spare RAM to cache recently-read files (\`buff/cache\`), because unused RAM is wasted RAM - that cache is released instantly the moment something else needs it. The number that actually matters is **available**, not **free**: it already accounts for how much of that cache could be reclaimed on demand.

## vmstat and iostat: is it CPU, memory, or disk

\`\`\`bash
vmstat 1
iostat
\`\`\`

\`vmstat\`'s columns split the story cleanly:

- \`r\` - processes actively waiting for CPU (high and climbing → CPU-bound).
- \`si\`/\`so\` - swap in/out (anything above zero, sustained, means you've run out of real RAM).
- \`wa\` (in the cpu section) - percent of time CPU sat idle waiting on disk I/O (high → I/O-bound, not CPU-bound).

\`iostat\` breaks disk activity down further, per device - useful for confirming *which* disk is the one saturated.

## The USE method

A compact framework, useful for any resource (CPU, memory, disk, network) when you're not sure where to start:

- **Utilization** - how busy is it? (percent time doing work)
- **Saturation** - how much work is queued, waiting for it? (\`r\` column, load average)
- **Errors** - is it failing outright, separate from being merely busy?

Checked in that order, for each resource in turn, it very quickly narrows "slow" down to one specific, provable bottleneck instead of a guess.

## When it's not a resource at all: strace

Sometimes nothing is short on CPU, memory, or I/O, and a process is just stuck - blocked on a lock, a slow DNS lookup, a hung network call. \`strace\` attaches to a running process and prints every system call it makes in real time, which is usually the fastest way to see *exactly* what it's waiting on.

## Try it

\`\`\`bash
uptime
nproc
top
free -h
vmstat
iostat
strace -p 1234
\`\`\`

## Further reading

- **"Systems Performance"** by Brendan Gregg (Addison-Wesley) - the definitive book on this entire topic, written by the engineer who popularized the USE method.
- **"How Linux Works"** by Brian Ward (No Starch Press) - explains what the kernel is actually tracking behind \`top\`, \`free\`, and \`vmstat\`'s numbers.
`,
  },

  // ─────────────────────────── CI/CD & Jenkins ───────────────────────────
  {
    id: 'cicd-fundamentals',
    slug: 'cicd-fundamentals',
    title: 'CI/CD Fundamentals',
    description: 'What continuous integration and continuous delivery actually mean, and why teams automate the path from commit to running software.',
    difficulty: 'beginner',
    track: 'cicd',
    order: 27,
    trackCommand: 'git init',
    challenge: 'Initialize a brand-new git repository in the current directory.',
    solution: 'git init',
    content: `# CI/CD Fundamentals

Every commit a developer makes eventually has to become running software. **CI/CD** is the set of practices that automates that journey instead of leaving it to someone remembering to run the right commands in the right order.

## Continuous Integration (CI)

**CI** means every developer merges their changes into a shared branch frequently - often several times a day - and a machine automatically **builds** the project and **runs the test suite** on every merge.

The payoff: if two people's changes conflict, or someone breaks a test, you find out in minutes, not weeks later when it's tangled up with a dozen other changes.

## Continuous Delivery vs. Continuous Deployment

These two terms get used interchangeably, but they're not the same:

| Term                   | What happens after tests pass                          |
| ---------------------- | -------------------------------------------------------- |
| Continuous **Delivery** | A release is built and ready to ship - a human clicks "deploy". |
| Continuous **Deployment** | It ships to production automatically, no human in the loop.  |

Most teams start with delivery (a safety net of human judgment before production) and graduate to full deployment once their test suite is trustworthy enough.

## The pipeline shape

Nearly every CI/CD pipeline, regardless of the tool running it, boils down to the same stages:

\`\`\`
checkout → build → test → package → deploy
\`\`\`

Every stage after \`checkout\` only runs if the one before it succeeded - that's the whole point. A failing test should stop a bad build from ever reaching a deploy step.

## Why bother automating it?

- **Fast feedback** - a broken build is caught in minutes, while the change is still fresh in the author's head.
- **Consistency** - the exact same steps run every time, with no "works on my machine" variance.
- **Confidence** - a green pipeline is a receipt that the thing you're about to ship actually builds and passes its tests.

Every pipeline needs somewhere to track changes before it can build anything from them - that's **git**, which you'll use constantly across this track.

Try it in the sandbox:

\`\`\`bash
git init
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'jenkins-intro',
    slug: 'jenkins-intro',
    title: 'Introduction to Jenkins',
    description: 'What Jenkins is, how its controller/agent model works, and the difference between a freestyle job and a pipeline.',
    difficulty: 'beginner',
    track: 'cicd',
    order: 28,
    trackCommand: 'systemctl status jenkins',
    challenge: 'Check whether the jenkins service is currently active on this machine.',
    solution: 'systemctl status jenkins',
    content: `# Introduction to Jenkins

**Jenkins** is an open-source automation server, and for a long time the default answer to "how do we run CI/CD here." It's free, endlessly extensible via plugins, and still runs the pipelines of a huge share of the software industry.

## Controller and agents

Jenkins splits its work across two roles:

- The **controller** (historically called the "master") - the brain. It holds configuration, schedules work, and serves the web UI.
- **Agents** (historically "slaves") - the machines that actually run your builds. A controller can farm work out to dozens of agents, each with different tools installed (a Node agent, a Java agent, a GPU agent for ML builds, and so on).

This split matters because it lets Jenkins scale: the controller stays lightweight, and you add agents when you need more build capacity.

## Jobs vs. Pipelines

Jenkins has two very different ways to define "what to run":

- A **Freestyle job** - a set of build steps configured by clicking through a web form. Quick to set up, hard to review or version.
- A **Pipeline** - the modern approach: the steps live in code (a \`Jenkinsfile\`), checked into your repository right alongside the application it builds.

Almost every team writing new automation today reaches for Pipelines - you'll build one in the next lesson.

## Checking on a service

Jenkins itself typically runs as a background service, managed the same way any other long-running Linux service is - with \`systemctl\`:

\`\`\`bash
systemctl status jenkins
\`\`\`

A healthy Jenkins controller shows up as \`active (running)\`, the exact same way nginx or any other daemon would.

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'jenkinsfile-basics',
    slug: 'jenkinsfile-basics',
    title: 'Writing a Jenkinsfile',
    description: 'Declarative pipeline syntax: stages, steps, and keeping your pipeline checked into source control.',
    difficulty: 'intermediate',
    track: 'cicd',
    order: 29,
    trackCommand: 'touch Jenkinsfile',
    challenge: 'Create an empty file named `Jenkinsfile` in the current directory - the first step toward pipeline-as-code.',
    solution: 'touch Jenkinsfile',
    content: `# Writing a Jenkinsfile

A \`Jenkinsfile\` is a text file, committed to your repository, that describes your entire pipeline. This is **pipeline as code**: the build process gets reviewed in pull requests, versioned alongside the app, and never lives only in someone's memory of how the Jenkins UI was clicked through.

## Declarative pipeline shape

The most common style is the **declarative pipeline** - a structured block that reads almost like a checklist:

\`\`\`groovy
pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Deploy') {
      steps {
        sh './deploy.sh'
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed - notify the team'
    }
  }
}
\`\`\`

## Reading it piece by piece

- \`agent any\` - run this pipeline on whichever available agent Jenkins picks.
- \`stages\` - the ordered list of phases. Each \`stage\` shows up as its own box in the Jenkins UI, so you can see exactly which one failed.
- \`steps\` - the actual shell commands (\`sh '...'\`) that do the work inside a stage.
- \`post\` - runs after everything else, regardless of outcome - the natural place for notifications, cleanup, or artifact archiving.

## Why the file lives in your repo

Because the \`Jenkinsfile\` travels with the code, a pull request that changes the test command, or adds a new deployment step, is reviewed exactly like any other code change - no separate "go click this setting in Jenkins" step that someone inevitably forgets to do.

Create one now:

\`\`\`bash
touch Jenkinsfile
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'jenkins-triggers',
    slug: 'jenkins-triggers',
    title: 'Build Triggers & Webhooks',
    description: 'Polling SCM, GitHub webhooks, and scheduled builds - what actually kicks off a Jenkins pipeline.',
    difficulty: 'advanced',
    track: 'cicd',
    order: 30,
    trackCommand: 'echo',
    challenge:
      'Write a crontab line into a file called `nightly-build` that runs `/usr/local/bin/run-pipeline.sh` every night at 1:00 AM, using a single redirected `echo`.',
    solution: "echo '0 1 * * * /usr/local/bin/run-pipeline.sh' > nightly-build",
    content: `# Build Triggers & Webhooks

A pipeline sitting in a \`Jenkinsfile\` does nothing until something tells Jenkins to run it. There are three common ways that happens.

## 1. Webhooks (push-triggered)

Your git host (GitHub, GitLab, Bitbucket) calls a URL on your Jenkins controller the instant someone pushes a commit. Jenkins starts the build within seconds, with zero delay and zero wasted checks when nothing has changed.

This is the gold standard for responsiveness, but it requires your Jenkins controller to be reachable from the internet (or at least from your git host) - not always true for a controller sitting deep inside a private network.

## 2. Polling SCM

If a webhook isn't possible, Jenkins can instead check the repository on a schedule - "every 5 minutes, has anything changed? If so, build." It's less instant and wastes a small amount of work on every check that finds nothing new, but it works from anywhere Jenkins can reach the repo, no inbound connection required.

## 3. Scheduled builds (cron syntax)

Some builds don't wait on a code change at all - a nightly full-suite run, a weekly dependency-update check. These use the exact same five-field cron syntax you'd put in a real crontab:

\`\`\`
minute hour day-of-month month day-of-week
0      1    *             *     *
\`\`\`

Jenkins adds one twist: an \`H\` in place of a number (\`H 1 * * *\`) tells it to pick a consistent-but-spread-out minute itself, so a thousand jobs scheduled for "1 AM" don't all slam the build farm in the exact same 60 seconds.

## Try it

Real cron, outside of Jenkins, works the same way - a line in a file, loaded with \`crontab\`:

\`\`\`bash
echo '0 1 * * * /usr/local/bin/run-pipeline.sh' > nightly-build
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'jenkins-deploy',
    slug: 'jenkins-deploy',
    title: 'Deploying from a Pipeline',
    description: "Turning a green build into a release: artifacts, environments, and shipping code out over SSH.",
    difficulty: 'expert',
    track: 'cicd',
    order: 31,
    trackCommand: 'ssh deploy@prod-server',
    challenge: 'Connect to the production deploy target over SSH as the `deploy` user.',
    solution: 'ssh deploy@prod-server',
    content: `# Deploying from a Pipeline

Build and test stages prove the code works. The **deploy** stage is where it actually starts running somewhere real - and where mistakes are the most expensive, so it deserves its own habits.

## Build once, promote everywhere

A common mistake: rebuilding the application separately for dev, staging, and production. That means three different builds, and no real guarantee they're identical.

The fix: build **one** artifact (a jar, a Docker image, a zip of static assets), and promote that *exact same* artifact through each environment:

\`\`\`
build → artifact.zip → deploy to dev → deploy to staging → deploy to prod
\`\`\`

If it passed staging, production is getting the literal bytes that were tested - not a "should be the same" rebuild.

## Common deploy steps

A deploy stage in a Jenkinsfile is usually just shell commands wired up to move that artifact somewhere and restart a service:

\`\`\`groovy
stage('Deploy') {
  steps {
    sh 'scp build/app.jar deploy@prod-server:/opt/app/'
    sh 'ssh deploy@prod-server "systemctl restart app"'
  }
}
\`\`\`

\`rsync\` is a frequent upgrade over plain \`scp\` for anything bigger than a single file, since it only transfers what actually changed.

## Rollback is part of the plan, not an afterthought

The deploy stage that matters most is the one that *hasn't failed yet*. Keep the previous artifact around, and know exactly how you'd restore it:

- Re-deploy the last-known-good artifact.
- Or keep two environments ("blue" and "green") and just flip which one receives traffic.

A deploy step without a rollback plan isn't really a safety net - it's a bet.

## Try it

\`\`\`bash
ssh deploy@prod-server
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },

  // ─────────────────────────── Cloud fundamentals ───────────────────────────
  {
    id: 'cloud-computing-basics',
    slug: 'cloud-computing-basics',
    title: 'Cloud Computing Basics',
    description: 'IaaS, PaaS, and SaaS, and why renting compute changed how software gets built.',
    difficulty: 'beginner',
    track: 'cloud',
    order: 32,
    trackCommand: 'curl -I https://api.example-cloud.com',
    challenge:
      "Send a HEAD request to `https://api.example-cloud.com` to check the cloud provider's API is reachable, without downloading the body.",
    solution: 'curl -I https://api.example-cloud.com',
    content: `# Cloud Computing Basics

**Cloud computing** means renting someone else's computers - over the internet, by the hour or by the second - instead of buying and racking your own hardware.

## The three service models

| Model | What the provider manages | What you still manage | Example |
| ----- | -------------------------- | ---------------------- | ------- |
| **IaaS** (Infrastructure) | Physical servers, networking, virtualization | OS, runtime, your app | A virtual machine |
| **PaaS** (Platform) | + the OS and runtime | Just your application code | A managed app platform |
| **SaaS** (Software) | Everything, including the app | Just your data and settings | Gmail, Slack |

Each layer up the stack trades flexibility for less to manage. DevOps work tends to live mostly in the IaaS layer and the tooling that sits just above it.

## Why it changed everything

Before the cloud, getting a new server meant ordering hardware, waiting days or weeks for it to arrive, and racking it yourself. Three properties flipped that:

- **On-demand** - a new server exists in seconds, not weeks.
- **Elastic** - scale from one instance to a thousand and back, automatically, as load changes.
- **Pay-as-you-go** - pay for what you used this hour, not what you guessed you'd need this year.

## Regions and Availability Zones

Every major provider splits the world into **regions** (e.g. "US East", "EU West"), and each region into multiple **Availability Zones** - physically separate data centers with independent power and networking.

Spreading a service across AZs within a region is the cheapest insurance against "one data center had a bad day" taking your whole application down with it.

## Shared responsibility

The provider secures the cloud itself (physical security, the hypervisor, their network). You're still responsible for securing what you put *in* the cloud - your data, your access controls, your configuration. A misconfigured storage bucket is on you, not them.

## Try it

\`\`\`bash
curl -I https://api.example-cloud.com
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'cloud-compute',
    slug: 'cloud-compute',
    title: 'Compute in the Cloud',
    description: 'Virtual machines, auto-scaling groups, and load balancers - the building blocks behind "just add more servers."',
    difficulty: 'intermediate',
    track: 'cloud',
    order: 33,
    trackCommand: 'ps aux',
    challenge: "A cloud instance is really just a Linux box underneath - list every running process to see what's using its CPU.",
    solution: 'ps aux',
    content: `# Compute in the Cloud

Strip away the marketing names, and a cloud "instance" is a virtual machine running on someone else's hardware - everything you already know about Linux processes, memory, and disk applies directly.

## Instance types and sizing

Providers sell VMs in fixed "shapes" - a combination of vCPUs, memory, and sometimes GPU or local disk, bundled into a named size (small, medium, large, and dozens of finer-grained tiers). Picking the right size is mostly about matching your workload's actual CPU and memory profile instead of guessing high "to be safe," which just burns money.

## Auto-scaling

An **auto-scaling group** keeps a fleet of identical instances running, and adjusts the count automatically based on a metric - almost always CPU usage or request count:

\`\`\`
if average CPU > 70% for 5 minutes:
    add an instance
if average CPU < 20% for 15 minutes:
    remove an instance
\`\`\`

This is the mechanism behind "the site scaled up for the traffic spike and back down afterward" - no human watching a dashboard and deciding in the moment.

## Load balancers

A **load balancer** sits in front of that fleet and spreads incoming traffic across every healthy instance. It also does continuous health checks, and quietly stops sending traffic to any instance that stops responding - so one bad instance doesn't become one bad outage.

## Ephemeral vs. persistent

A cloud instance should be treated as **disposable** - auto-scaling can terminate it at any time, and a crashed instance might simply get replaced rather than repaired. Anything that needs to survive that (a database, uploaded files) belongs on persistent, separately-managed storage - never on the instance's own local disk.

## Try it

Every instance is still just a Linux machine you can inspect the normal way:

\`\`\`bash
ps aux
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'cloud-storage',
    slug: 'cloud-storage',
    title: 'Cloud Storage & Databases',
    description: 'Object storage, block storage, and managed databases - and when to reach for each.',
    difficulty: 'intermediate',
    track: 'cloud',
    order: 34,
    trackCommand: 'df -h',
    challenge: 'Check how much disk space is used and free on this machine, in human-readable units.',
    solution: 'df -h',
    content: `# Cloud Storage & Databases

Not all cloud storage is the same shape. Picking the wrong one is a common - and expensive to fix later - early mistake.

## Object storage

Think of **object storage** (the pattern popularized by Amazon S3) as a flat, practically-infinite bucket of files, each addressed by a key:

\`\`\`
bucket-name/path/to/file.jpg
\`\`\`

There's no real filesystem underneath - no directories you can \`cd\` into - just keys and the bytes behind them, served over HTTP. It's built for durability (your data is replicated across multiple drives and facilities automatically) and for serving large volumes of static files - images, backups, logs, data lake exports.

## Block storage

**Block storage** behaves like a regular hard drive attached to a VM - you format it, mount it, and read/write files on it the normal Linux way. It's what backs a VM's root disk, and what you'd attach for a database that needs real, low-latency filesystem semantics - something object storage was never designed to provide.

## Managed databases

Running your own database means you own the backups, the patching, the replication, the 3 AM page when disk fills up. A **managed database** service hands all of that operational weight to the provider - you get an endpoint to connect to, and they handle the rest.

The trade-off is control: you give up some low-level tuning in exchange for far less to operate. For most teams, that trade is an easy yes.

## Picking the right one

| Need | Reach for |
| ---- | --------- |
| Millions of files, served over HTTP | Object storage |
| A disk for a VM or self-run database | Block storage |
| A relational or document database, with someone else on call for it | Managed database |

## Try it

\`\`\`bash
df -h
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'cloud-iam',
    slug: 'cloud-iam',
    title: 'IAM & Cloud Security Basics',
    description: 'Users, roles, and policies - applying least privilege to who (and what) can touch your cloud resources.',
    difficulty: 'advanced',
    track: 'cloud',
    order: 35,
    trackCommand: 'chmod 600 cloud-credentials.json',
    challenge: "Lock down `cloud-credentials.json` so only its owner can read or write it - exactly the permissions real cloud credential files need.",
    solution: 'chmod 600 cloud-credentials.json',
    content: `# IAM & Cloud Security Basics

**IAM** (Identity and Access Management) is how a cloud provider answers one question, for every single request: *who is this, and are they allowed to do that?*

## Users, roles, and policies

- A **user** is a person or application with its own long-lived credentials.
- A **role** is a set of permissions that something can *assume* temporarily - no permanent credentials required.
- A **policy** is the actual document spelling out what's allowed: which actions, on which resources.

A policy might read, in plain English: "allow reading objects from the \`app-uploads\` bucket, and nothing else." Attach that policy to a role, and anything that assumes the role can read that bucket - and only that bucket.

## Least privilege

The **principle of least privilege**: grant exactly the access something needs to do its job, and not one permission more. A deploy script that only ever reads from one storage bucket should never hold permissions to delete databases - not because it's expected to misuse them, but because a leaked credential or a bug can only do as much damage as the permissions it has.

## Roles over long-lived keys

A long-lived access key, sitting in a config file or an environment variable, is a standing risk - if it leaks, it works until someone notices and revokes it. An **instance role** or **service account** instead grants temporary, auto-rotating credentials to a specific VM or service - nothing permanent to leak in the first place, because nothing permanent exists.

## MFA

Multi-factor authentication adds a second proof of identity beyond a password - a code from a phone, a hardware key. For any account with meaningful permissions, it should be considered mandatory, not optional: a leaked password alone should never be enough to get in.

## Try it

Credential files need the same discipline on disk that IAM aims for in the cloud - readable by nobody except their owner:

\`\`\`bash
chmod 600 cloud-credentials.json
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'cloud-networking',
    slug: 'cloud-networking',
    title: 'Cloud Networking',
    description: 'VPCs, subnets, and security groups - the virtual network every cloud resource lives inside.',
    difficulty: 'expert',
    track: 'cloud',
    order: 36,
    trackCommand: 'ufw status',
    challenge: "A security group is just a firewall in disguise - check whether this host's firewall is currently active.",
    solution: 'ufw status',
    content: `# Cloud Networking

Every cloud resource lives inside a private, software-defined network that you design yourself - nothing is just floating on the open internet by default.

## VPCs and subnets

A **VPC** (Virtual Private Cloud) is your own isolated slice of the provider's network - your own private IP address range, that nothing outside it can see into uninvited.

Inside a VPC, you carve out **subnets** - smaller ranges, usually split by purpose and availability zone:

\`\`\`
VPC: 10.0.0.0/16
  ├── public subnet:  10.0.1.0/24   (load balancers, bastion hosts)
  └── private subnet: 10.0.2.0/24   (app servers, databases)
\`\`\`

## Public vs. private subnets

The difference isn't the IP range - it's the routing:

- A **public subnet** has a route to an internet gateway, so its resources can be reached from (and reach) the internet directly.
- A **private subnet** has no such route - nothing outside the VPC can initiate a connection to it.

The standard shape: put only what truly needs to face the internet (load balancers) in public subnets, and keep everything else - app servers, databases - private.

## NAT gateways

A private subnet's instances still often need **outbound** access - to pull a package update, call an external API. A **NAT gateway**, sitting in a public subnet, lets private instances reach *out* to the internet while still blocking anything from initiating a connection *in*. One-way glass.

## Security groups

A **security group** is a stateful firewall attached directly to an instance (not the subnet) - it's the cloud-native equivalent of a tool like \`ufw\` running locally: a list of allowed ports and source addresses, everything else implicitly denied.

## Try it

\`\`\`bash
ufw status
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },

  // ─────────────────────── Observability & monitoring ───────────────────────
  {
    id: 'observability-fundamentals',
    slug: 'observability-fundamentals',
    title: 'Observability Fundamentals',
    description: "Logs, metrics, and traces - the three pillars that let you understand a system you didn't build yourself.",
    difficulty: 'beginner',
    track: 'observability',
    order: 45,
    trackCommand: 'uptime',
    challenge: 'Check how long this machine has been running and its current load average.',
    solution: 'uptime',
    content: `# Observability Fundamentals

**Monitoring** tells you *that* something is wrong - a dashboard goes red, an alert fires. **Observability** is the deeper property that lets you figure out *why*, even for a question nobody thought to ask in advance.

## The three pillars

| Pillar | What it captures | Good for |
| ------ | ------------------ | -------- |
| **Logs** | Discrete, timestamped events ("user 42 logged in") | The detailed story of exactly what happened |
| **Metrics** | Numbers over time (CPU %, requests/sec) | Spotting trends, triggering alerts |
| **Traces** | The path one request takes across services | Finding *where* in a chain of calls time went |

No single pillar tells the whole story alone - a metric tells you requests got slow at 2:14 PM, a trace tells you which downstream service in the chain was the slow one, and a log tells you the exact error it hit.

## Can you answer a question you didn't anticipate?

That's the real test of observability. A system with only a handful of pre-built dashboards can answer the questions its author thought of in advance. A genuinely observable system lets you ask something brand new - "which customers hit this rare error path last Tuesday?" - and actually get an answer, because the underlying data was captured richly enough to slice in ways nobody planned for ahead of time.

## Where to start

You don't need all three pillars perfectly wired up on day one. A sensible order:

1. **Logs** first - cheapest to get started with, and the most detail per event.
2. **Metrics** next - for trends and alerting on sustained problems.
3. **Traces** once you have more than a couple of services calling each other.

## Try it

A single number already tells you something about a system's health:

\`\`\`bash
uptime
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'observability-logs',
    slug: 'observability-logs',
    title: 'Working with Logs',
    description: 'Structured logging, log levels, and centralizing logs with journald and friends.',
    difficulty: 'intermediate',
    track: 'observability',
    order: 46,
    trackCommand: 'journalctl -u nginx -n 20',
    challenge: 'Show the last 20 log lines for the `nginx` unit using journalctl.',
    solution: 'journalctl -u nginx -n 20',
    content: `# Working with Logs

A log line is the smallest useful unit of observability: a timestamp, and what happened at that moment.

## Log levels

Almost every logging library supports the same rough hierarchy, from least to most severe:

\`\`\`
DEBUG  → INFO  → WARN  → ERROR → FATAL
\`\`\`

In production, \`DEBUG\` is usually turned off entirely (too much noise, too much cost to store), \`INFO\` records normal operation worth keeping, and \`WARN\`/\`ERROR\` are what actually deserve a human's attention.

## Structured logging

Compare these two lines:

\`\`\`
User 42 logged in from 10.0.0.5 at 2026-01-04T10:02:00Z

{"event":"login","user_id":42,"ip":"10.0.0.5","ts":"2026-01-04T10:02:00Z"}
\`\`\`

The second is **structured** (JSON): a machine can filter "every login from this IP" without fragile text parsing. Structured logging is slightly more ceremony to produce, but it's what makes centralized log search actually fast and reliable at any real scale.

## Centralizing logs

A single server's logs are easy - just read the file. A hundred servers, each with their own local logs, is a different problem: you need every log shipped somewhere **centralized**, so "show me every error across the whole fleet in the last hour" is one query instead of a hundred SSH sessions.

Common stacks: the **ELK** stack (Elasticsearch, Logstash, Kibana) and **Grafana Loki** are two of the most widely used.

## journald - the local starting point

On any systemd-based Linux host, \`journalctl\` is already capturing logs for every service, with no setup required - the natural first stop before anything gets shipped off to a centralized system:

\`\`\`bash
journalctl -u nginx -n 20   # last 20 lines for the nginx unit
journalctl -u nginx -f      # follow new lines live
\`\`\`

## Try it

\`\`\`bash
journalctl -u nginx -n 20
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'observability-metrics',
    slug: 'observability-metrics',
    title: 'Metrics & Dashboards',
    description: 'The handful of metrics that matter, and why Prometheus scrapes instead of waiting to be told.',
    difficulty: 'intermediate',
    track: 'observability',
    order: 47,
    trackCommand: 'free -h',
    challenge: 'Check how much memory is free versus in use, in human-readable units - a metric worth graphing over time.',
    solution: 'free -h',
    content: `# Metrics & Dashboards

A **metric** is a number, sampled repeatedly over time - CPU percent, requests per second, queue depth. Graph enough of the right ones, and a system's health becomes visible at a glance instead of something you have to go dig for.

## Three shapes of metric

- **Counter** - only ever goes up (total requests served since start). Useful as a *rate* - "requests per second" is really "how fast is this counter climbing."
- **Gauge** - goes up and down freely (current memory usage, current queue length).
- **Histogram** - buckets of values, usually for latency ("how many requests finished in under 100ms? Under 500ms?").

## Pull vs. push

Two philosophies for getting a metric from an application into a monitoring system:

- **Push** - the application sends its metrics to a central collector on its own schedule.
- **Pull** (the model **Prometheus** popularized) - the monitoring system reaches out and *scrapes* a known HTTP endpoint on each application, on its own schedule.

Pull has a quietly useful property: if a scrape ever fails, the monitoring system knows immediately that something is wrong with that target - with push, a server going silent from a crash looks identical to a server with simply nothing new to report.

## What to actually graph

For almost any service, four numbers go a very long way - sometimes called the **RED method**:

- **R**ate - requests per second.
- **E**rrors - how many of those are failing.
- **D**uration - how long they take.

For the underlying machine itself, the **USE method** (from the earlier Linux performance lesson) covers the rest: Utilization, Saturation, Errors, for CPU/memory/disk/network.

## Dashboards

**Grafana** is the most common layer sitting on top of a metrics store like Prometheus - turning raw numbers into the graphs a human actually scans during an incident.

## Try it

\`\`\`bash
free -h
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'observability-alerting',
    slug: 'observability-alerting',
    title: "Alerting That Doesn't Cry Wolf",
    description: "Thresholds, alert fatigue, and the difference between something worth paging a human for and something that can wait.",
    difficulty: 'advanced',
    track: 'observability',
    order: 48,
    trackCommand: 'ps aux | grep java',
    challenge: 'An alert just fired saying a Java process is eating memory - list every process and filter it down to the ones mentioning java.',
    solution: 'ps aux | grep java',
    content: `# Alerting That Doesn't Cry Wolf

Metrics and logs are only useful if someone - or something - actually looks at them. **Alerting** is what turns "the data shows a problem" into "a human was told about the problem."

## Symptom-based, not cause-based

The most durable alerting rule: **page on symptoms users would notice, not every possible internal cause.**

- Cause-based: "disk is at 85%." Maybe fine, maybe not - depends entirely on context.
- Symptom-based: "error rate is above 5% for 5 minutes" or "p99 latency exceeds 2 seconds." This is something a real user is feeling, right now.

A disk slowly filling isn't automatically an emergency. A spike in failed checkouts always is.

## Alert fatigue

If an on-call engineer gets paged every night for something that turns out to be fine, they learn - correctly, if irrationally - to tune out pages. The night it's real, that instinct costs you. Every alert that fires and *isn't* actionable is a small withdrawal from a trust account that's expensive to refill.

The fix isn't fewer metrics - it's fewer **pages**. Keep collecting everything; only page on what's both severe and something a human can actually do something about right now.

## Severity tiers

Not everything deserves the same response:

| Tier | Response |
| ---- | -------- |
| **Critical** | Page someone immediately, any time of day |
| **Warning** | Visible on a dashboard, reviewed during business hours |
| **Info** | Logged, no notification at all |

## Runbooks

A good alert links straight to a **runbook** - a short, specific document: "when this fires, check X, then Y; if that doesn't fix it, escalate to Z." The goal is for the *first* responder, possibly half-asleep at 3 AM, to have a clear next step instead of starting from zero.

## Try it

\`\`\`bash
ps aux | grep java
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'observability-tracing',
    slug: 'observability-tracing',
    title: 'Distributed Tracing',
    description: 'Following one request across a dozen microservices with trace IDs and spans.',
    difficulty: 'expert',
    track: 'observability',
    order: 49,
    trackCommand: 'curl -I https://api.internal/checkout',
    challenge: "Probe the checkout service's headers with a HEAD request - in a real system, this response would carry the trace ID tying every downstream span together.",
    solution: 'curl -I https://api.internal/checkout',
    content: `# Distributed Tracing

A single user request to "place an order" might touch a dozen separate services - auth, inventory, payments, notifications - each with its own logs and metrics. When that request is slow, logs and metrics alone can tell you *a* service was slow. **Tracing** tells you *which one, in this specific request*.

## Traces and spans

A **trace** represents one request's entire journey. It's made up of **spans** - one per unit of work, each with a start time, duration, and a parent:

\`\`\`
Trace: place-order (420ms total)
├── span: auth-check        (10ms)
├── span: inventory-check   (30ms)
├── span: payment-charge    (350ms)  ← the slow one
└── span: send-confirmation (15ms)
\`\`\`

Laid out like this, the slow span is obvious at a glance - something logs scattered across four different services would never show you nearly as directly.

## Propagating the trace ID

The mechanism that stitches all those spans back into one trace: every service, when it calls the next one downstream, passes along a **trace ID** in the request headers. Every span generated anywhere in that call chain gets tagged with the same ID, so a tracing backend can later reassemble the full picture from spans that were emitted by entirely separate services.

## Why logs and metrics alone fall short here

- A **metric** tells you "payment-charge's p99 latency went up." It can't tell you if *this specific* slow request also happened to hit a slow inventory check.
- A **log** from the payment service tells you about the payment service. It has no idea what happened in auth or inventory for that same request.
- A **trace** ties all of it to one request ID, across every service it touched.

## Tools

**OpenTelemetry** has become the standard way applications emit trace data; **Jaeger** and **Zipkin** are two of the most common backends for storing and visualizing it.

## Try it

\`\`\`bash
curl -I https://api.internal/checkout
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },

  // ─────────────────────── Containers & Kubernetes ───────────────────────
  {
    id: 'docker-deep-dive',
    slug: 'docker-deep-dive',
    title: 'Docker Deep Dive',
    description: 'Images versus containers, layers, and what actually happens when you run `docker run`.',
    difficulty: 'intermediate',
    track: 'containers',
    order: 50,
    trackCommand: 'docker run -d --name web nginx',
    challenge: 'Start an nginx container in the background, named `web`.',
    solution: 'docker run -d --name web nginx',
    content: `# Docker Deep Dive

An **image** is a read-only template - application code, a runtime, and every dependency, frozen in place. A **container** is a running instance of that image. The relationship is the same as a class and an object: one image, as many running containers from it as you like.

## Layers

A Docker image is built from stacked, cacheable **layers** - each instruction in a \`Dockerfile\` produces one:

\`\`\`dockerfile
FROM node:20-alpine        # base layer
COPY package.json .        # a layer
RUN npm install            # a layer
COPY . .                   # a layer
CMD ["node", "server.js"]  # metadata, not a layer
\`\`\`

If only your application code changes, Docker reuses the cached \`npm install\` layer from before instead of redoing it - which is exactly why \`COPY package.json\` and \`npm install\` are deliberately placed *before* copying the rest of the source: dependencies change far less often than application code, so that expensive layer gets reused far more often too.

## Reading a Dockerfile

- \`FROM\` - the base image to build on top of.
- \`RUN\` - executes a command *while building* the image (installing packages, compiling).
- \`COPY\` - copies files from your machine into the image.
- \`CMD\` - the command that runs when a container *starts* from this image.

## What \`docker run\` actually does

\`\`\`bash
docker run -d --name web nginx
\`\`\`

Pulls the \`nginx\` image if it isn't already local, creates a new container from it, names it \`web\`, and (\`-d\`) runs it detached - in the background, handing you your prompt straight back instead of attaching to its output.

## Try it

\`\`\`bash
docker run -d --name web nginx
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'docker-compose-basics',
    slug: 'docker-compose-basics',
    title: 'Docker Compose',
    description: 'Describing a multi-container app - web server, app, and database - in one YAML file.',
    difficulty: 'intermediate',
    track: 'containers',
    order: 51,
    trackCommand: 'touch docker-compose.yml',
    challenge: 'Create an empty `docker-compose.yml` - the file where a multi-container app gets described in one place.',
    solution: 'touch docker-compose.yml',
    content: `# Docker Compose

Almost nothing real is just one container. A typical app is a web server, an application process, and a database, all talking to each other. **Docker Compose** lets you describe all of them, and how they connect, in a single YAML file.

## Anatomy of a compose file

\`\`\`yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"
  app:
    build: .
    depends_on:
      - db
  db:
    image: postgres
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

- **services** - one entry per container: which image to run (or build), ports to expose, what it depends on.
- **depends_on** - start order; \`app\` won't start until \`db\` has.
- **volumes** - named, persistent storage that survives a container being recreated - essential for a database, which should never lose its data just because its container got rebuilt.

## One command instead of many

Without Compose, standing up that same three-container app means three separate \`docker run\` commands, each with the right flags, in the right order, every single time. With a compose file written once:

\`\`\`bash
docker compose up -d     # start everything
docker compose down      # stop and remove everything
docker compose logs -f   # follow logs from every service at once
\`\`\`

## Why this matters for local development

Compose is most commonly reached for to spin up an entire application stack - with its database, cache, and message queue - on a single laptop, in one command, identically for every developer on the team. No more "works on my machine because I have Postgres 14 and you have 15."

## Try it

\`\`\`bash
touch docker-compose.yml
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'kubernetes-basics',
    slug: 'kubernetes-basics',
    title: 'Kubernetes Basics',
    description: 'Pods, Deployments, and Services - how Kubernetes keeps containers running at scale.',
    difficulty: 'advanced',
    track: 'containers',
    order: 52,
    trackCommand: 'docker ps',
    challenge: "A Kubernetes node is, underneath, just running containers - list every currently-running container on this host.",
    solution: 'docker ps',
    content: `# Kubernetes Basics

Docker Compose is great for one machine. **Kubernetes** (often "k8s") solves the much harder problem: running containers reliably across a whole *cluster* of machines, automatically replacing them when they fail.

## Pods

The smallest unit Kubernetes schedules is a **Pod** - one or more containers that always run together, on the same machine, sharing the same network address. Almost always, that's exactly one container per Pod.

## Deployments

You don't create Pods directly in practice - you create a **Deployment**, and tell it how many copies (**replicas**) of a Pod you want running:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: web
          image: nginx:1.25
\`\`\`

If a Pod crashes, or the machine it's on dies, the Deployment notices and starts a replacement - without anyone paging a human in the middle of the night to do it by hand. Change \`replicas: 3\` to \`replicas: 10\` and apply it again, and Kubernetes starts seven more, on whichever machines in the cluster have room.

## Services

Pods come and go, and each one gets a new IP address every time it's replaced - so nothing else in the cluster can reliably point *directly* at one. A **Service** gives a stable name and address that always routes to whichever Pods are currently healthy, no matter how many times they've been replaced underneath it.

## Rolling updates

Pushing \`nginx:1.26\` over the top of \`nginx:1.25\`, a Deployment replaces Pods a few at a time by default - never all at once - so there's no moment where zero healthy Pods are serving traffic.

## Try it

Everything above ultimately runs as ordinary containers on an ordinary Linux node:

\`\`\`bash
docker ps
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'kubernetes-networking',
    slug: 'kubernetes-networking',
    title: 'Kubernetes Networking & Scaling',
    description: 'ClusterIP, Ingress, and the Horizontal Pod Autoscaler - how traffic finds pods, and how pods multiply under load.',
    difficulty: 'advanced',
    track: 'containers',
    order: 53,
    trackCommand: 'netstat -tulpn',
    challenge: "List every listening network port on this host - exactly what you'd check if a Service wasn't reaching its pods.",
    solution: 'netstat -tulpn',
    content: `# Kubernetes Networking & Scaling

Getting traffic to the right Pods, and making sure there are enough of them, is most of what running Kubernetes in production actually feels like day to day.

## Service types

A Service's \`type\` decides how it's reachable:

| Type | Reachable from |
| ---- | ---------------- |
| \`ClusterIP\` (default) | Only inside the cluster |
| \`NodePort\` | Any cluster node's IP, on a fixed port |
| \`LoadBalancer\` | The internet, via a cloud provider's load balancer |

Most internal services (a database, an internal API another service calls) stay \`ClusterIP\` - no reason to expose them any wider than that.

## Ingress

Giving every public-facing service its own cloud load balancer gets expensive and repetitive fast. An **Ingress** is a single entry point that routes HTTP traffic to many different internal Services, based on hostname or URL path:

\`\`\`
example.com/api      → api-service
example.com/app      → frontend-service
blog.example.com     → blog-service
\`\`\`

One load balancer, one place to manage TLS certificates, routing rules that live in your cluster's config as code.

## Horizontal Pod Autoscaler (HPA)

Rather than someone watching a dashboard and manually running \`kubectl scale\`, an **HPA** does it automatically, based on a metric - CPU usage being the default:

\`\`\`
target: 70% average CPU
min replicas: 2
max replicas: 10
\`\`\`

Traffic spikes, average CPU climbs past 70%, the HPA adds Pods. Traffic drops back off, and it scales back down - the exact same elastic-scaling idea from the cloud-compute lesson, just applied one layer up, at the Pod level instead of the VM level.

## Try it

\`\`\`bash
netstat -tulpn
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'container-registries',
    slug: 'container-registries',
    title: 'Container Registries & Shipping Images',
    description: 'Tagging, pushing, and pulling images - the glue between your CI pipeline and a running cluster.',
    difficulty: 'expert',
    track: 'containers',
    order: 54,
    trackCommand: 'docker images',
    challenge: 'List every image available locally, ready to be tagged and pushed to a registry.',
    solution: 'docker images',
    content: `# Container Registries & Shipping Images

A **registry** is where built images live between being built and being run - Docker Hub, Amazon ECR, Google Artifact Registry, and plenty of self-hosted options all do the same essential job.

## The full loop, start to finish

This lesson is the capstone that ties the whole track together - CI/CD, cloud, and containers all meet right here:

\`\`\`
1. Jenkins (or any CI) builds the image from your Dockerfile
2. CI tags it and pushes it to a registry
3. A Kubernetes cluster (running in the cloud) pulls that exact image
4. A Deployment rolls it out across the cluster
\`\`\`

Nothing in steps 3-4 rebuilds anything - the cluster runs the *literal* image CI already built and tested, the same "build once, promote everywhere" principle from the Jenkins deploy lesson.

## Tagging conventions

A tag is just a label on an image - \`myapp:1.4.2\`, \`myapp:latest\`. A few conventions that matter in practice:

- **Semantic version tags** (\`1.4.2\`) - clear, human-readable, easy to roll back to by name.
- **Git SHA tags** (\`myapp:a3f9c21\`) - ties an image to the *exact* commit it was built from, no ambiguity.
- \`:latest\` - deceptively named; it just means "whatever was pushed most recently without an explicit tag," not "the newest stable release." Relying on it in production is a common source of "which version is actually running right now?" confusion.

## Pushing and pulling

\`\`\`bash
docker tag myapp:a3f9c21 registry.example.com/myapp:a3f9c21
docker push registry.example.com/myapp:a3f9c21
docker pull registry.example.com/myapp:a3f9c21
\`\`\`

A push uploads any layers the registry doesn't already have (the same layer-caching idea from the Docker deep-dive lesson applies here too - most pushes only upload the one or two layers that actually changed).

## Try it

\`\`\`bash
docker images
\`\`\`

When you're ready, hit **Mark complete**. You've completed the DevOps track!
`,
  },

  // ─────────────────────── Git & Version Control ───────────────────────
  {
    id: 'git-fundamentals',
    slug: 'git-fundamentals',
    title: 'Git Fundamentals',
    description: 'What version control actually is, and the three places git keeps track of your files.',
    difficulty: 'beginner',
    track: 'git',
    order: 55,
    trackCommand: 'git init',
    challenge: 'Initialize a new git repository in the current directory.',
    solution: 'git init',
    content: `# Git Fundamentals

**Version control** is a system for recording changes to a set of files over time, so you can review what changed, revert a mistake, and work alongside other people without overwriting each other's work. **git** is, by a huge margin, the version control system the industry standardized on.

## Three places, one file

At any moment, a file you're tracking with git exists in up to three places:

| Area | What it holds |
| ---- | -------------- |
| **Working directory** | The files as they currently sit on disk - whatever you're editing right now. |
| **Staging area** (the "index") | Changes you've marked as ready for the *next* commit, via \`git add\`. |
| **Repository** | The permanent history - every commit you've ever made, via \`git commit\`. |

Nothing becomes permanent until it's committed, and nothing gets committed until it's staged first. That two-step "stage, then commit" process is deliberate: it lets you build one coherent commit out of several edits, instead of every single save becoming its own entry in the history.

## Starting a repository

\`\`\`bash
git init
\`\`\`

This creates a hidden \`.git\` directory in the current folder - that's the entire repository, holding every commit, branch, and bit of history git will ever track here. Delete \`.git\` and, as far as git is concerned, the history never existed.

## Checking where you stand

\`\`\`bash
git status
\`\`\`

This is the single most-run git command there is. It reports, in plain English, what's changed in your working directory, what's staged and ready to commit, and what git isn't tracking at all yet.

## Try it

\`\`\`bash
git init
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'git-staging-commits',
    slug: 'git-staging-commits',
    title: 'Staging & Committing',
    description: 'Moving changes from your working directory into a permanent, named snapshot.',
    difficulty: 'beginner',
    track: 'git',
    order: 56,
    trackCommand: 'git add notes.txt',
    challenge: 'Stage the file `notes.txt`, ready to be committed.',
    solution: 'git add notes.txt',
    content: `# Staging & Committing

With files tracked in a repository, the next skill is turning edits into a real, permanent entry in the history.

## Staging: picking what goes in this commit

\`\`\`bash
git add notes.txt        # stage one specific file
git add .                 # stage everything that's changed
\`\`\`

Think of the staging area as a loading dock: you place exactly the boxes (files, or even parts of files) you want on this particular truck (commit), and leave the rest for later. That's genuinely useful - it lets you commit "fix the login bug" and "update the README" as two separate, clean commits, even if you happened to edit both files in the same sitting.

## Committing: making it permanent

\`\`\`bash
git commit -m "Fix login redirect on expired sessions"
\`\`\`

The \`-m\` flag supplies the commit message inline. A good commit message is written in the **imperative mood** - "Fix the bug," not "Fixed the bug" or "Fixes the bug" - as if finishing the sentence "If applied, this commit will...". It's a small convention, but it keeps a project's history reading like a coherent list of actions rather than a diary.

## Viewing the history

\`\`\`bash
git log
\`\`\`

Every commit shows its unique ID, author, date, and message - a permanent, append-only record of every change anyone has made, in order.

## Try it

\`\`\`bash
git add notes.txt
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'git-branching',
    slug: 'git-branching',
    title: 'Branching',
    description: "Working on something new without touching the code everyone else depends on.",
    difficulty: 'intermediate',
    track: 'git',
    order: 57,
    trackCommand: 'git checkout -b feature/login',
    challenge: 'Create a new branch called `feature/login` and switch to it, in a single command.',
    solution: 'git checkout -b feature/login',
    content: `# Branching

A **branch** is nothing more than a movable pointer to a commit. That simplicity is exactly what makes branching in git fast and cheap, and why it's the foundation almost every git workflow is built on.

## HEAD: where you are right now

Git tracks a special pointer called **HEAD**, which points at whichever branch (and therefore commit) you currently have checked out. When you make a new commit, HEAD - and the branch it points to - both move forward to it.

## Why branch at all?

Editing \`main\` directly means every half-finished change is visible to, and can break things for, everyone else working from it. A branch gives you an isolated line of development:

\`\`\`
main:              A---B---C
                        \\
feature/login:           D---E
\`\`\`

Commits \`D\` and \`E\` exist only on \`feature/login\` until that branch is merged back - \`main\` stays exactly as it was at commit \`C\` the whole time.

## Creating and switching branches

\`\`\`bash
git branch feature/login       # create a branch (stays on the current one)
git checkout feature/login     # switch to it

# or do both in one step:
git checkout -b feature/login
\`\`\`

## Listing branches

\`\`\`bash
git branch
\`\`\`

Lists every branch in the repository, with an asterisk marking whichever one you currently have checked out.

## Try it

\`\`\`bash
git checkout -b feature/login
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'git-merging-rebasing',
    slug: 'git-merging-rebasing',
    title: 'Merging & Rebasing',
    description: "Two ways to bring a branch's changes back together, and why history ends up looking different.",
    difficulty: 'advanced',
    track: 'git',
    order: 58,
    trackCommand: 'git branch',
    challenge: 'List every branch in the repository, with the one you are currently on marked.',
    solution: 'git branch',
    content: `# Merging & Rebasing

Once a branch is ready, its changes need to make it back into \`main\`. Git gives you two genuinely different ways to do that.

## Merging

A **merge** brings two branches' histories together, usually creating a new **merge commit** with two parents:

\`\`\`
main:              A---B---C-------F  (merge commit)
                        \\         /
feature/login:           D---E---
\`\`\`

Nothing about the existing commits changes - a merge is purely additive. The trade-off: a long-lived project accumulates a lot of these merge commits, and the history graph can get tangled.

## Fast-forward merges

If \`main\` hasn't moved at all since \`feature/login\` branched off it, there's nothing to "merge" - git just slides the \`main\` pointer forward to the tip of \`feature/login\`. No merge commit is created at all; this is called a **fast-forward**.

## Rebasing

A **rebase** takes your branch's commits and replays them, one by one, on top of the latest \`main\` - rewriting their underlying commit hashes in the process:

\`\`\`
before:  main: A---B---C          feature: A---B---D---E
after rebase:  main: A---B---C    feature:         A---B---C---D'---E'
\`\`\`

The payoff is a clean, linear history with no merge commits at all. The cost: because it rewrites history, you should **never rebase a branch other people have already pulled** - their copy and the rewritten copy will have permanently diverged.

## Conflicts

Either approach can hit a **merge conflict**: the same lines of the same file were changed differently on both sides, and git can't guess which version you want. Git pauses and asks you to resolve it by hand before continuing - the one moment in all of this that genuinely needs a human decision.

## Try it

\`\`\`bash
git branch
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'git-workflows-gitops',
    slug: 'git-workflows-gitops',
    title: 'Git Workflows & GitOps',
    description: 'Trunk-based development, pull requests, and using git itself as the source of truth for what should be running.',
    difficulty: 'expert',
    track: 'git',
    order: 59,
    trackCommand: 'git log --oneline --graph --decorate --all',
    challenge: 'Show a compact, one-line-per-commit graph of every branch in the repository.',
    solution: 'git log --oneline --graph --decorate --all',
    content: `# Git Workflows & GitOps

Branches and commits are the mechanics. A **workflow** is the team-wide agreement on how those mechanics actually get used day to day.

## Trunk-based development vs. Git Flow

- **Trunk-based development** - everyone branches off \`main\` for a short-lived feature branch (hours to a couple of days), merges back quickly, and \`main\` is always close to deployable. Favored by teams practicing continuous deployment.
- **Git Flow** - a heavier model with long-lived \`develop\`, \`release\`, and \`hotfix\` branches alongside \`main\`. More structure, more ceremony - a reasonable fit for software shipped in discrete, versioned releases rather than deployed continuously.

Most modern web teams lean toward trunk-based development specifically because it pairs well with the CI/CD pipelines from earlier in this track - the whole point of fast feedback is undercut if branches sit unmerged for weeks.

## Pull requests

A **pull request** (or "merge request") is the review gate before a branch merges: a diff, a place for teammates to comment line-by-line, and (usually) a requirement that CI passes before the merge button even unlocks. It's the social and quality-control layer git itself doesn't provide on its own.

## GitOps

**GitOps** takes this a step further for infrastructure and deployments: the *desired state* of a system - which image version should be running, how many replicas, which config - is described declaratively and committed to a git repository. An operator (often running inside the cluster itself) continuously compares that desired state against what's actually running, and reconciles any difference automatically.

The result: deploying is just a commit and a pull request, exactly like shipping a code change. Rolling back is \`git revert\`. And the git history itself becomes a complete, auditable record of every change ever made to production - tying directly back to the Kubernetes and CI/CD lessons earlier in this curriculum.

## Try it

\`\`\`bash
git log --oneline --graph --decorate --all
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },

  // ─────────────────────── Infrastructure as Code ───────────────────────
  {
    id: 'iac-fundamentals',
    slug: 'iac-fundamentals',
    title: 'What Is Infrastructure as Code',
    description: 'Describing servers, networks, and databases in version-controlled files instead of clicking through a console.',
    difficulty: 'beginner',
    track: 'iac',
    order: 60,
    trackCommand: 'touch main.tf',
    challenge: 'Create an empty file named `main.tf` - where Terraform configuration lives.',
    solution: 'touch main.tf',
    content: `# What Is Infrastructure as Code

**Infrastructure as Code (IaC)** means describing your servers, networks, and databases in files - checked into version control - rather than clicking buttons in a cloud provider's web console.

## The problem with clicking

Manually clicking through a console to create a server works fine, right up until:

- Nobody can tell you exactly what was configured, or why, six months later.
- Rebuilding the same environment for staging means remembering (or re-discovering) every single click.
- There's no diff, no review, and no record of who changed what.

Every one of those problems disappears once "how the infrastructure is configured" is a text file sitting in the same repository as the application code.

## Declarative, not imperative

Most IaC tools are **declarative**: you describe the end state you want ("there should be one web server, this size, in this region"), not the step-by-step commands to get there. The tool itself figures out what needs to change to reach that state - including doing nothing at all, if reality already matches.

## Idempotency

That leads to the single most important property an IaC tool needs: **idempotency**. Running the same configuration twice should produce the exact same result as running it once - never a second copy, never an error because "it already exists." You can safely re-run it after a crash, after a doubt, or just as routine maintenance, and trust it will only change what actually needs to change.

## Why it matters

- **Reviewable** - a proposed infrastructure change is a pull request diff, read and approved like any code change.
- **Repeatable** - standing up an identical staging environment is running the same files again, not re-deriving tribal knowledge.
- **Disaster recovery** - if a server vanishes, "rebuild it" means rerunning the config, not reconstructing a manual setup from memory.

## Try it

\`\`\`bash
touch main.tf
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'terraform-basics',
    slug: 'terraform-basics',
    title: 'Terraform Basics',
    description: 'Providers, resources, and the plan-then-apply workflow that makes infrastructure changes predictable.',
    difficulty: 'intermediate',
    track: 'iac',
    order: 61,
    trackCommand: 'cat main.tf',
    challenge: 'View the contents of `main.tf`.',
    solution: 'cat main.tf',
    content: `# Terraform Basics

**Terraform** is the most widely used tool for infrastructure as code, and works across every major cloud provider through the same core workflow and syntax.

## Providers and resources

A Terraform file (written in **HCL**, HashiCorp Configuration Language) names a **provider** - which platform it's talking to - and then declares **resources** on it:

\`\`\`hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0123456789"
  instance_type = "t3.micro"
}
\`\`\`

This says, in full: "talk to AWS's us-east-1 region, and there should exist one t3.micro instance running this AMI, which I'll refer to elsewhere in this config as \`aws_instance.web\`."

## The core workflow

\`\`\`bash
terraform init      # download the provider plugin, set up the working directory
terraform plan       # show exactly what would change - a dry run
terraform apply      # actually make those changes
terraform destroy    # tear everything this config created back down
\`\`\`

\`terraform plan\` is the step that makes this trustworthy: it prints precisely what will be created, changed, or destroyed, and nothing actually happens until \`apply\` is run and confirmed. No surprises between "what I expected" and "what happened."

## Reading a plan

Terraform marks every line of a plan with a symbol - \`+\` to create, \`-\` to destroy, \`~\` to update in place. A plan that shows an unexpected \`-\` (destroying something you didn't mean to touch) is exactly the kind of mistake this dry-run step exists to catch before it becomes real.

## Try it

\`\`\`bash
cat main.tf
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'terraform-state',
    slug: 'terraform-state',
    title: 'State Management',
    description: 'Why Terraform keeps a map of what it already built, and why that file deserves the same care as a credential.',
    difficulty: 'advanced',
    track: 'iac',
    order: 62,
    trackCommand: 'chmod 600 terraform.tfstate',
    challenge: 'Lock down `terraform.tfstate` so only its owner can read or write it - it often contains sensitive resource data in plain text.',
    solution: 'chmod 600 terraform.tfstate',
    content: `# State Management

Terraform's configuration describes what you *want*. Its **state file** records what it already *built* - and that distinction turns out to matter a lot.

## What state actually is

Every time \`terraform apply\` creates a resource, Terraform writes an entry into \`terraform.tfstate\` mapping your configuration's name for it (\`aws_instance.web\`) to the real resource ID the cloud provider assigned. On every future \`plan\`, Terraform reads that file to know what already exists, so it can compute an accurate diff instead of trying to recreate everything from scratch.

## Why it needs real care

- **It often contains secrets.** Resource attributes - a generated database password, a private key - can end up in state in plain text. It deserves the exact same handling as any other credential file.
- **Never hand-edit it.** The file's format isn't meant for manual editing, and small corruption here can make Terraform lose track of real infrastructure entirely, leading it to try to recreate resources that already exist.
- **Concurrent runs corrupt it.** If two people run \`apply\` at the same time against the same state, they can race and corrupt it.

## Remote state

For any team beyond a single person, state lives in a **remote backend** - commonly cloud object storage (like S3) paired with a locking mechanism (like a DynamoDB table) that prevents two \`apply\`s from running at once. Everyone's Terraform runs then read and write the same shared, locked copy, instead of each having their own out-of-sync local file.

## Drift

**Drift** is what happens when real infrastructure stops matching the state Terraform believes is true - usually because someone changed something by hand in the cloud console. The next \`terraform plan\` will show that difference clearly, which is exactly why teams that take IaC seriously treat console changes as a last resort, not a habit.

## Try it

\`\`\`bash
chmod 600 terraform.tfstate
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'ansible-basics',
    slug: 'ansible-basics',
    title: 'Ansible Basics',
    description: 'Agentless configuration management: pushing the same setup over SSH to every server in your inventory.',
    difficulty: 'advanced',
    track: 'iac',
    order: 63,
    trackCommand: 'ssh user@web1',
    challenge: 'Connect over SSH to `web1` - the same way Ansible reaches every host in its inventory, just without installing anything on the other end first.',
    solution: 'ssh user@web1',
    content: `# Ansible Basics

Where Terraform's job is usually *provisioning* - creating the VM, the network, the database - **Ansible**'s job is typically *configuration*: once a server exists, making sure it has the right packages, files, and services running.

## Agentless, over SSH

Tools like Puppet or Chef require installing a permanent agent on every managed machine. Ansible doesn't - it connects over plain SSH (the same protocol you already know from earlier lessons), runs what it needs to, and leaves nothing permanently installed behind. One less piece of software to patch and secure on every server you manage.

## Inventory

An **inventory** file lists every host Ansible manages, usually grouped by role:

\`\`\`ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com
\`\`\`

A single command can then target "every webserver" or "every host" without naming each one individually.

## Playbooks

A **playbook** is a YAML file listing the tasks to run, in order:

\`\`\`yaml
- hosts: webservers
  tasks:
    - name: Ensure nginx is installed
      apt:
        name: nginx
        state: present
    - name: Ensure nginx is running
      service:
        name: nginx
        state: started
\`\`\`

## Idempotent tasks, not scripts

Notice the task reads "ensure nginx is installed," not "install nginx." Every built-in Ansible module is written to be idempotent: running this playbook against a server that already has nginx running changes nothing and reports "ok" rather than erroring or reinstalling. Run it against ten fresh servers and ten already-configured ones in the same batch, and every single one ends up in the exact same state.

## Try it

\`\`\`bash
ssh user@web1
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'iac-in-pipelines',
    slug: 'iac-in-pipelines',
    title: 'Infrastructure as Code in a Pipeline',
    description: 'Running `terraform plan` on every pull request, and catching drift before it catches you.',
    difficulty: 'expert',
    track: 'iac',
    order: 64,
    trackCommand: 'echo',
    challenge:
      "Write a crontab line into a file called `drift-check` that runs `/usr/local/bin/terraform-plan-check.sh` every night at 3:00 AM, using a single redirected `echo`.",
    solution: "echo '0 3 * * * /usr/local/bin/terraform-plan-check.sh' > drift-check",
    content: `# Infrastructure as Code in a Pipeline

This lesson is the capstone that ties the whole curriculum together: infrastructure changes reviewed and shipped exactly the way application code is, using the CI/CD machinery from earlier in this track.

## Plan on every pull request

A common, high-value pattern: every pull request that touches Terraform files automatically triggers a pipeline stage that runs \`terraform plan\` and posts the output as a comment on the PR itself. Reviewers see *exactly* what infrastructure will change - not just the HCL diff, but its real, computed effect - before approving anything.

\`\`\`groovy
stage('Terraform Plan') {
  steps {
    sh 'terraform plan -out=tfplan'
  }
}
\`\`\`

## Apply only after merge

\`terraform apply\` runs separately, triggered only once that reviewed, approved plan merges to the main branch - the exact same "build once, promote everywhere" discipline from the Jenkins deploy lesson, just applied to infrastructure instead of application artifacts. Nobody applies a plan that wasn't the one actually reviewed.

## Catching drift on a schedule

Code review catches changes made *through* the pipeline. It can't catch someone changing something by hand in the cloud console at 2 AM. A separate, scheduled job - a nightly \`terraform plan\` with no corresponding apply - catches that: any unexpected diff in its output means something drifted outside the pipeline's view, and it's worth paging someone to go find out why.

## Try it

Real cron handles the "nightly" part, the same way it did for the scheduled Jenkins builds earlier in this curriculum:

\`\`\`bash
echo '0 3 * * * /usr/local/bin/terraform-plan-check.sh' > drift-check
\`\`\`

When you're ready, hit **Mark complete**. You've completed the Infrastructure as Code track!
`,
  },

  // ─────────────────────── Security & DevSecOps ───────────────────────
  {
    id: 'security-fundamentals',
    slug: 'security-fundamentals',
    title: 'Security Fundamentals',
    description: 'The CIA triad, attack surface, and defense in depth — the handful of ideas every other security lesson builds on.',
    difficulty: 'beginner',
    track: 'security',
    order: 65,
    trackCommand: 'chmod 600 id_rsa',
    challenge: 'Lock down your SSH private key `id_rsa` so only you can read or write it.',
    solution: 'chmod 600 id_rsa',
    content: `# Security Fundamentals

Security isn't one skill - it's a handful of recurring ideas, applied over and over to every system you touch. This lesson covers the three that come up constantly for the rest of this track.

## The CIA triad

- **Confidentiality** - only the people (and services) who should see data can see it.
- **Integrity** - data can't be silently changed by someone who shouldn't be able to change it.
- **Availability** - the system is actually up and usable when legitimate users need it.

Every security control you'll ever reach for exists to protect one of these three. A firewall rule protects confidentiality and integrity by blocking unauthorized access; a backup protects availability by surviving a disaster.

## Attack surface

Your **attack surface** is everything an attacker could possibly target: every open port, every exposed API endpoint, every dependency, every person with access. Reducing it is almost always cheaper and more effective than defending every inch of a sprawling surface - a port that isn't open at all can't be exploited, full stop.

## Defense in depth

No single control is perfect, so security is built in **layers**: a firewall, *and* authentication, *and* least-privilege permissions, *and* encrypted data at rest. If an attacker gets past one layer, the next one is still there. This is exactly why the earlier IAM lesson's "least privilege" principle matters so much - it's one layer in a stack, not the whole stack.

## Try it

Private keys are a perfect example of all three ideas at once - lock one down, and you're protecting confidentiality (nobody else can use it), integrity (nobody can swap it), and ultimately availability (you still have working access):

\`\`\`bash
chmod 600 id_rsa
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'secrets-management',
    slug: 'secrets-management',
    title: 'Secrets Management',
    description: "Why passwords and API keys don't belong in code, and where they should live instead.",
    difficulty: 'intermediate',
    track: 'security',
    order: 66,
    trackCommand: 'cat .gitignore',
    challenge: 'Check whether `.env` is already excluded from version control.',
    solution: 'cat .gitignore',
    content: `# Secrets Management

A **secret** is anything that grants access if it leaks: a database password, an API key, a signing key. How a team handles them says a lot about how seriously they take security in general.

## Why secrets in code are a permanent leak

Committing a secret to git doesn't just expose it today - it's in the **history** forever, even after you delete it in a later commit, unless you rewrite history entirely (which is its own disruptive operation). Anyone who ever clones the repository, or had access at any point, has that secret. The only real fix once a secret is committed is to treat it as compromised and rotate it.

## The minimum bar: .gitignore

\`\`\`
.env
*.pem
secrets.yaml
\`\`\`

Keeping real secrets in a local, untracked file (commonly \`.env\`), and listing that file in \`.gitignore\`, is the minimum - it stops the *accidental* commit. It's not a complete solution on its own: the file still sits in plain text on disk, readable by anything else running on that machine.

## The real fix: a secrets manager

Tools like **HashiCorp Vault**, or a cloud provider's native secrets service, go further:

- Secrets are stored encrypted, not in plain text anywhere.
- Access is logged - you can see exactly what read a given secret, and when.
- Secrets can be fetched at runtime instead of baked into a config file at all.

## Rotation

Even a well-managed secret should be **rotated** periodically - replaced with a new value on a schedule, or immediately if there's any suspicion it leaked. A secret that's valid forever is a single point of failure that never expires; rotation puts a ceiling on how long a leaked credential actually stays useful to whoever has it.

## Try it

\`\`\`bash
cat .gitignore
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'shift-left-security',
    slug: 'shift-left-security',
    title: 'Shift-Left Security',
    description: 'Catching vulnerabilities while a pull request is still open, instead of after it ships.',
    difficulty: 'intermediate',
    track: 'security',
    order: 67,
    trackCommand: 'docker images',
    challenge: 'List every image available locally - exactly what a container vulnerability scanner would work through.',
    solution: 'docker images',
    content: `# Shift-Left Security

"Shift left" means moving a concern earlier in the timeline - toward the "left" end of a plan-build-test-release diagram. Applied to security, it means catching problems while code is still in review, not after it's already running in production.

## Why earlier is cheaper

A vulnerability found in code review costs a few minutes to fix. The same vulnerability found by a customer, or an attacker, after release costs an incident, a scramble, and often a public disclosure. The cost of the exact same bug grows by orders of magnitude the later it's caught - the single biggest argument for building these checks straight into the pipeline from this curriculum's CI/CD lessons.

## SAST: static analysis

**Static Application Security Testing** scans your source code directly, without running it, looking for known-dangerous patterns - string-concatenated SQL queries, hardcoded secrets, unsafe deserialization. It runs in seconds as part of a pipeline stage, on every single commit.

## DAST: dynamic analysis

**Dynamic Application Security Testing** instead tests the *running* application from the outside - sending it malformed input, probing its actual HTTP responses - the way an external attacker actually would. It catches a different class of issue than SAST (real runtime behavior, not just suspicious-looking code).

## Dependency and image scanning

Modern software is mostly other people's code: third-party libraries, base container images. A **dependency scanner** checks every library your project pulls in against a database of known vulnerabilities; an **image scanner** does the same for a built container image's full set of installed packages - both a natural pipeline stage right after the build step from the Docker lessons earlier in this curriculum.

## Try it

\`\`\`bash
docker images
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'network-hardening',
    slug: 'network-hardening',
    title: 'Network & Firewall Hardening',
    description: 'Closing everything you can, and being able to prove what is left open.',
    difficulty: 'advanced',
    track: 'security',
    order: 68,
    trackCommand: 'iptables -L',
    challenge: 'List every firewall rule currently configured with iptables.',
    solution: 'iptables -L',
    content: `# Network & Firewall Hardening

A server's network exposure is one of the most direct parts of its attack surface - and one of the most straightforward to actually reduce.

## Default-deny

The soundest posture is **default-deny**: block everything, then explicitly allow only the specific ports a service genuinely needs. The alternative - leaving everything open and trying to remember to close the ones you don't need - reliably leaves something exposed that nobody remembers opening, usually discovered during an audit or, worse, an incident.

## ufw vs. iptables

Both tools from earlier Linux lessons reappear here with security specifically in mind:

- **iptables** is the low-level Linux firewall - powerful, precise, and verbose to configure directly.
- **ufw** ("uncomplicated firewall") is a simpler frontend over the same underlying iptables rules, built for exactly the case of "allow SSH and HTTPS, deny everything else" without hand-writing raw rule syntax.

\`\`\`bash
iptables -L
\`\`\`

lists every chain and rule currently in effect - the ground truth of what traffic this host will actually accept, independent of whatever tool was used to configure it.

## This applies in the cloud too

The cloud networking lesson's **security groups** are the exact same default-deny idea, just enforced by the cloud provider instead of the host's own kernel. The principle travels unchanged: list only what must be open, and treat every other port as closed until proven otherwise.

## Try it

\`\`\`bash
iptables -L
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'security-incident-response',
    slug: 'security-incident-response',
    title: 'Detecting & Responding to a Breach',
    description: 'What actually happens in the first hour after something looks wrong.',
    difficulty: 'expert',
    track: 'security',
    order: 69,
    trackCommand: 'journalctl -u ssh -n 20',
    challenge: 'Check the last 20 log lines for the ssh service - exactly what you would review first after a suspected unauthorized-access attempt.',
    solution: 'journalctl -u ssh -n 20',
    content: `# Detecting & Responding to a Breach

This lesson is the capstone for the track: every earlier lesson here - hardened defaults, managed secrets, scanning, a locked-down network - exists to prevent needing this one. When it's needed anyway, speed and discipline matter more than anything else.

## Contain first, root-cause second

The same "mitigate before you fully explain" discipline from incident response in general applies here, with extra urgency: **revoke or isolate first**. Rotate every credential that might have been exposed, cut network access to a compromised host, disable a leaked API key - immediately, before fully understanding how the attacker got in. A breach that's still active gets worse every minute it's merely being *studied* instead of stopped.

## Logs are the evidence trail

\`\`\`bash
journalctl -u ssh -n 20
\`\`\`

Every lesson on logging and observability earlier in this curriculum pays off directly here: logs are frequently the only record of exactly when access happened, from where, and as whom. This is also precisely why **centralized** logging (from the Observability track) matters so much for security specifically - an attacker with access to a single compromised host can delete its local logs; they generally can't reach a separate, centralized log store they were never given access to.

## Assume compromise is broader than it looks

A good habit under pressure: assume the blast radius is larger than the first signal suggests. If one credential leaked, what else did that credential have access to? Rotate broadly, then narrow down with evidence - not the other way around.

## DevSecOps, in one sentence

Every lesson in this track has been building toward the same idea: security isn't a gate at the very end of a pipeline, checked once before a release ships. It's hardened defaults, managed secrets, automated scanning, and a locked-down network, each built into its own stage of the exact same CI/CD pipeline covered earlier in this curriculum - continuous, not occasional.

## Try it

\`\`\`bash
journalctl -u ssh -n 20
\`\`\`

When you're ready, hit **Mark complete**. You've completed the Security & DevSecOps track!
`,
  },

  // ─────────────────── Site Reliability Engineering ───────────────────
  {
    id: 'sre-fundamentals',
    slug: 'sre-fundamentals',
    title: 'SRE Fundamentals',
    description: 'Site Reliability Engineering: treating operations as a software problem instead of a 3 AM fire drill.',
    difficulty: 'beginner',
    track: 'sre',
    order: 70,
    trackCommand: 'uptime',
    challenge: "Check this host's current uptime and load average - the most basic reliability signal there is.",
    solution: 'uptime',
    content: `# SRE Fundamentals

**Site Reliability Engineering (SRE)** is a discipline Google popularized: apply the same rigor, measurement, and automation habits software engineering already has to the job of running systems reliably - instead of treating "operations" as a separate, more ad-hoc world of fire drills and tribal knowledge.

## Reliability is a feature, with a cost

The instinctive goal is "100% uptime, always." In practice, that's both practically impossible and not actually what users need - chasing the last fraction of a percent gets exponentially more expensive for improvements users often can't even perceive. SRE treats reliability as a deliberately chosen target, not an unquestioned maximum - the next lesson, on error budgets, makes that precise.

## Toil: the enemy of scaling operations

**Toil** is manual, repetitive operational work that's purely reactive and creates no lasting improvement - restarting the same stuck service by hand every few days, say. It doesn't scale: more services and more traffic just means more toil, forever, unless it gets automated away. A later lesson in this track covers reducing it directly.

## What this track covers

This track walks through the core SRE toolkit in order: turning "reliable" into a measurable number (SLIs, SLOs, error budgets), responding to incidents when reliability slips, writing postmortems that make the next incident less likely, and finally automating away the toil that caused it in the first place.

## Try it

\`\`\`bash
uptime
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'slis-slos-error-budgets',
    slug: 'slis-slos-error-budgets',
    title: 'SLIs, SLOs & Error Budgets',
    description: 'Turning "reliable" into an actual number you can measure, target, and spend.',
    difficulty: 'intermediate',
    track: 'sre',
    order: 71,
    trackCommand: 'curl -I https://api.example.com/health',
    challenge: "Send a HEAD request to a service's health endpoint - the kind of check an SLI is often built directly on top of.",
    solution: 'curl -I https://api.example.com/health',
    content: `# SLIs, SLOs & Error Budgets

"The service should be reliable" isn't something you can measure or argue about consistently. SRE breaks that vague goal into three specific, related terms.

## SLI: the measured number

A **Service Level Indicator** is a concrete, measured metric - "percentage of requests that returned successfully in the last 5 minutes," "percentage of requests served in under 200ms." It's just a number your monitoring already produces, same as the metrics from the Observability track.

## SLO: the target for that number

A **Service Level Objective** is the target you set for an SLI - "99.9% of requests succeed, measured over a rolling 30 days." It's an internal goal, something the team aims for and designs around.

## SLA: the SLO with a contract attached

A **Service Level Agreement** is what happens when an SLO gets a consequence attached for an external customer - "99.9% uptime, or you get a service credit." Not every SLO needs to be an SLA; plenty of internal targets never get a contract wrapped around them at all.

## Error budget: how much unreliability is allowed

If the SLO is 99.9%, the **error budget** is the remaining 0.1% - the amount of unreliability you're explicitly allowed before you've broken your own target. This reframes incidents from "bad" in the abstract to a specific, trackable resource being spent:

- **Budget healthy** (plenty of the 0.1% left) → ship new features at normal velocity; some risk is fine.
- **Budget nearly exhausted** → freeze risky changes, shift focus to reliability work, until it recovers.

This is what makes error budgets genuinely powerful: they turn "reliability vs. shipping speed" from an endless argument into a number both sides already agreed to in advance.

## Try it

\`\`\`bash
curl -I https://api.example.com/health
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'incident-response',
    slug: 'incident-response',
    title: 'Incident Response',
    description: 'Severity levels, the incident commander role, and the discipline of mitigating before explaining.',
    difficulty: 'advanced',
    track: 'sre',
    order: 72,
    trackCommand: 'ps aux | grep nginx',
    challenge: 'An incident report says nginx might be down - list every process and filter it down to the ones mentioning nginx to confirm.',
    solution: 'ps aux | grep nginx',
    content: `# Incident Response

An **incident** is any unplanned event degrading or interrupting a service. What separates a team that handles incidents well from one that doesn't usually isn't technical skill - it's having an agreed process *before* the pressure of a live outage ever starts.

## Severity levels

Not every incident deserves the same response. Most teams land on something like:

| Severity | Example | Response |
| -------- | ------- | -------- |
| **SEV1** | Full outage, every user affected | Immediate, all-hands |
| **SEV2** | Degraded for a subset of users | Urgent, dedicated responder |
| **SEV3** | Minor, workaround exists | Normal business-hours priority |

Agreeing on these tiers *before* an incident means nobody has to argue about how urgent something is while it's actively happening.

## The incident commander

For anything serious, one person takes the **incident commander** role: coordinating the response, making the call on what to try next, and handling communication - explicitly *not* necessarily the person actually typing commands to fix it. Separating "coordinating" from "fixing" keeps the person doing hands-on work from also having to context-switch into managing status updates.

## Mitigate first, root-cause second

The single most important habit: **stop the bleeding before you fully understand it**. Roll back the last deploy, restart the stuck service, fail over to a backup - any of these can restore service in minutes, long before a full root-cause investigation would finish. The investigation absolutely still happens - just afterward, calmly, as a postmortem, not under the pressure of an ongoing outage.

## Try it

\`\`\`bash
ps aux | grep nginx
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'postmortems',
    slug: 'postmortems',
    title: 'Postmortems & Blameless Culture',
    description: 'Turning an outage into the thing that prevents the next three.',
    difficulty: 'advanced',
    track: 'sre',
    order: 73,
    trackCommand: 'touch postmortem.md',
    challenge: "Create the file where this incident's postmortem will be written up.",
    solution: 'touch postmortem.md',
    content: `# Postmortems & Blameless Culture

Once an incident is over and the mitigation has held, the most valuable part of the whole process starts: writing it up so it's genuinely less likely to happen again.

## Anatomy of a postmortem

A good postmortem is a short, specific document, not a novel:

- **Timeline** - what happened, in order, with real timestamps.
- **Impact** - who was affected, for how long, and how badly.
- **Root cause** - what actually, specifically caused it - not just "the server crashed," but *why* it crashed.
- **Action items** - concrete follow-up work, each with a named owner and a deadline.

That last point matters more than it looks: a postmortem with no owned, deadlined action items is just a very detailed way of describing a problem that will happen again.

## Blameless, on purpose

A **blameless** postmortem asks "what about our systems and processes allowed this to happen?" - never "who caused this?" This isn't a nicety; it's load-bearing for the whole process. If writing an honest timeline risks someone getting blamed, people learn - quickly, and rationally - to leave out inconvenient details or avoid flagging problems early. A team only gets the full, honest story when being part of an incident doesn't feel like a personal risk to admit to.

## It's a learning artifact, not paperwork

The best postmortems get read by people who weren't even involved in the incident - they're how an organization's hard-won lessons about its own system spread beyond the handful of people who happened to be on call that night.

## Try it

\`\`\`bash
touch postmortem.md
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.
`,
  },
  {
    id: 'toil-reduction',
    slug: 'toil-reduction',
    title: 'Toil Reduction & Automation',
    description: 'The SRE habit of never doing the same manual fix a third time.',
    difficulty: 'expert',
    track: 'sre',
    order: 74,
    trackCommand: 'echo',
    challenge:
      "Write a crontab line into a file called `cleanup-job` that runs `/usr/local/bin/cleanup-tmp.sh` every day at midnight, automating away a task you'd otherwise do by hand.",
    solution: "echo '0 0 * * * /usr/local/bin/cleanup-tmp.sh' > cleanup-job",
    content: `# Toil Reduction & Automation

This lesson closes the loop on the whole track: the point of measuring reliability and responding well to incidents is to free up time for the thing that actually prevents the next one - eliminating toil.

## What counts as toil

Not all operational work is toil. Work is toil specifically when it's:

- **Manual** - a human doing it by hand, not a system.
- **Repetitive** - the same task, again and again.
- **Automatable** - a script genuinely could do it.
- Of **no enduring value** - once it's done, nothing is actually better than before; you're just back to baseline until the next time it recurs.

Clearing disk space on a server by hand, every week, because logs fill it up, is toil in exactly this sense: real work, that accomplishes nothing new, forever.

## Why SRE caps it

Google's own guidance suggests capping toil at around 50% of an SRE's time. The reasoning is direct: time spent on toil is time *not* spent on the engineering work - automation, better tooling, fixing root causes - that would actually reduce toil, and incidents, going forward. Left unchecked, toil grows to fill all available time, and the team never gets ahead of it.

## The loop

A simple, repeatable habit for not accumulating toil in the first place:

1. **Do it manually once** - understand the problem for real.
2. **Script it the second time** - stop relying on memory and manual steps.
3. **Schedule or automate it entirely the third time** - a human shouldn't need to remember to run it at all.

## Try it

That log-cleanup example from earlier, automated the way this whole curriculum has been building toward - cron, the same tool from the very first Job Scheduling lesson:

\`\`\`bash
echo '0 0 * * * /usr/local/bin/cleanup-tmp.sh' > cleanup-job
\`\`\`

When you're ready, hit **Mark complete**. You've completed the Site Reliability Engineering track!
`,
  },
];

const CORE_QUIZ_QUESTIONS: QuizQuestion[] = [
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
  {
    id: 'q-js-1',
    lessonId: 'job-scheduling',
    order: 0,
    prompt: 'Which command edits a user\'s scheduled cron jobs?',
    answer: 'crontab',
  },
  {
    id: 'q-js-2',
    lessonId: 'job-scheduling',
    order: 1,
    prompt: 'How many time/date fields come before the command in a crontab line?',
    answer: '5',
  },
  {
    id: 'q-js-3',
    lessonId: 'job-scheduling',
    order: 2,
    prompt: 'What single character means "every value" in a cron field?',
    answer: '*',
  },
  {
    id: 'q-dk-1',
    lessonId: 'disks-and-filesystems',
    order: 0,
    prompt: 'Which command shows free space per mounted filesystem?',
    answer: 'df',
  },
  {
    id: 'q-dk-2',
    lessonId: 'disks-and-filesystems',
    order: 1,
    prompt: 'Which command shows how much space a specific file or directory uses?',
    answer: 'du',
  },
  {
    id: 'q-dk-3',
    lessonId: 'disks-and-filesystems',
    order: 2,
    prompt: 'Which command lists block devices and their partitions?',
    answer: 'lsblk',
  },
  {
    id: 'q-ve-1',
    lessonId: 'vim-editor',
    order: 0,
    prompt: 'Which vim mode do you start in, used for navigation and commands rather than typing text?',
    answer: 'normal',
  },
  {
    id: 'q-ve-2',
    lessonId: 'vim-editor',
    order: 1,
    prompt: 'Which command (typed after `:`) saves the file and quits vim?',
    answer: 'wq',
  },
  {
    id: 'q-ve-3',
    lessonId: 'vim-editor',
    order: 2,
    prompt: 'Which single key, typed in Normal mode, deletes the current line?',
    answer: 'dd',
  },
  {
    id: 'q-lh-1',
    lessonId: 'linux-history',
    order: 0,
    prompt: 'Who created the Linux kernel in 1991?',
    answer: 'linus torvalds',
  },
  {
    id: 'q-lh-2',
    lessonId: 'linux-history',
    order: 1,
    prompt: 'Which project supplied the compiler and shell that combined with the new kernel to form a complete operating system?',
    answer: 'gnu',
  },
  {
    id: 'q-lh-3',
    lessonId: 'linux-history',
    order: 2,
    prompt: 'Which mobile OS, built on the Linux kernel, made Linux the most-deployed kernel on Earth by device count?',
    answer: 'android',
  },
  {
    id: 'q-ss-1',
    lessonId: 'shell-scripting',
    order: 0,
    prompt: 'What is the name for a script\'s first line, e.g. `#!/bin/bash`, that tells the system which interpreter to use?',
    answer: 'shebang',
  },
  {
    id: 'q-ss-2',
    lessonId: 'shell-scripting',
    order: 1,
    prompt: 'Which special variable holds the exit status of the last command run?',
    answer: '$?',
  },
  {
    id: 'q-ss-3',
    lessonId: 'shell-scripting',
    order: 2,
    prompt: 'Which command grants a script execute permission so it can be run directly?',
    answer: 'chmod',
  },
  {
    id: 'q-nb-1',
    lessonId: 'networking-basics',
    order: 0,
    prompt: 'Which command sends ICMP echo requests to test whether a host is reachable?',
    answer: 'ping',
  },
  {
    id: 'q-nb-2',
    lessonId: 'networking-basics',
    order: 1,
    prompt: 'Which curl flag prints only the response headers, not the body?',
    answer: '-i',
  },
  {
    id: 'q-nb-3',
    lessonId: 'networking-basics',
    order: 2,
    prompt: 'Which port does HTTPS use by default?',
    answer: '443',
  },
  {
    id: 'q-sd-1',
    lessonId: 'systemd-and-services',
    order: 0,
    prompt: 'Which process ID does systemd always run as?',
    answer: '1',
  },
  {
    id: 'q-sd-2',
    lessonId: 'systemd-and-services',
    order: 1,
    prompt: 'Which systemctl subcommand makes a service start automatically on every future boot?',
    answer: 'enable',
  },
  {
    id: 'q-sd-3',
    lessonId: 'systemd-and-services',
    order: 2,
    prompt: 'Which command shows a systemd service\'s logs?',
    answer: 'journalctl',
  },
  {
    id: 'q-sec-1',
    lessonId: 'linux-security-basics',
    order: 0,
    prompt: 'Which command runs a single command with elevated (root) privileges?',
    answer: 'sudo',
  },
  {
    id: 'q-sec-2',
    lessonId: 'linux-security-basics',
    order: 1,
    prompt: 'What chmod permission mode should a private SSH key file have?',
    answer: '600',
  },
  {
    id: 'q-sec-3',
    lessonId: 'linux-security-basics',
    order: 2,
    prompt:
      'True or false: production servers should accept password-based SSH login as their primary defense. (answer: true or false)',
    answer: 'false',
  },
  {
    id: 'q-gh-1',
    lessonId: 'getting-help',
    order: 0,
    prompt: 'Which command opens a program\'s full manual page?',
    answer: 'man',
  },
  {
    id: 'q-gh-2',
    lessonId: 'getting-help',
    order: 1,
    prompt: 'Which command searches every man page\'s short description for a keyword?',
    answer: 'apropos',
  },
  {
    id: 'q-gh-3',
    lessonId: 'getting-help',
    order: 2,
    prompt: 'Which man section number covers file formats, such as /etc/passwd\'s layout?',
    answer: '5',
  },
  {
    id: 'q-re-1',
    lessonId: 'regular-expressions',
    order: 0,
    prompt: 'Which character anchors a regex pattern to the start of a line?',
    answer: '^',
  },
  {
    id: 'q-re-2',
    lessonId: 'regular-expressions',
    order: 1,
    prompt: 'Which quantifier means "one or more" of the previous character?',
    answer: '+',
  },
  {
    id: 'q-re-3',
    lessonId: 'regular-expressions',
    order: 2,
    prompt: 'Which character means "or" between alternatives in a regex?',
    answer: '|',
  },
  {
    id: 'q-an-1',
    lessonId: 'advanced-networking',
    order: 0,
    prompt: 'Which modern command replaces netstat for showing listening ports?',
    answer: 'ss',
  },
  {
    id: 'q-an-2',
    lessonId: 'advanced-networking',
    order: 1,
    prompt: 'Which section of dig\'s output contains the actual resolved IP address?',
    answer: 'answer section',
  },
  {
    id: 'q-an-3',
    lessonId: 'advanced-networking',
    order: 2,
    prompt: 'Which command shows every network hop, with latency, between you and a destination?',
    answer: 'traceroute',
  },
  {
    id: 'q-ps-signals-1',
    lessonId: 'process-signals-and-jobs',
    order: 0,
    prompt: 'Which signal number is SIGKILL, the one that cannot be caught or ignored?',
    answer: '9',
  },
  {
    id: 'q-ps-signals-2',
    lessonId: 'process-signals-and-jobs',
    order: 1,
    prompt: 'Which signal does plain `kill` (with no flag) send by default?',
    answer: 'sigterm',
  },
  {
    id: 'q-ps-signals-3',
    lessonId: 'process-signals-and-jobs',
    order: 2,
    prompt: 'Which command lists the background jobs started in the current session?',
    answer: 'jobs',
  },
  {
    id: 'q-fw-1',
    lessonId: 'firewalls-and-network-security',
    order: 0,
    prompt: 'Which ufw subcommand shows current rules and whether the firewall is on?',
    answer: 'status',
  },
  {
    id: 'q-fw-2',
    lessonId: 'firewalls-and-network-security',
    order: 1,
    prompt: 'Which lower-level tool does ufw generate rules for, underneath it?',
    answer: 'iptables',
  },
  {
    id: 'q-fw-3',
    lessonId: 'firewalls-and-network-security',
    order: 2,
    prompt: 'Which iptables chain handles traffic destined for the local machine itself?',
    answer: 'input',
  },
  {
    id: 'q-boot-1',
    lessonId: 'linux-boot-process',
    order: 0,
    prompt: 'Which bootloader does most Linux hand control to after firmware runs?',
    answer: 'grub',
  },
  {
    id: 'q-boot-2',
    lessonId: 'linux-boot-process',
    order: 1,
    prompt: 'What process ID does systemd always take as PID 1\'s replacement for init?',
    answer: '1',
  },
  {
    id: 'q-boot-3',
    lessonId: 'linux-boot-process',
    order: 2,
    prompt: 'Which command lists currently loaded kernel modules?',
    answer: 'lsmod',
  },
  {
    id: 'q-cont-1',
    lessonId: 'containers-from-first-principles',
    order: 0,
    prompt: 'Which kernel feature isolates what a process can SEE (PIDs, network, mounts)?',
    answer: 'namespaces',
  },
  {
    id: 'q-cont-2',
    lessonId: 'containers-from-first-principles',
    order: 1,
    prompt: 'Which kernel feature limits how much CPU or memory a group of processes can USE?',
    answer: 'cgroups',
  },
  {
    id: 'q-cont-3',
    lessonId: 'containers-from-first-principles',
    order: 2,
    prompt: 'Which old command gave a process a different apparent root directory, the ancestor of the mount namespace?',
    answer: 'chroot',
  },
  {
    id: 'q-perf-1',
    lessonId: 'performance-troubleshooting',
    order: 0,
    prompt: 'Load average should always be read relative to which number, from `nproc`?',
    answer: 'cpu count',
  },
  {
    id: 'q-perf-2',
    lessonId: 'performance-troubleshooting',
    order: 1,
    prompt: 'In `free -h` output, which column (not "free") actually reflects usable memory?',
    answer: 'available',
  },
  {
    id: 'q-perf-3',
    lessonId: 'performance-troubleshooting',
    order: 2,
    prompt: 'Which command prints every system call a running process makes, in real time?',
    answer: 'strace',
  },
  {
    id: 'q-cicd-f-1',
    lessonId: 'cicd-fundamentals',
    order: 0,
    prompt: 'Which command initializes a new git repository?',
    answer: 'git init',
  },
  {
    id: 'q-cicd-f-2',
    lessonId: 'cicd-fundamentals',
    order: 1,
    prompt: 'Shipping to production automatically with no human approval step is called continuous what?',
    answer: 'deployment',
  },
  {
    id: 'q-jen-i-1',
    lessonId: 'jenkins-intro',
    order: 0,
    prompt: 'What term describes the Jenkins machines that actually run builds?',
    answer: 'agents',
  },
  {
    id: 'q-jen-i-2',
    lessonId: 'jenkins-intro',
    order: 1,
    prompt: 'Which command checks whether the jenkins service is active?',
    answer: 'systemctl status jenkins',
  },
  {
    id: 'q-jkf-1',
    lessonId: 'jenkinsfile-basics',
    order: 0,
    prompt: 'What is the file called that defines a Jenkins pipeline as code?',
    answer: 'jenkinsfile',
  },
  {
    id: 'q-jkf-2',
    lessonId: 'jenkinsfile-basics',
    order: 1,
    prompt: 'Which declarative pipeline block always runs after the stages, success or failure?',
    answer: 'post',
  },
  {
    id: 'q-jtrg-1',
    lessonId: 'jenkins-triggers',
    order: 0,
    prompt: 'Which trigger style has your git host call Jenkins the instant you push a commit?',
    answer: 'webhooks',
  },
  {
    id: 'q-jtrg-2',
    lessonId: 'jenkins-triggers',
    order: 1,
    prompt: 'In Jenkins cron syntax, which single letter tells it to pick a spread-out time instead of an exact one?',
    answer: 'h',
  },
  {
    id: 'q-jdep-1',
    lessonId: 'jenkins-deploy',
    order: 0,
    prompt: "Which tool is a frequent upgrade over `scp` for transferring more than one changed file?",
    answer: 'rsync',
  },
  {
    id: 'q-jdep-2',
    lessonId: 'jenkins-deploy',
    order: 1,
    prompt: 'What deployment strategy keeps two environments so you can instantly flip which one receives traffic?',
    answer: 'blue-green',
  },
  {
    id: 'q-cld-b-1',
    lessonId: 'cloud-computing-basics',
    order: 0,
    prompt: 'Which cloud service model leaves you managing only your application code?',
    answer: 'paas',
  },
  {
    id: 'q-cld-b-2',
    lessonId: 'cloud-computing-basics',
    order: 1,
    prompt: 'What do you call a physically separate data center within a cloud region?',
    answer: 'availability zone',
  },
  {
    id: 'q-cld-c-1',
    lessonId: 'cloud-compute',
    order: 0,
    prompt: 'What component continuously health-checks a fleet and stops sending traffic to failing instances?',
    answer: 'load balancer',
  },
  {
    id: 'q-cld-c-2',
    lessonId: 'cloud-compute',
    order: 1,
    prompt: 'What should a cloud instance be treated as, since auto-scaling can terminate it at any time?',
    answer: 'disposable',
  },
  {
    id: 'q-cld-s-1',
    lessonId: 'cloud-storage',
    order: 0,
    prompt: 'Which storage type is addressed by keys rather than file paths, the way Amazon S3 works?',
    answer: 'object storage',
  },
  {
    id: 'q-cld-s-2',
    lessonId: 'cloud-storage',
    order: 1,
    prompt: 'Which storage type behaves like a normal hard drive attached to a VM?',
    answer: 'block storage',
  },
  {
    id: 'q-cld-iam-1',
    lessonId: 'cloud-iam',
    order: 0,
    prompt: "What's the principle of granting exactly the access something needs, and nothing more, called?",
    answer: 'least privilege',
  },
  {
    id: 'q-cld-iam-2',
    lessonId: 'cloud-iam',
    order: 1,
    prompt: 'What do you call a set of permissions that something can assume temporarily, instead of a permanent user?',
    answer: 'role',
  },
  {
    id: 'q-cld-net-1',
    lessonId: 'cloud-networking',
    order: 0,
    prompt: "What's your own isolated slice of a cloud provider's network called?",
    answer: 'vpc',
  },
  {
    id: 'q-cld-net-2',
    lessonId: 'cloud-networking',
    order: 1,
    prompt: 'What lets private instances reach out to the internet without accepting inbound connections?',
    answer: 'nat gateway',
  },
  {
    id: 'q-obs-f-1',
    lessonId: 'observability-fundamentals',
    order: 0,
    prompt: 'Which of the three observability pillars captures numbers over time, like CPU percent?',
    answer: 'metrics',
  },
  {
    id: 'q-obs-f-2',
    lessonId: 'observability-fundamentals',
    order: 1,
    prompt: 'Which pillar gives the detailed, timestamped story of exactly what happened?',
    answer: 'logs',
  },
  {
    id: 'q-obs-l-1',
    lessonId: 'observability-logs',
    order: 0,
    prompt: 'Which log level is usually turned off entirely in production?',
    answer: 'debug',
  },
  {
    id: 'q-obs-l-2',
    lessonId: 'observability-logs',
    order: 1,
    prompt: 'Which command shows the last 20 log lines for the nginx unit?',
    answer: 'journalctl -u nginx -n 20',
  },
  {
    id: 'q-obs-m-1',
    lessonId: 'observability-metrics',
    order: 0,
    prompt: 'Which metric type only ever goes up, like a total request count?',
    answer: 'counter',
  },
  {
    id: 'q-obs-m-2',
    lessonId: 'observability-metrics',
    order: 1,
    prompt: 'Does Prometheus pull metrics from applications, or have them pushed to it?',
    answer: 'pull',
  },
  {
    id: 'q-obs-a-1',
    lessonId: 'observability-alerting',
    order: 0,
    prompt: 'Should alerts page on symptoms users would notice, or on every possible internal cause?',
    answer: 'symptoms',
  },
  {
    id: 'q-obs-a-2',
    lessonId: 'observability-alerting',
    order: 1,
    prompt: "What's it called when too many non-actionable alerts teach engineers to tune out real pages too?",
    answer: 'alert fatigue',
  },
  {
    id: 'q-obs-t-1',
    lessonId: 'observability-tracing',
    order: 0,
    prompt: 'What ties every span across multiple services back into one request?',
    answer: 'trace id',
  },
  {
    id: 'q-obs-t-2',
    lessonId: 'observability-tracing',
    order: 1,
    prompt: 'What do you call one unit of work within a trace?',
    answer: 'span',
  },
  {
    id: 'q-dkr-d-1',
    lessonId: 'docker-deep-dive',
    order: 0,
    prompt: 'What do you call a running instance of a Docker image?',
    answer: 'container',
  },
  {
    id: 'q-dkr-d-2',
    lessonId: 'docker-deep-dive',
    order: 1,
    prompt: 'Which Dockerfile instruction copies files from your machine into the image?',
    answer: 'copy',
  },
  {
    id: 'q-dkc-1',
    lessonId: 'docker-compose-basics',
    order: 0,
    prompt: 'Which Compose file key lists one entry per container to run?',
    answer: 'services',
  },
  {
    id: 'q-dkc-2',
    lessonId: 'docker-compose-basics',
    order: 1,
    prompt: 'Which command starts every service defined in a compose file, in the background?',
    answer: 'docker compose up -d',
  },
  {
    id: 'q-k8s-b-1',
    lessonId: 'kubernetes-basics',
    order: 0,
    prompt: "What's the smallest unit Kubernetes schedules?",
    answer: 'pod',
  },
  {
    id: 'q-k8s-b-2',
    lessonId: 'kubernetes-basics',
    order: 1,
    prompt: 'Which resource gives a stable address that always routes to healthy pods?',
    answer: 'service',
  },
  {
    id: 'q-k8s-n-1',
    lessonId: 'kubernetes-networking',
    order: 0,
    prompt: 'Which Kubernetes Service type is only reachable from inside the cluster?',
    answer: 'clusterip',
  },
  {
    id: 'q-k8s-n-2',
    lessonId: 'kubernetes-networking',
    order: 1,
    prompt: "What's the short name for the component that scales pods automatically based on a metric like CPU?",
    answer: 'hpa',
  },
  {
    id: 'q-reg-1',
    lessonId: 'container-registries',
    order: 0,
    prompt: 'Where do built container images live between being built and being run?',
    answer: 'registry',
  },
  {
    id: 'q-reg-2',
    lessonId: 'container-registries',
    order: 1,
    prompt: "Which image tag is often mistaken for 'the newest stable release' when it just means 'most recent untagged push'?",
    answer: 'latest',
  },
  {
    id: 'q-git-f-1',
    lessonId: 'git-fundamentals',
    order: 0,
    prompt: 'What do you call the area between your working directory and the repository, where `git add` puts files?',
    answer: 'staging area',
  },
  {
    id: 'q-git-f-2',
    lessonId: 'git-fundamentals',
    order: 1,
    prompt: 'Which command shows the status of your working directory and staging area?',
    answer: 'git status',
  },
  {
    id: 'q-git-sc-1',
    lessonId: 'git-staging-commits',
    order: 0,
    prompt: 'Which command stages notes.txt for the next commit?',
    answer: 'git add notes.txt',
  },
  {
    id: 'q-git-sc-2',
    lessonId: 'git-staging-commits',
    order: 1,
    prompt: "What verb mood do good commit messages conventionally use - 'Fix bug' rather than 'Fixed bug'?",
    answer: 'imperative',
  },
  {
    id: 'q-git-br-1',
    lessonId: 'git-branching',
    order: 0,
    prompt: 'What do you call the pointer to whichever commit you currently have checked out?',
    answer: 'head',
  },
  {
    id: 'q-git-br-2',
    lessonId: 'git-branching',
    order: 1,
    prompt: 'Which command creates a new branch and switches to it in one step?',
    answer: 'git checkout -b',
  },
  {
    id: 'q-git-mr-1',
    lessonId: 'git-merging-rebasing',
    order: 0,
    prompt: "What's it called when git just slides a branch pointer forward because the target hasn't moved?",
    answer: 'fast-forward',
  },
  {
    id: 'q-git-mr-2',
    lessonId: 'git-merging-rebasing',
    order: 1,
    prompt: 'Which command lists every branch, marking the current one?',
    answer: 'git branch',
  },
  {
    id: 'q-git-go-1',
    lessonId: 'git-workflows-gitops',
    order: 0,
    prompt: 'In GitOps, where does the desired state of your infrastructure live?',
    answer: 'git',
  },
  {
    id: 'q-git-go-2',
    lessonId: 'git-workflows-gitops',
    order: 1,
    prompt: "What's the review step called where a teammate checks your branch before it merges?",
    answer: 'pull request',
  },
  {
    id: 'q-iac-f-1',
    lessonId: 'iac-fundamentals',
    order: 0,
    prompt: 'What word describes a config that produces the same result no matter how many times you apply it?',
    answer: 'idempotent',
  },
  {
    id: 'q-iac-f-2',
    lessonId: 'iac-fundamentals',
    order: 1,
    prompt: 'Which command creates the empty file where Terraform configuration lives?',
    answer: 'touch main.tf',
  },
  {
    id: 'q-tf-b-1',
    lessonId: 'terraform-basics',
    order: 0,
    prompt: 'Which Terraform command shows what would change, without actually changing anything?',
    answer: 'terraform plan',
  },
  {
    id: 'q-tf-b-2',
    lessonId: 'terraform-basics',
    order: 1,
    prompt: "Which command actually applies a Terraform plan to real infrastructure?",
    answer: 'terraform apply',
  },
  {
    id: 'q-tf-s-1',
    lessonId: 'terraform-state',
    order: 0,
    prompt: 'Which command locks down terraform.tfstate to just its owner?',
    answer: 'chmod 600 terraform.tfstate',
  },
  {
    id: 'q-tf-s-2',
    lessonId: 'terraform-state',
    order: 1,
    prompt: "What's it called when real infrastructure no longer matches what Terraform's state believes is true?",
    answer: 'drift',
  },
  {
    id: 'q-ans-b-1',
    lessonId: 'ansible-basics',
    order: 0,
    prompt: 'Does Ansible require installing a permanent agent on every managed server?',
    answer: 'no',
  },
  {
    id: 'q-ans-b-2',
    lessonId: 'ansible-basics',
    order: 1,
    prompt: 'What do you call the file listing every host Ansible manages?',
    answer: 'inventory',
  },
  {
    id: 'q-iac-p-1',
    lessonId: 'iac-in-pipelines',
    order: 0,
    prompt: 'Which Terraform command should run automatically on every pull request, before anything merges?',
    answer: 'terraform plan',
  },
  {
    id: 'q-iac-p-2',
    lessonId: 'iac-in-pipelines',
    order: 1,
    prompt: "What's it called when manual console changes make real infrastructure diverge from Terraform's config?",
    answer: 'drift',
  },
  {
    id: 'q-sec-f-1',
    lessonId: 'security-fundamentals',
    order: 0,
    prompt: 'The CIA triad is confidentiality, integrity, and...?',
    answer: 'availability',
  },
  {
    id: 'q-sec-f-2',
    lessonId: 'security-fundamentals',
    order: 1,
    prompt: 'Which command locks down id_rsa so only its owner can read or write it?',
    answer: 'chmod 600 id_rsa',
  },
  {
    id: 'q-secrets-1',
    lessonId: 'secrets-management',
    order: 0,
    prompt: 'Which command checks whether .env is excluded from version control?',
    answer: 'cat .gitignore',
  },
  {
    id: 'q-secrets-2',
    lessonId: 'secrets-management',
    order: 1,
    prompt: "What's it called when you periodically replace a credential so a leaked copy stops working?",
    answer: 'rotation',
  },
  {
    id: 'q-shift-1',
    lessonId: 'shift-left-security',
    order: 0,
    prompt: 'Which type of security testing analyzes your source code without running it?',
    answer: 'sast',
  },
  {
    id: 'q-shift-2',
    lessonId: 'shift-left-security',
    order: 1,
    prompt: 'Which command lists every image available locally, ready to be scanned?',
    answer: 'docker images',
  },
  {
    id: 'q-neth-1',
    lessonId: 'network-hardening',
    order: 0,
    prompt: 'Which command lists every iptables firewall rule currently configured?',
    answer: 'iptables -L',
  },
  {
    id: 'q-neth-2',
    lessonId: 'network-hardening',
    order: 1,
    prompt: "What's the posture called where you block everything by default and explicitly allow only what's needed?",
    answer: 'default-deny',
  },
  {
    id: 'q-secir-1',
    lessonId: 'security-incident-response',
    order: 0,
    prompt: 'Which command checks the last 20 ssh log lines after a suspected unauthorized-access attempt?',
    answer: 'journalctl -u ssh -n 20',
  },
  {
    id: 'q-secir-2',
    lessonId: 'security-incident-response',
    order: 1,
    prompt: 'Should you contain a breach first, or fully root-cause it first?',
    answer: 'contain',
  },
  {
    id: 'q-sre-f-1',
    lessonId: 'sre-fundamentals',
    order: 0,
    prompt: "Which command shows this host's uptime and load average?",
    answer: 'uptime',
  },
  {
    id: 'q-sre-f-2',
    lessonId: 'sre-fundamentals',
    order: 1,
    prompt: 'Which company originated the term Site Reliability Engineering?',
    answer: 'google',
  },
  {
    id: 'q-slo-1',
    lessonId: 'slis-slos-error-budgets',
    order: 0,
    prompt: "What do you call the measured metric an SLO sets a target for, e.g. percent of successful requests?",
    answer: 'sli',
  },
  {
    id: 'q-slo-2',
    lessonId: 'slis-slos-error-budgets',
    order: 1,
    prompt: 'What do you call the amount of unreliability left over when you subtract your SLO from 100%?',
    answer: 'error budget',
  },
  {
    id: 'q-incres-1',
    lessonId: 'incident-response',
    order: 0,
    prompt: 'During an incident, should you mitigate first or fully explain the root cause first?',
    answer: 'mitigate',
  },
  {
    id: 'q-incres-2',
    lessonId: 'incident-response',
    order: 1,
    prompt: 'What role coordinates an incident response without necessarily fixing it themselves?',
    answer: 'incident commander',
  },
  {
    id: 'q-pm-sre-1',
    lessonId: 'postmortems',
    order: 0,
    prompt: 'What word describes a postmortem culture that focuses on the system, not on blaming an individual?',
    answer: 'blameless',
  },
  {
    id: 'q-pm-sre-2',
    lessonId: 'postmortems',
    order: 1,
    prompt: "Which command creates the file where a postmortem will be written up?",
    answer: 'touch postmortem.md',
  },
  {
    id: 'q-toil-1',
    lessonId: 'toil-reduction',
    order: 0,
    prompt: 'What word describes manual, repetitive operational work with no lasting value?',
    answer: 'toil',
  },
  {
    id: 'q-toil-2',
    lessonId: 'toil-reduction',
    order: 1,
    prompt: "Google's SRE guidance suggests capping toil at about what percent of an SRE's time? (just the number)",
    answer: '50',
  },
];

/** Every lesson, including the Google Cloud lessons kept in `./lessons-gcp.ts`. */
export const LESSONS: Lesson[] = [...CORE_LESSONS, ...GCP_LESSONS];

export const QUIZ_QUESTIONS: QuizQuestion[] = [...CORE_QUIZ_QUESTIONS, ...GCP_QUIZ_QUESTIONS];

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
