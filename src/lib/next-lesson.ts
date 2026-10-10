/**
 * "Where should this learner go next?" — shared by the home page, the
 * lessons hub, and the command palette so they always agree.
 */

interface OrderedLesson {
  id: string;
  order: number;
}

/**
 * The first unfinished lesson after the furthest one the learner has
 * completed (catalogue order), wrapping round to the earliest gap.
 * `null` when nothing is complete yet or everything is.
 */
export function findNextLesson<T extends OrderedLesson>(
  lessons: readonly T[],
  completed: ReadonlySet<string>,
): T | null {
  if (completed.size === 0) return null;
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  let furthest = -1;
  sorted.forEach((lesson, i) => {
    if (completed.has(lesson.id)) furthest = i;
  });
  if (furthest === -1) return null;
  const after = sorted.slice(furthest + 1).find((l) => !completed.has(l.id));
  return after ?? sorted.find((l) => !completed.has(l.id)) ?? null;
}
