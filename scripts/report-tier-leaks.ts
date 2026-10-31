// Lists every canon string the tier guard trims at its own tier, for docs/open-questions.md.
// Usage: npx tsx scripts/report-tier-leaks.ts
import { canon } from '../src/data/load';
import { effectiveTier } from '../src/data/selectors';
import { textTier, isTextSafe } from '../src/data/tierGuard';
import type { Tier } from '../src/data/schema';

const rows: string[] = [];
const check = (id: string, field: string, text: string | null | undefined, tier: Tier) => {
  if (text && !isTextSafe(text, tier)) rows.push(`| \`${id}\` | ${field} | ${tier} | ${textTier(text)} |`);
};

for (const c of canon.characters) {
  check(c.id, 'role', c.role, c.firstSpoilerTier);
  c.relationships.forEach((r, i) => check(c.id, `relationships[${i}].type`, r.type, effectiveTier(r, c)));
  if (c.readingSteiner) check(c.id, 'readingSteiner.notes', c.readingSteiner.notes, effectiveTier(c.readingSteiner, c));
}
for (const g of canon.glossary) {
  check(g.id, 'plainLanguage', g.plainLanguage, g.spoilerTier);
  check(g.id, 'details', g.details, g.spoilerTier);
}
for (const w of canon.worldLines) {
  check(w.id, 'whatIsDifferent', w.whatIsDifferent, w.spoilerTier);
  w.alternateValues.forEach((a, i) => check(w.id, `alternateValues[${i}].note`, a.note, w.spoilerTier));
  [...w.aliveDead.alive, ...w.aliveDead.dead].forEach((a) => check(w.id, `aliveDead(${a.characterId}).note`, a.note, effectiveTier(a, w)));
}
for (const e of canon.events) {
  check(e.id, 'summary', e.summary, e.spoilerTier);
  check(e.id, 'whatChanged', e.whatChanged, e.spoilerTier);
  check(e.id, 'dateNote', e.dateNote, e.spoilerTier);
  e.conflicts.forEach((x, i) => check(e.id, `conflicts[${i}]`, x.claim, e.spoilerTier));
}
for (const t of canon.transitions) check(t.id, 'description', t.description, t.spoilerTier);
for (const m of canon.mechanics) {
  check(m.id, 'oneLiner', m.oneLiner, m.spoilerTier);
  check(m.id, 'whatTravels', m.whatTravels, m.spoilerTier);
  check(m.id, 'whatDoesNotTravel', m.whatDoesNotTravel, m.spoilerTier);
  m.limits.forEach((l, i) => check(m.id, `limits[${i}]`, l.text, effectiveTier(l, m)));
  m.commonMisconceptions.forEach((x, i) => {
    check(m.id, `misconceptions[${i}].claim`, x.claim, m.spoilerTier);
    check(m.id, `misconceptions[${i}].correction`, x.correction, m.spoilerTier);
  });
}
for (const d of canon.disputes) {
  check(d.id, 'topic', d.topic, d.spoilerTier);
  d.versions.forEach((v, i) => check(d.id, `versions[${i}]`, v.claim, d.spoilerTier));
  check(d.id, 'betterSupported', d.betterSupported, d.spoilerTier);
}
canon.meta.spoilerTiers.forEach((t) => check(t.id, 'covers', t.covers, t.id));

console.log('| Canon id | Field | Own tier | Text needs |\n|---|---|---|---|');
console.log(rows.join('\n'));
console.error(`${rows.length} strings`);
