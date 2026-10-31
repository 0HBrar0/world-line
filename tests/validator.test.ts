import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dateBounds, validateCanon } from '../src/data/validate';

const shipped = JSON.parse(readFileSync('data/canon.json', 'utf8'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mutable = any;

function mutated(change: (c: Mutable) => void): string[] {
  const copy = structuredClone(shipped);
  change(copy);
  return validateCanon(copy).errors;
}

const eventById = (c: Mutable, id: string) => c.events.find((e: Mutable) => e.id === id);
const lineById = (c: Mutable, id: string) => c.worldLines.find((w: Mutable) => w.id === id);

describe('validateCanon', () => {
  it('passes the shipped canon.json', () => {
    const result = validateCanon(shipped);
    expect(result.errors).toEqual([]);
    expect(result.counts.events).toBe(55);
  });

  it('treats partial dates as intervals', () => {
    expect(dateBounds('2010-08')).toEqual(['2010-08-01', '2010-08-31']);
    expect(dateBounds('2025')).toEqual(['2025-01-01', '2025-12-31']);
  });

  const cases: Array<[string, (c: Mutable) => void, RegExp]> = [
    ['schema: unknown key', (c) => (c.events[0].bogus = 1), /schema/],
    ['schema: bad tier id', (c) => (c.events[0].spoilerTier = 'nope'), /schema/],
    ['schema: bad confidence', (c) => (c.glossary[0].confidence = 'SURE'), /schema/],
    ['duplicate id', (c) => (c.glossary[1].id = c.glossary[0].id), /duplicate id/],
    ['broken characterId', (c) => (c.events[0].characterIds = ['ghost']), /unresolved ref ghost/],
    ['broken relationship characterId', (c) => (c.characters[0].relationships[0].characterId = 'ghost'), /unresolved ref ghost/],
    ['broken sourceId', (c) => (c.events[0].sourceIds = ['src-ghost']), /unknown source/],
    ['broken worldLineBefore', (c) => (c.events[0].worldLineBefore = 'wl-ghost'), /unresolved ref wl-ghost/],
    ['broken transition from', (c) => (c.transitions[0].from = 'wl-ghost'), /unresolved ref wl-ghost/],
    ['broken worldLineId', (c) => (c.endings[0].worldLineId = 'wl-ghost'), /unresolved ref wl-ghost/],
    ['broken branchWorldLineId', (c) => (c.sg0Branch.branchWorldLineId = 'wl-ghost'), /unresolved ref wl-ghost/],
    ['broken forkFromWorldLineId', (c) => (c.sg0Branch.forkFromWorldLineId = 'wl-ghost'), /unresolved ref wl-ghost/],
    ['broken cause', (c) => (c.transitions[0].cause = 'ev-ghost'), /unresolved ref ev-ghost/],
    ['broken keyEventIds', (c) => c.worldLines[0].keyEventIds.push('ev-ghost'), /unresolved ref ev-ghost/],
    ['broken dmailsSent', (c) => c.characters[0].dmailsSent.push('ev-ghost'), /unresolved ref ev-ghost/],
    ['broken reconnection id', (c) => (c.sg0Branch.reconnection.fromEventId = 'ev-ghost'), /unresolved ref ev-ghost/],
    ['broken transitionId', (c) => (eventById(c, 'ev-0728-first-dmail').transitionId = 'tr-ghost'), /unresolved ref tr-ghost/],
    ['broken glossary relatedIds', (c) => c.glossary[0].relatedIds.push('gl-ghost'), /unresolved ref gl-ghost/],
    ['empty top-level sources', (c) => (c.events[0].sourceIds = []), /empty sourceIds/],
    ['empty nested sources', (c) => (c.mechanics[0].steps[0].sourceIds = []), /empty sourceIds/],
    ['cites a failed source', (c) => (c.events[0].sourceIds = ['src-fandom-phonewave-a']), /unusable source/],
    ['dispute not UNCLEAR', (c) => (c.disputes[0].confidence = 'CONFIRMED'), /must be UNCLEAR/],
    ['dispute version without sources', (c) => (c.disputes[0].versions[0].sourceIds = []), /version without source/],
    ['events out of order', (c) => (eventById(c, 'ev-0729-sern-hack').sortDate = '2009-01-01'), /event order/],
    ['transition from mismatch', (c) => (c.transitions[0].from = 'wl-alpha-0571015'), /transition mismatch/],
    ['transition cause does not point back', (c) => (eventById(c, 'ev-0803-dmail-loto6').transitionId = null), /does not point back/],
    ['line change without transition', (c) => (eventById(c, 'ev-0729-sern-hack').worldLineAfter = 'wl-alpha-0571015'), /without transition/],
    ['alpha line in beta band', (c) => Object.assign(lineById(c, 'wl-alpha-0571024'), { divergence: '1.571024', divergenceNumeric: 1.571024 }), /alpha out of band/],
    ['beta line in alpha band', (c) => Object.assign(lineById(c, 'wl-beta-1130205'), { divergence: '0.130205', divergenceNumeric: 0.130205 }), /beta out of band/],
    ['numeric differs from string', (c) => (lineById(c, 'wl-alpha-0571024').divergenceNumeric = 0.5), /numeric mismatch/],
    ['duplicate seq', (c) => (c.events[1].seq = c.events[0].seq), /duplicate seq/],
    ['premise line without premiseLabel', (c) => delete lineById(c, 'wl-beta-1130426').premiseLabel, /needs premiseLabel/],
    ['premise line with untiered fate', (c) => delete lineById(c, 'wl-beta-1130426').aliveDead.alive[0].spoilerTier, /untiered fate/],
    ['reveal below parent tier', (c) => (eventById(c, 'ev-0729-sern-hack').reveals = [{ text: 'x', confidence: 'CONFIRMED', sourceIds: ['src-wp-episodes'], spoilerTier: 'premise' }]), /reveal tier below parent/],
  ];

  it.each(cases)('catches: %s', (_name, change, expected) => {
    const errors = mutated(change);
    expect(errors.join('\n')).toMatch(expected);
  });
});
