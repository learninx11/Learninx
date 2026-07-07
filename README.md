# Learninx

An interactive Linux learning platform that teaches the command line through short lessons, hands-on challenges, and a safe in-browser terminal.

No login. No accounts. No database. Open the page, type commands, learn.

## Demo

<a href="./public/Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4">
  <img src="https://img.shields.io/badge/▶%20Watch%20demo-Click%20to%20play-0ea5e9?style=for-the-badge" alt="Watch the Learninx demo" />
</a>

A short walkthrough of the lessons, the in-browser terminal, and the boss-level sandbox:

```html
<video
  src="./public/Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4"
  controls
  preload="metadata"
  width="100%"
  poster=""
  style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);">
  Your browser does not support the video tag.
  <a href="./public/Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4">
    Download the demo video
  </a>
</video>
```

> On GitHub, the embedded `<video>` player is rendered automatically. On npm registries or other Markdown renderers that strip raw HTML, the badge above still links to the file in this repository's `public/` folder.

[⬇️ Download the demo MP4 (./public/Learninx — Learn Linux the Easy Way.mp4)](./public/Learninx%20%E2%80%94%20Learn%20Linux%20the%20Easy%20Way.mp4)

## Highlights

- **Bite-sized lessons** covering the core of the Linux command line.
- **In-browser terminal sandbox** (xterm.js) with a POSIX-style shell and an in-memory virtual filesystem — nothing touches the user's real machine.
- **Auto-graded challenges** and end-of-lesson quizzes with score-based completion.
- **Boss levels** — multi-step scenarios for learners who finish the regular catalogue (restore a broken service, sort a messy log folder, etc.).
- **Searchable cheatsheet** of every command the in-browser shell supports.
- **Cmd/Ctrl+K command palette** for fast navigation across the site.
- **Light & dark themes** with automatic detection and a per-browser toggle.
- **Streaks & points** (10 per lesson, 1 per correct quiz answer) tracked in a signed per-browser cookie / localStorage.
- **Daily Linux tip** card on the home page, deterministic by UTC day.
- **Table of contents** on long lessons, with active-section highlighting.
- **Search and filter** on the lessons index.
- Anonymous progress tracking via signed cookie (Docker) or localStorage (GitHub Pages). No signup, no DB.
- Polished, terminal-inspired dark/light UI with a shared design-token system (`lx-card`, `lx-btn`, `lx-pill`, `lx-input`, `lx-progress`).
- Keyboard shortcuts: `g l` jumps to lessons, `g h` jumps home, `/` focuses search, `Cmd/Ctrl+K` opens the palette.
- Ships with Docker support for production-style deployments.

## Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Runtime  | Node.js 20 LTS                                 |
| Framework| Next.js 14 (App Router) + TypeScript           |
| Styling  | Tailwind CSS + CSS custom properties           |
| Storage  | None — lessons are code; progress is a cookie / localStorage |
| Terminal | xterm.js + xterm-addon-fit                     |
| Markdown | react-markdown + remark-gfm                    |
| Deploy   | GitHub Pages (static export) and Docker (standalone Node) |

## Quick start (local development)

### Prerequisites

- Node.js 18.18 or newer (20.x recommended)
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open <http://localhost:3000>. No database to create, no seed script to run — the lesson catalogue is in code and progress is a cookie on the browser.

## Docker

A multi-stage Dockerfile is included. Production builds use Next.js's `output: 'standalone'` mode, so the runtime image carries only the traced `node_modules` plus a single `server.js`.

```bash
# Build and run with Docker directly
docker build -t learninx:latest .
docker run --rm -p 3000:3000 learninx:latest
```

Or with the supplied compose file:

```bash
docker compose up --build
```

The image is self-contained: no volumes, no database, no migrations.

### Build stages

| Stage      | Purpose                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| `deps`     | Install all npm dependencies (build + runtime).                            |
| `builder`  | Run `next build` with `output: 'standalone'`.                              |
| `runner`   | Minimal `node:20-alpine` image that runs the standalone `server.js`.       |

On every container start, the runner copies the static assets into the standalone output (idempotent), then launches the Next.js server on port 3000.

## Deploying to GitHub Pages

The same Next.js app exports to a fully static site that can be hosted on GitHub Pages with zero backend. The export step is enabled by setting `GITHUB_PAGES=true` at build time (the included workflow already does this).

```bash
GITHUB_PAGES=true npm run build
```

The build output is written to `out/`. Publish the `out/` directory to GitHub Pages via the official action (or your preferred static host). A few notes:

- `next.config.js` automatically sets `output: 'export'`, `basePath: '/Learninx'`, and `images: { unoptimized: true }` when `GITHUB_PAGES=true` is set.
- All interactive state is per-browser (`localStorage`); no server is required.
- The `CommandPalette`, `ThemeToggle`, daily tip, streak widget, cheatsheet, and boss levels are all client-only and ship in the static bundle.

## Project structure

```
learninx/
├── scripts/
│   └── copy-standalone-assets.mjs   # Idempotent post-build step
└── src/
    ├── app/
    │   ├── layout.tsx     # Root layout: skip link, nav, footer, theme + keyboard shortcuts + palette
    │   ├── page.tsx       # Landing page (reads progress cookie, daily tip, streak widget)
    │   ├── loading.tsx    # Global loading state
    │   ├── not-found.tsx  # 404 page
    │   ├── _daily-tip.tsx # Client: daily Linux tip card
    │   ├── _home-progress.tsx  # Client: home progress widgets
    │   ├── boss/
    │   │   ├── page.tsx              # Index of all boss levels
    │   │   └── [slug]/
    │   │       ├── page.tsx          # Server: static params + metadata
    │   │       └── _boss-client.tsx  # Client: per-step state + grading sandbox
    │   ├── cheatsheet/
    │   │   ├── page.tsx              # Server shell
    │   │   └── _cheatsheet-client.tsx # Client: search + category filters
    │   └── lessons/
    │       ├── page.tsx                # Server shell
    │       ├── _lessons-index-client.tsx  # Client: search + filter + highlights
    │       └── [slug]/
    │           ├── page.tsx           # Server: generates static params
    │           ├── _lesson-detail-client.tsx # Client: lesson + challenge + quiz
    │           └── actions.ts         # Server actions (kept for Docker build)
    ├── components/
    │   ├── Terminal.tsx            # xterm.js sandbox (client-only, with tab complete + paste)
    │   ├── TerminalClient.tsx      # next/dynamic wrapper with skeleton loader
    │   ├── ChallengeRunner.tsx     # Auto-graded practice form with hint reveal
    │   ├── LessonQuiz.tsx          # Multi-question grader with retry
    │   ├── CompleteButton.tsx      # Manual "Mark complete" button
    │   ├── Markdown.tsx            # react-markdown wrapper (uses CodeBlock, adds heading ids)
    │   ├── CodeBlock.tsx           # Fenced code block with copy + language label
    │   ├── ResetProgressButton.tsx # Wipes the progress cookie
    │   ├── KeyboardShortcuts.tsx   # `g l`, `g h` global shortcuts
    │   ├── CommandPalette.tsx      # Cmd/Ctrl+K palette with lesson + nav search
    │   ├── ThemeToggle.tsx         # Dark/light theme switch
    │   ├── StreakWidget.tsx        # Card + inline variants of the streak widget
    │   ├── TableOfContents.tsx     # Sticky ToC for long lessons
    │   └── ui/                     # Shared primitives (Icon, Pill, Card, ProgressBar, ScrollProgress)
    └── lib/
        ├── lessons.ts          # Lesson + quiz catalogue (plain TypeScript)
        ├── cheatsheet.ts       # Structured reference of every sandbox command
        ├── bosses.ts           # Multi-step boss scenarios (verifier + seed)
        ├── toc.ts              # Markdown → table of contents helper
        ├── tips.ts             # Daily Linux tips
        ├── progress.ts         # Signed-cookie progress store (HMAC-SHA256, Docker)
        ├── progress-client.ts  # localStorage progress store (GitHub Pages)
        ├── progress-types.ts   # Shared ProgressState / QuizScore / StreakState types
        ├── progress-context.tsx # React context for progress
        ├── types.ts            # Shared types
        └── shell/
            ├── fs.ts          # In-memory virtual filesystem
            └── evaluator.ts   # POSIX-style shell interpreter
```

## How progress tracking works

The app does not have user accounts and does not use a database. Progress lives entirely in the visitor's own browser. Two storage backends ship in the same code:

- **GitHub Pages build** (`output: 'export'`) uses `localStorage` under the key `learninx_progress`. The data is plain JSON, scoped per origin and per browser, and never leaves the device.
- **Docker / standalone build** (default) uses a **signed cookie** named `learninx_progress`. The cookie is `base64url(json).base64url(hmac-sha256)` and contains the visitor's completed-lesson ids, their last quiz score per lesson, and their lifetime streak / points.

The cookie is `httpOnly`, `sameSite=lax`, expires in 1 year, and is verified on every read. The signing key comes from `LEARNINX_SECRET` if set, otherwise a per-process random key (fine for dev, resets on every container restart). See [Configuration](#configuration).

Clearing the cookie / localStorage (or browsing in a private window) starts a fresh profile.

### Streaks and points

- Completing a lesson awards **+10 points** and bumps the streak if the day has changed.
- Each correct quiz answer awards **+1 point** (only new correct answers, not re-takes at the same level).
- Missing a calendar day (UTC) resets the current streak to 1 the next time the learner shows up.
- The home page and lessons index show a streak widget; both client and cookie stores share the same shape.

## Pages

| Route              | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `/`                | Home — pitch, daily tip, streak widget, "more to explore" |
| `/lessons`         | Lesson index with search, difficulty & status filters     |
| `/lessons/[slug]`  | Lesson detail (markdown + ToC + challenge + quiz)         |
| `/cheatsheet`      | Searchable command reference                              |
| `/boss`            | Index of multi-step boss challenges                       |
| `/boss/[slug]`     | One boss level with per-step grading + sandbox            |

## Key bindings

| Shortcut                | Action                                  |
| ----------------------- | --------------------------------------- |
| `g` then `l`            | Jump to lessons                         |
| `g` then `h`            | Jump to home                            |
| `Cmd` / `Ctrl` + `K`    | Open the command palette                |
| `/`                     | Focus the search box on the current page|
| `Esc`                   | Close the command palette               |
| `↑` / `↓`               | Move within the palette / ToC           |
| `Enter`                 | Open the highlighted palette item       |
| `t` (on a lesson)       | Focus the sandbox terminal              |

## Available shell commands

The sandbox in `src/lib/shell/evaluator.ts` implements the most common teaching commands:

- Navigation and inspection: `pwd`, `cd`, `ls` (incl. `-l`, `-a`, `-la`), `cat`, `head`, `wc`.
- File operations: `mkdir` (incl. `-p`), `touch`, `rm` (incl. `-r`, `-f`), `mv`, `cp`.
- Permissions and process info: `chmod`, `ps`, `top` (read-only informational output).
- System info: `uname`, `uptime`, `free`, `df`, `whoami`, `hostname`, `date`, `echo`, `clear`, `help`.
- Simulated editors: `nano`, `vi`, `vim`, `pico`, `emacs` — print a TUI-style view of the file and point the learner to the editing commands that actually mutate the file (`echo >`, `>>`, heredocs, `sed`, `printf`).
- Shell built-ins: command history (Up/Down arrows), `Ctrl+C` to abort a line, `Ctrl+L` to clear.

Type `help` inside the terminal for the full list.

The shell evaluates each command against the in-memory virtual filesystem in `src/lib/shell/fs.ts`. Running `rm -rf /` is harmless — the root node is just a JavaScript object.

## Adding a new lesson

All lessons live in code. Edit `src/lib/lessons.ts` and append a new entry to `LESSONS`, plus a matching block in `QUIZ_QUESTIONS`:

```ts
// src/lib/lessons.ts
export const LESSONS: Lesson[] = [
  // …existing entries…
  {
    id: 'my-new-lesson',            // stable id; also used as the quiz join key
    slug: 'my-new-lesson',          // URL: /lessons/my-new-lesson
    title: 'Title',
    description: 'Short blurb shown on the lessons index.',
    difficulty: 'beginner',         // beginner | intermediate | advanced
    order: 6,                       // next available order number
    trackCommand: 'grep',           // command to surface in the sandbox hint
    challenge: 'Find lines containing "hello" in notes.txt',
    solution: 'grep hello notes.txt', // pipe-separated alternatives: 'a || b'
    content: `# My new lesson

Markdown content goes here.`,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // …existing entries…
  {
    id: 'q-mnl-1',
    lessonId: 'my-new-lesson',
    order: 0,
    prompt: 'Which command prints text to the screen?',
    answer: 'echo',
  },
];
```

Save the file — Next.js dev server hot-reloads. The new lesson will be live at `/lessons/my-new-lesson`.

## Adding a new cheatsheet entry

Edit `src/lib/cheatsheet.ts` and append to `CHEATSHEET`:

```ts
// src/lib/cheatsheet.ts
export const CHEATSHEET: CheatEntry[] = [
  // …existing entries…
  {
    cmd: 'xargs',
    short: 'build and execute command lines from stdin',
    long: 'Reads whitespace-separated tokens from stdin and runs the given command for each one.',
    examples: ['echo a b c | xargs mkdir', 'find . -name "*.log" | xargs rm'],
    category: 'Text', // Navigation | Files | Inspection | Editing | Permissions | System | Help
    keywords: ['pipe', 'stdin', 'batch'],
  },
];
```

If you add a new category, also append it to `CHEAT_CATEGORIES` in the same file.

## Adding a new boss level

Edit `src/lib/bosses.ts` and append to `BOSS_LEVELS`:

```ts
// src/lib/bosses.ts
export const BOSS_LEVELS: BossLevel[] = [
  // …existing entries…
  {
    id: 'patch-the-bug',
    slug: 'patch-the-bug',
    title: 'Patch the bug',
    description: 'A service is logging the wrong value. Use sed to fix it.',
    difficulty: 'advanced',
    order: 3,
    seedVfs(root) {
      // (Optional) seed the in-memory VFS for this scenario.
      // The default root already has /home, /etc, /usr, /tmp, /var.
    },
    steps: [
      {
        title: 'Find the typo',
        prompt: '`grep` for the wrong value in /var/log/app.log',
        verify({ command, output }) {
          // Return { ok: boolean, message: string }.
          if (!command.startsWith('grep ')) {
            return { ok: false, message: 'Use grep.' };
          }
          if (/typo/.test(output)) {
            return { ok: true, message: 'Found it.' };
          }
          return { ok: false, message: 'No match — try a different pattern.' };
        },
      },
      // …more steps
    ],
  },
];
```

Each step runs the user's command in a **fresh seeded VFS**, so retries do not pollute the filesystem. The verifier gets the resulting `fs`, `cwd`, `output`, and the original `command`.

## NPM scripts

| Script                | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `npm run dev`         | Start the dev server on http://localhost:3000.                       |
| `npm run build`       | Produce a production build in `.next/`.                              |
| `npm run start`       | Copy static assets into the standalone output and serve the build.   |
| `npm run start:dev`   | Serve a previously-built bundle via `next start` (no asset copy).    |
| `npm run lint`        | Lint the codebase with `next lint`.                                  |

## Configuration

The app reads one optional environment variable:

| Variable          | Example                                | Purpose                                                  |
| ----------------- | -------------------------------------- | -------------------------------------------------------- |
| `LEARNINX_SECRET` | `a long random string`                 | HMAC key for the progress cookie. Set this in production so progress survives deploys and restarts. |

No other secrets are required — the app is anonymous and has no third-party integrations.

## Architecture decisions

A few choices are deliberate and worth knowing if you plan to extend the project:

- **No database is a feature.** The whole point of a learning app is that a visitor can try it instantly. Spinning up Postgres or running migrations would be friction with no payoff for this app's scale. A signed cookie is the simplest store that still gives every browser a persistent profile.
- **Lessons in code, not data.** `src/lib/lessons.ts` is the single source of truth. Edits are typed, reviewed via git, hot-reloaded by `next dev`, and ship in the JS bundle — no seed step, no migrations.
- **No xterm.js on the server.** The terminal is loaded client-side via dynamic imports inside a `useEffect` so xterm's browser-only globals never reach the server bundle. This is why the lesson page is small on the client initial payload.
- **`output: 'standalone'`.** The Next.js config emits a runnable `server.js` plus a traced `node_modules/` directory. The Dockerfile's runtime stage copies just that.
- **Server actions, not API routes.** All writes (lesson completion, challenge submission, quiz grading, progress reset) are Next.js Server Actions colocated with the lesson route under `src/app/lessons/[slug]/actions.ts`. This keeps the data flow explicit and visible.
- **Design tokens, not magic colors.** `src/app/globals.css` defines `--lx-bg`, `--lx-card`, `--lx-accent`, etc. and a small component library (`.lx-card`, `.lx-btn`, `.lx-pill`, `.lx-input`, `.lx-progress`) is registered in `@layer components`. New pages should compose these instead of inventing one-off styles.

## Keyboard shortcuts

| Shortcut          | Action                       |
| ----------------- | ---------------------------- |
| `g` then `l`      | Jump to the lessons index    |
| `g` then `h`      | Jump to the home page        |
| `Tab` (in sandbox)| Autocomplete a command name  |
| `Ctrl+L` (sandbox)| Clear the terminal screen    |
| `Ctrl+C` (sandbox)| Abandon the current line     |
| `Ctrl+Shift+V`    | Paste from the clipboard     |
| `↑` / `↓`         | Walk through command history |

Shortcuts are inactive when a text field has focus.

## License

MIT — see [`LICENSE`](LICENSE) if present, otherwise standard MIT terms apply.
