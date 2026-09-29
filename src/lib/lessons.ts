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
  {
    id: 'linux-history',
    slug: 'linux-history',
    title: 'The History of Linux',
    description: 'From Unix at Bell Labs to the kernel that runs the cloud, decade by decade.',
    difficulty: 'beginner',
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

> This browser sandbox cannot host a real full-screen editor - there's no TTY for vim to draw into. Typing \`vim <file>\` here prints a read-only preview of the file instead, plus the \`echo\`/\`sed\`/\`tee\` commands that actually edit files in this environment. Use those to complete the challenge below, then try the motions above in a real terminal - every Linux system ships a hands-on tutorial: run \`vimtutor\`.

## Try it

\`\`\`bash
echo "first draft" > notes.txt
vim notes.txt
echo "reviewed" >> notes.txt
cat notes.txt
\`\`\`

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
