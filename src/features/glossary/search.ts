import type { GlossaryIndexEntry } from '../../data/selectors';

function trigrams(text: string): Set<string> {
  const padded = `  ${text.toLowerCase()} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i += 1) grams.add(padded.slice(i, i + 3));
  return grams;
}

function similarity(a: string, b: string): number {
  const x = trigrams(a);
  const y = trigrams(b);
  let shared = 0;
  x.forEach((g) => {
    if (y.has(g)) shared += 1;
  });
  return shared / Math.max(x.size, 1);
}

/** Fuzzy search over the tier-safe index only: exact hits first, close spellings after. */
export function searchGlossary(index: GlossaryIndexEntry[], query: string): GlossaryIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return index;
  const scored = index.flatMap((entry) => {
    const names = [entry.term, ...entry.aliases];
    const lowerNames = names.map((n) => n.toLowerCase());
    let score = 0;
    if (lowerNames.some((n) => n.includes(q))) score = 3;
    else if (entry.plainLanguage.toLowerCase().includes(q)) score = 2;
    else if (q.length >= 3 && Math.max(...names.flatMap((n) => n.split(/\s+/).map((w) => similarity(q, w)))) >= 0.5) score = 1;
    return score > 0 ? [{ entry, score }] : [];
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}
