# TODO

This file tracks remaining polish items. The current state covers a
wide feature set: light/dark theme, command palette, search & filter,
table of contents, cheatsheet, boss levels, daily tips, streaks,
points, and progress tracking. All of it ships in the GitHub Pages
static export — no server required.

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
      (all / to do / completed); highlighted matches; `/` to focus
      the search box; empty-state.
- [x] **Table of contents** for long lessons (≥ 2 H2 headings) —
      sticky on the right at `xl` viewport, IntersectionObserver to
      highlight the active section, deep-linkable anchors.
- [x] **Cheatsheet** at `/cheatsheet` — every sandbox command with
      tagline, long description, examples, and category filter; `/`
      focuses search.
- [x] **Boss levels** at `/boss` and `/boss/[slug]` — multi-step
      scenarios that run the user's command in a fresh seeded VFS
      and grade it with a pure verifier. Includes "Recover the
      server" and "Organize the mess".
- [x] **Daily Linux tip** card on the home page — deterministic by
      UTC day, with a "Got it" button that records the dismissal in
      the progress store.
- [x] **Streaks & points** — +10 per completed lesson, +1 per
      correct quiz answer, current/best streak, lifetime counters.
      Server- and client-side progress stores share a single
      `ProgressState` type.
- [x] **Streak widget** on the home page (card) and lessons index
      (inline).
- [x] **More to explore** section on the home page linking to
      cheatsheet, boss levels, and the new tools.
- [x] **Extended progress types** in a new `progress-types.ts`
      shared between the cookie and localStorage stores; safe
      upgrade path for old cookies / localStorage data.
- [x] **13 new inline-SVG icons** added to `src/components/ui/Icon.tsx`
      (search, sun, moon, keyboard, fire, lightbulb, target,
      command, star, list, filter, etc.).
- [x] **Markdown component** now adds `id` attributes to h2/h3
      headings (so anchors + ToC work) and hides the page-title h1
      to avoid duplicating the lesson header.
- [x] **CodeBlock** with language label and copy button kept.
- [x] **Production build** for both `output: 'standalone'` and
      `output: 'export'` passes (`npm run build`,
      `GITHUB_PAGES=true npm run build`). All 14 routes pre-rendered
      to static HTML.
- [x] **README.md** updated with the new features, key bindings,
      page table, "Adding a cheatsheet entry" / "Adding a boss
      level" sections, and a "Deploying to GitHub Pages" section.

## Future ideas

- [ ] Optional syntax highlighting in markdown via `rehype-pretty-code`
      or `shiki`. Currently the CodeBlock adds a language label and
      a copy button but keeps the plain mono look.
- [ ] A `?hl=` deep-link on the lessons index that pre-applies a
      search query, so blog posts can link directly to filtered
      catalogues.
- [ ] Optional IndexedDB mirror of the progress store, so visitors
      who clear cookies don't lose everything.
- [ ] Real Playwright tests: cover the `g l` shortcut, the
      Cmd/Ctrl+K palette, the theme toggle persistence, the
      cheatsheet search, the boss "Recover the server" happy path,
      and the quiz passing flow.
- [ ] An "Export progress as JSON" / "Import progress" pair, so
      learners can move between machines.
- [ ] Light/dark syntax colors for the xterm theme that match the
      site theme.
- [ ] More boss levels: build & install a small script, configure
      `systemd` (simulated), debug a permission issue across
      `chmod`/`chown`, etc.
- [ ] Internationalisation: extract the hard-coded English strings
      to a messages file and add a `?lang=` switch.
