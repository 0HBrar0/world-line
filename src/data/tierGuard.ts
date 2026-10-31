import { canon } from './load';
import type { Tier } from './schema';

/**
 * canon.json tiers objects, not individual strings, so some low-tier strings still name later
 * content (a premise event that names the attractor fields, a premise glossary entry that lists
 * every Lab member). This guard scans text for names and values that are locked at the viewer's
 * tier and drops the clause that contains them. It only ever hides text; it never rewrites it.
 * Every string it affects at its own tier is listed in docs/open-questions.md.
 */

const ORDER = canon.meta.spoilerTiers.map((t) => t.id);
const rank = (tier: Tier) => ORDER.indexOf(tier);

interface Lock {
  pattern: RegExp;
  tier: Tier;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const word = (s: string) => new RegExp(`(?<![\\w-])${escapeRe(s)}(?![\\w-])`);

// Too generic to treat as names, or needed by premise-tier explanations of the mechanics.
const NOT_LOCKABLE = new Set([
  'fate', 'field', 'gel', 'time leap', 'the lab', 'ibn', 'upa', 'dr.', 'mr.', 'real', 'name', 'titor', 'john', 'john titor', 'barrel',
  'ruka', 'braun', 'goose',
]);

function buildLocks(): Lock[] {
  const tierByToken = new Map<string, Tier>();
  const add = (token: string, tier: Tier) => {
    const clean = token.trim();
    if (clean.length < 2 || NOT_LOCKABLE.has(clean.toLowerCase())) return;
    const seen = tierByToken.get(clean);
    if (!seen || rank(tier) < rank(seen)) tierByToken.set(clean, tier);
  };

  for (const c of canon.characters) {
    const nameWords = c.name.replace(/\(.*\)/, '').split(/\s+/);
    nameWords.filter((w) => /^[A-Z]/.test(w) && w.length > 2).forEach((w) => add(w.replace(/[.,]/g, ''), c.firstSpoilerTier));
    for (const a of c.aliases) {
      const name = a.name.replace(/\(.*\)/, '').trim();
      const tier = rank(a.spoilerTier) > rank(c.firstSpoilerTier) ? a.spoilerTier : c.firstSpoilerTier;
      add(name, tier);
    }
  }

  for (const g of canon.glossary) {
    if (g.realWorld) continue;
    const head = g.term.replace(/\(.*\)/, '').replace(/^'|'$/g, '').trim();
    [head, ...g.aliases.map((a) => a.replace(/\(.*\)/, '').trim())].forEach((token) => {
      if (token.length >= 4 && !/^\d/.test(token) && !token.includes('%')) add(token, g.spoilerTier);
    });
  }

  // Names the field rules single out: attractor-field vocabulary stays hidden below sg_part2.
  ['Alpha', 'Beta', 'Omega', 'attractor field', 'Attractor Field', 'Attractor field', 'attractor fields', 'convergence', 'Convergence', '0.x', '1.x'].forEach(
    (t) => add(t, 'sg_part2'),
  );
  add('Steins Gate', 'sg_ending');

  const locks: Lock[] = [...tierByToken].filter(([, tier]) => tier !== 'premise').map(([token, tier]) => ({ pattern: word(token), tier }));
  locks.push({ pattern: /(?<![\d.])1%/, tier: 'sg_part1' });
  return locks;
}

const LOCKS = buildLocks();
// 0.000000 is also how the wikis write the floor of the Alpha range, so it is not a line reference.
const LINE_TIER = new Map(canon.worldLines.filter((w) => w.divergence && w.divergenceNumeric !== 0).map((w) => [w.divergence!.replace('-', ''), w.spoilerTier]));

/** The tier that a string needs before it is safe to show, from what it mentions. */
export function textTier(text: string): Tier {
  let highest: Tier = 'premise';
  for (const lock of LOCKS) {
    if (rank(lock.tier) > rank(highest) && lock.pattern.test(text)) highest = lock.tier;
  }
  for (const match of text.matchAll(/\d\.\d{6}/g)) {
    const tier = LINE_TIER.get(match[0]);
    if (tier && rank(tier) > rank(highest)) highest = tier;
  }
  return highest;
}

export function isTextSafe(text: string, tier: Tier): boolean {
  return rank(textTier(text)) <= rank(tier);
}

/** Splits on sentence ends and semicolons, but never inside parentheses or after an abbreviation. */
export function splitClauses(text: string): string[] {
  const clauses: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    const atBreak = depth === 0 && (ch === '.' || ch === ';' || ch === '!' || ch === '?') && text[i + 1] === ' ';
    if (atBreak && !/(?:Dr|Mr|Ms|Mrs|ep|eps|vs|Ch|Jan|Feb|Aug|Sept|Nov|Dec)$/.test(text.slice(start, i))) {
      clauses.push(text.slice(start, i + 1));
      start = i + 2;
    }
  }
  clauses.push(text.slice(start));
  return clauses.filter(Boolean);
}

/**
 * The part of `text` that is safe at `tier`: the whole string when nothing is locked, otherwise
 * the surviving clauses followed by an ellipsis, or '' when nothing survives.
 */
export function safeText(text: string, tier: Tier): string {
  if (isTextSafe(text, tier)) return text;
  const kept = splitClauses(text).filter((clause) => isTextSafe(clause, tier));
  return kept.length > 0 ? `${kept.join(' ').replace(/;$/, '.')} …` : '';
}
