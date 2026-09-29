# TODO

This file tracks remaining polish items. The current state covers a
wide feature set: light/dark theme, command palette, search & filter,
table of contents, cheatsheet, boss levels, daily tips, streaks,
points, **bookmarks**, **per-lesson notes**, **achievements**,
**profile & backup**, and a **typing test** mini-game. All of it
ships in the GitHub Pages static export — no server required.

## Done in this pass

- [x] **Light & dark theme** with a `light` class on `<html>`, an
      inline pre-hydration script to prevent flash, automatic
      detection of `prefers-color-scheme`, and a header toggle that
      persists in `localStorage`.
- [x] **Cmd/Ctrl+K command palette** — fuzzy lesson search, top-level
      navigation, grouped results, arrow-key + Enter selection,
      ESC to close, and a header trigger button.
- [x] **Search & filter on the lessons index** — text search across
      title, description, id, slug, `trackCommand`, difficulty and
      the first 200 chars of content; difficulty chips; status chips
      (all / to do / completed / **bookmarked**); highlighted
      matches; `/` to focus the search box; empty-state.
- [x] **Table of contents** for long lessons (≥ 2 H2 headings) —
      sticky on the right at `xl` viewport, IntersectionObserver to
      highlight the active section, deep-linkable anchors.
- [x] **Cheatsheet** at `/cheatsheet` — every sandbox command with
      tagline, long description, examples, and category filter; `/`
      focuses search.
- [x] **Boss levels** at `/boss` and `/boss/[slug]` — multi-step
      scenarios that run the user's command in a fresh seeded VFS
      and grade it with a pure verifier. Includes "Recover the
      server" and "Organize the mess". Boss completion is now
      persisted and awards +25 points.
- [x] **Daily Linux tip** card on the home page — deterministic by
      UTC day, with a "Got it" button that records the dismissal in
      the progress store. Includes a "Shuffle" button that surfaces
      a different tip from the catalogue, a "Back to today" reset,
      and a small "N seen" counter. Unlocks the new **Tip explorer**
      achievement at 5 unique tips.
- [x] **Streaks & points** — +10 per completed lesson, +1 per
      correct quiz answer, +25 per boss, +5 per achievement,
      current/best streak, lifetime counters. Server- and
      client-side progress stores share a single `ProgressState`
      type.
- [x] **Streak widget** on the home page (card) and lessons index
      (inline).
- [x] **More to explore** section on the home page linking to
      cheatsheet, boss levels, typing test, achievements, profile,
      and the streaks widget.
- [x] **Bookmarks** — per-lesson toggle button on the lesson
      detail page, "Bookmarked" pill + filter on the lessons index,
      full `bookmarks` state in the progress store, "Bookworm"
      achievement for saving five.
- [x] **Per-lesson notes** — autosaved scratchpad on every lesson
      detail page (debounced localStorage writes, "Saved Xm ago"
      status, edit / clear / 4000-char cap). "Note taker" achievement
      for writing your first note.
- [x] **Achievements / badges** — 16 unlockable badges across
      streaks, quiz perfect-scores, boss runs, bookmarks, notes, tip
      exploration, and typing speed. Pure-function
      `evaluateAchievements` derives every state from the progress
      snapshot, so a stale `localStorage` is auto-upgraded the next
      time the visitor opens the site. `/achievements` page renders
      a card grid with locked / unlocked / hidden states.
- [x] **Achievement toaster** — small bottom-right toast pops up
      whenever a new badge is unlocked, dismissible, auto-clears
      after a few seconds.
- [x] **Profile & backup** — `/profile` page with lifetime stats
      (points, current/best streak, lessons done, perfect quizzes,
      bookmarks, notes, best typing), recent activity, an "Export
      progress" download that produces a versioned JSON file, and
      an "Import progress" file picker that overwrites the current
      snapshot.
- [x] **Typing test** — `/typing` page with a 20-snippet library of
      real shell commands, live WPM + accuracy + timer, character
      highlighting, and a "Best on this browser" panel. Unlocks
      "Fast fingers" at 30 WPM and "Lightning" at 60 WPM.
- [x] **Navigation polish** — Typing / Badges / Profile links added
      to the top nav, new entries in the Cmd/Ctrl+K palette, and
      extra `g` shortcuts (`g a`, `g b`, `g c`, `g p`, `g t`).
- [x] **Progress-store v1 → v2 migration** — old `localStorage`
      payloads (`v: 1`) are normalised on the fly; the new fields
      default to safe empties.
- [x] **Production build** for both `output: 'standalone'` and
      `output: 'export'` passes (`npm run build`,
      `GITHUB_PAGES=true npm run build`). All 19 routes pre-rendered
      to static HTML.
- [x] **18 new inline-SVG icons** added to `src/components/ui/Icon.tsx`
      (bookmark, note, award, medal, clock, share, download,
      upload, user, gamepad, pencil, trash, sparkle-star, code,
      chart, plus several that were already there).
- [x] **Markdown component** still adds `id` attributes to h2/h3
      headings and hides the page-title h1.
- [x] **CodeBlock** with language label and copy button kept.

## Done in this pass (2)

- [x] **Three more boss levels** — `/boss/ship-the-deploy-script`
      (strip a debug flag with `sed`+`tee`, `chmod +x`, `install -D`
      into `/usr/local/bin`, clean up the source), `/boss/bring-the-service-back-online`
      (fix a systemd `ExecStart` path and bring the unit up with the
      new simulated `systemctl` command), and `/boss/fix-the-permission-puzzle`
      (`chown`/`chmod` a shared deploy folder down to the right
      owner and mode). Five bosses total now; achievements, the boss
      index, the profile stats, and the home page all pick them up
      automatically since they read from `getAllBosses()`.
- [x] **New sandbox commands** — `chown` (simulated, mirrors `chmod`)
      and `systemctl` (simulated `daemon-reload` / `enable` / `disable`
      / `start` / `stop` / `restart` / `status`), both documented in
      the cheatsheet.
- [x] **Fixed a real `rm` bug**: it looked up `loc.parent.children[arg]`
      using the *full path* the user typed instead of the resolved
      basename (`loc.name`), so `rm /some/absolute/path` silently did
      nothing anywhere in the sandbox — including in the original
      "Recover the server" boss's cleanup step. Now mirrors `rmdir`'s
      (correct) lookup.
- [x] **Fixed `recover-the-server`'s seed**: its `seedVfs` bailed out
      early because `/usr/local/bin` didn't exist in the default
      virtual filesystem, so none of its files were ever seeded and
      the boss was unsolvable. `createInitialFs()` now includes
      `/usr/local/bin`.
- [x] **Fixed `organize-the-mess`'s last step**: each boss step reruns
      against a *freshly reseeded* filesystem rather than the previous
      step's edits, so the old prompt ("just `mv` the two files into
      `errors/`") could never pass — the directory from the earlier
      step never carried over, and `mv` onto a nonexistent directory
      created a same-named *file* instead. The step now tells the
      learner to `mkdir -p` the destination in the same chained
      command.

## Done in this pass (3)

- [x] **Six new lessons**, roughly doubling the catalogue (5 → 11):
      `pipes-and-redirection`, `environment-variables`, `text-processing`
      (grep/sed/awk), `finding-files` (find/xargs), `archives-and-compression`
      (tar/gzip), and `package-management` (apt). Existing lessons were
      renumbered to fit them into a sensible teaching order, and
      `users-and-permissions` gained a new "Changing ownership" section
      covering `chown`. Each lesson ends with a "Further reading" pointer
      to a specific, well-known book (e.g. *The Linux Command Line* by
      William Shotts, *sed & awk* by Dougherty & Robbins, *How Linux
      Works* by Brian Ward, *Learning the bash Shell* by Cameron Newham,
      *UNIX and Linux System Administration Handbook* by Nemeth et al.)
      rather than a vague "learn more" gesture.
- [x] **Real `$VAR` / `${VAR}` expansion** in the shell — previously
      `export` could set a variable but nothing could ever read it back.
      Expansion is quote-aware (suppressed in `'single quotes'`, active
      unquoted and in `"double quotes"`), matching real shell behavior,
      and doesn't collide with `awk`'s `$1`/`$2` field syntax.
- [x] **Real `>`, `>>`, and `<` redirection** — previously entirely
      unimplemented, despite the sandbox's own simulated-editor output
      telling learners to use it. `>` overwrites, `>>` appends, `<` feeds
      a file in as stdin; all three compose with pipes and are quote-aware.
- [x] **Fixed a real pipe bug**: piping into any command that also takes
      a flag or a required argument (`ps aux | grep root`, `ls | wc -l`,
      `cat file | sort -r`, `... | sed '...'`, `... | awk '...'`, `... |
      cut -f2`) silently produced empty or wrong output, because stdin
      was only ever injected when a command had *zero* arguments at all.
      This was the literal shipped solution for the original
      "Processes and the System" lesson. `grep`/`sed`/`awk`/`cut` now
      fall back to piped stdin when they have no explicit file operand,
      and the general injection rule now keys off "no non-flag argument
      yet" instead of "no arguments at all".
- [x] **`printf` now interprets `\n` and `\t`** (previously printed the
      two literal characters), so it can build genuine multi-line files
      via redirection instead of one run-on line.
- [x] **New sandbox commands**: `tar` (`-c`/`-x`/`-t`, `-v`, `-z`, real
      round-trip archiving of the in-memory filesystem), `gzip`/`gunzip`
      (real compress/decompress round trip, `-k` to keep the original),
      and `apt` (`update`/`install`/`remove`/`search`/`list --installed`
      against a small fixed catalogue, with installed-state persisted
      under `/var/lib/dpkg/info` the way real Debian systems track it).
- [x] **Cheatsheet cleanup**: removed a stale duplicate `chown` entry
      that claimed it was "sandbox is informational" (it's simulated for
      real), and a stale duplicate `systemctl` entry that claimed it was
      "Not available in the sandbox" (also simulated for real since the
      previous pass). Added entries for `apt`, `dpkg`, `dnf`/`yum`, and
      `pacman`.

## Future ideas

- [ ] Optional syntax highlighting in markdown via `rehype-pretty-code`
      or `shiki`. Currently the CodeBlock adds a language label and
      a copy button but keeps the plain mono look.
- [ ] A `?hl=` deep-link on the lessons index that pre-applies a
      search query, so blog posts can link directly to filtered
      catalogues.
- [ ] A `?bookmarks=1` deep-link that pre-applies the bookmarked
      filter, so the lesson header can link to "my saved lessons".
- [ ] Internationalisation: extract the hard-coded English strings
      to a messages file and add a `?lang=` switch.
- [ ] Optional IndexedDB mirror of the progress store, so visitors
      who clear localStorage (or use a different profile) don't
      lose everything.
- [ ] Real Playwright tests: cover the `g l` shortcut, the
      Cmd/Ctrl+K palette, the theme toggle persistence, the
      cheatsheet search, the bookmark toggle, the typing test
      round-trip, the quiz passing flow, and the export / import
      round-trip.
- [ ] Server-side progress import via URL hash so a learner can
      share a progress snapshot as a single link.
