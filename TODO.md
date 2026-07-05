# TODO

This file tracks remaining polish items. The big UI/UX overhaul is complete:
all main pages and components now use the shared design tokens (`lx-card`,
`lx-btn`, `lx-pill`, `lx-input`, `lx-progress`), icons are inline SVGs, the
home page has a progress bar and a "first-visit" CTA, the lessons index
groups lessons by difficulty, the lesson detail page fixes the broken
`lg:ml` calc, the Terminal now supports paste + history + tab completion
+ ARIA, and the README/TODO have been brought up to date.

## Done in this pass

- [x] Add reusable UI tokens (`--lx-*` CSS variables) and a small component
      library (`.lx-card`, `.lx-btn`, `.lx-pill`, `.lx-input`, `.lx-progress`,
      `.lx-kbd`, `.lx-skip-link`, `.lx-scroll-progress`, `.lx-pulse-success`).
- [x] Replace all hardcoded colors with tokenized Tailwind utilities
      (`bg-[var(--lx-card)]`, `text-[var(--lx-accent)]`, etc.).
- [x] Add an inline SVG icon set (`src/components/ui/Icon.tsx`) — no new
      npm dependency required.
- [x] Rewrite `src/app/page.tsx` with a progress bar, gradient brand text,
      and "first visit vs continuing learner" copy.
- [x] Rewrite `src/app/lessons/page.tsx` with progress summary, lessons
      grouped by difficulty, color-coded pills, and accessible rows.
- [x] Rewrite `src/app/lessons/[slug]/page.tsx`:
      - proper two-column grid (no fragile `ml-[max(...)]` calc);
      - reading time, scroll-progress bar, and "next lesson" CTA card;
      - `<Terminal>` suggestion uses `lesson.solution` for `expected` and
        `lesson.trackCommand` (falling back) for the visible `command`.
- [x] Improve `src/components/Terminal.tsx`:
      - autofocus on mount (`requestAnimationFrame` + `term.focus()`);
      - real Tab completion (first token) against known command names;
      - clipboard paste via `Ctrl+Shift+V`;
      - additional keybindings (Ctrl+U/A/E/W);
      - larger, colorized xterm theme;
      - accessible `aria-label` on the wrapper and a status footer.
- [x] Improve `src/components/ChallengeRunner.tsx`:
      - real `<label>` for the input;
      - show-hide hint that masks everything past the first token;
      - polished success / error banners.
- [x] Improve `src/components/LessonQuiz.tsx`:
      - real `<label>` for each input;
      - inline ✓/✗ per question;
      - previous attempt badge;
      - explicit retry button.
- [x] Improve `src/components/CompleteButton.tsx` — drop the fake "+10 pts"
      copy and use the shared button styles.
- [x] Improve `src/components/Markdown.tsx` — pipe fenced code blocks
      through a new `CodeBlock` that adds language label + copy button.
- [x] Add `src/components/ui/ScrollProgress.tsx` (fixed top progress bar
      for long lessons).
- [x] Add `src/components/KeyboardShortcuts.tsx` (`g l` → lessons,
      `g h` → home; respects form fields).
- [x] Add `src/components/ResetProgressButton.tsx` + a server action
      (`resetProgressAction`) that wipes the progress cookie.
- [x] Update `src/app/loading.tsx` and `src/app/not-found.tsx` to use the
      new design system.
- [x] Layout: add a skip-to-content link, `themeColor` viewport meta, and
      `prefers-reduced-motion` handling in `globals.css`.
- [x] Update `src/app/lessons/[slug]/actions.ts`: add `passed` to the quiz
      response, add `resetProgressAction`, and remove misleading "🎉"
      copy from challenge success messages.
- [x] Production build passes (`npm run build`) with no warnings.
- [x] Update `README.md` to document the new keyboard shortcuts, design
      system, and `LEARNINX_SECRET` env var.

## Future ideas

- [ ] A real points/streak system (the "Mark complete" copy is honest now,
      but a streak counter would still be fun).
- [ ] Search and filter on the lessons index.
- [ ] Light mode (`:root.light` swap of `--lx-*` tokens; a theme toggle
      in the header).
- [ ] Optional syntax highlighting in markdown via `rehype-pretty-code` or
      `shiki`. Currently the new `CodeBlock` adds a language label and
      a copy button but keeps the plain mono look.
- [ ] A reading-time-aware table of contents for long lessons.
- [ ] Persist the per-browser progress to a local IndexedDB mirror so
      visitors who clear cookies don't lose everything.
- [ ] Real-time tests: add Playwright flows for the "g l" shortcut,
      the sandbox paste, and the challenge / quiz happy paths.
