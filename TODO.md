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
      the progress store.
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
- [x] **Achievements / badges** — 15 unlockable badges across
      streaks, quiz perfect-scores, boss runs, bookmarks, notes, and
      typing speed. Pure-function `evaluateAchievements` derives
      every state from the progress snapshot, so a stale `localStorage`
      is auto-upgraded the next time the visitor opens the site.
      `/achievements` page renders a card grid with locked / unlocked
      / hidden states.
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

## Future ideas

- [ ] Optional syntax highlighting in markdown via `rehype-pretty-code`
      or `shiki`. Currently the CodeBlock adds a language label and
      a copy button but keeps the plain mono look.
- [ ] A `?hl=` deep-link on the lessons index that pre-applies a
      search query, so blog posts can link directly to filtered
      catalogues.
- [ ] A `?bookmarks=1` deep-link that pre-applies the bookmarked
      filter, so the lesson header can link to "my saved lessons".
- [ ] More boss levels: build & install a small script, configure
      `systemd` (simulated), debug a permission issue across
      `chmod`/`chown`, etc.
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
