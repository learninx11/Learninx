/**
 * Tiny utility for extracting a table of contents from Markdown.
 *
 * We only need the `##` level (matching the `prose-lx h2` style) — a
 * learner-facing ToC for short lessons should not be noisy. Headings
 * inside fenced code blocks (```) are ignored.
 */

export interface TocEntry {
  id: string;
  text: string;
}

export function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n');
  const entries: TocEntry[] = [];
  let inFence = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (!line.startsWith('## ')) continue;
    // Skip H1 lines (which would be the page title).
    if (line.startsWith('### ')) continue;
    const text = line.slice(3).trim();
    if (!text) continue;
    entries.push({ id: slugify(text), text });
  }
  return entries;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}
