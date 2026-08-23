/**
 * Tiny shared module that lets the lesson detail page publish its
 * prev/next neighbours, so the global `KeyboardShortcuts` handler can
 * navigate with `g n` / `g p` without coupling the two components.
 *
 * The current neighbours are stored in a module-scoped variable. There
 * is only ever one lesson page mounted at a time, so a single slot is
 * enough.
 */

export interface LessonNeighbours {
  previous: { slug: string } | null;
  next: { slug: string } | null;
}

let current: LessonNeighbours | null = null;
const listeners = new Set<(n: LessonNeighbours | null) => void>();

export function setLessonNeighbours(next: LessonNeighbours | null) {
  current = next;
  for (const fn of listeners) fn(current);
}

export function getLessonNeighbours(): LessonNeighbours | null {
  return current;
}

export function onLessonNeighboursChange(
  fn: (n: LessonNeighbours | null) => void,
): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
