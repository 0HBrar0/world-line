import { describe, expect, it } from 'vitest';
import { canon } from '../src/data/load';
import {
  charactersOnLine,
  collapsedEdges,
  disputesFor,
  effectiveTier,
  eventsByCalendar,
  eventsBySeq,
  glossarySearchIndex,
  isVisible,
  lineFromPublicId,
  lineLabel,
  pathBetween,
  publicLineId,
  sourcesFor,
  transitionsFor,
  visibleEvents,
  visibleLines,
  worldLineById,
} from '../src/data/selectors';
import { isTextSafe, safeText, splitClauses, textTier } from '../src/data/tierGuard';
import type { Media } from '../src/data/schema';

const MAIN: Media[] = ['vn', 'anime'];

describe('tier logic', () => {
  it('takes the max over ancestors', () => {
    const line = worldLineById('wl-beta-1130426')!;
    const entry = line.aliveDead.alive[0];
    expect(effectiveTier(entry, line)).toBe('sg_part2');
    expect(effectiveTier({ spoilerTier: 'premise' }, { spoilerTier: 'sg0' })).toBe('sg0');
    expect(effectiveTier({ firstSpoilerTier: 'sg_part1' })).toBe('sg_part1');
  });

  it('checks tier and media together', () => {
    const e = { spoilerTier: 'sg_part1' as const, media: ['vn' as const] };
    expect(isVisible(e, 'premise', MAIN)).toBe(false);
    expect(isVisible(e, 'sg_part1', ['anime'])).toBe(false);
    expect(isVisible(e, 'sg_part1', MAIN)).toBe(true);
  });

  it('never returns a locked event', () => {
    for (const tier of canon.meta.spoilerTiers.map((t) => t.id)) {
      const allowed = canon.meta.spoilerTiers.find((t) => t.id === tier)!.order;
      for (const e of visibleEvents(tier, MAIN)) {
        expect(canon.meta.spoilerTiers.find((t) => t.id === e.spoilerTier)!.order).toBeLessThanOrEqual(allowed);
      }
    }
  });
});

describe('orders', () => {
  it('puts the rescue attempts on July 28 in calendar order and late in seq order', () => {
    const calendar = eventsByCalendar().map((e) => e.id);
    const seq = eventsBySeq().map((e) => e.id);
    expect(calendar.indexOf('ev-0728-rescue-attempt-1')).toBeLessThan(10);
    expect(seq.indexOf('ev-0728-rescue-attempt-1')).toBeGreaterThan(25);
  });
});

describe('graph selectors', () => {
  it('finds transitions', () => {
    const { incoming, outgoing } = transitionsFor('wl-alpha-0571024');
    expect(incoming.map((t) => t.id)).toEqual(['tr-first-dmail']);
    expect(outgoing.map((t) => t.id)).toEqual(['tr-loto6']);
  });

  it('collapses edges through lines the media filter hides', () => {
    const edges = collapsedEdges(['anime']);
    const edge = edges.find((e) => e.from === 'wl-beta-1130205' && e.to === 'wl-sg-1048596');
    expect(edge?.hiddenSteps).toBe(2);
    expect(edge?.transitionIds).toEqual(['tr-trip-1', 'tr-trip-2', 'tr-steins-gate']);
  });

  it('does not walk through a tier-locked line', () => {
    expect(collapsedEdges(['anime'], 'premise')).toEqual([]);
  });

  it('runs a directed shortest path', () => {
    const path = pathBetween('wl-alpha-0571024', 'wl-sg-1048596');
    expect(path?.[0].id).toBe('tr-loto6');
    expect(path?.at(-1)?.id).toBe('tr-steins-gate');
    expect(pathBetween('wl-sg-1048596', 'wl-alpha-0571024')).toBeNull();
    expect(pathBetween('wl-beta-1097302', 'wl-sg-1048596')).toBeNull();
  });

  it('lists characters on a line from canon only', () => {
    expect(charactersOnLine('wl-beta-1130426')).toContain('kurisu');
    expect(charactersOnLine('wl-beta-1130427')).toEqual([]);
  });
});

describe('text selectors', () => {
  it('builds a tier-safe glossary index', () => {
    const premise = glossarySearchIndex('premise').map((g) => g.id);
    expect(premise).toContain('gl-dmail');
    expect(premise).not.toContain('gl-amadeus');
    expect(glossarySearchIndex('sg0').map((g) => g.id)).toContain('gl-amadeus');
  });

  it('resolves sources and disputes', () => {
    expect(sourcesFor({ sourceIds: ['src-fandom-dmail'] })[0].url).toContain('fandom');
    expect(disputesFor('ev-0728-first-dmail').map((d) => d.id)).toEqual(['dsp-first-dmail-arrival']);
    expect(disputesFor('gl-steins-gate-line', 'premise')).toEqual([]);
  });

  it('keeps field names out of public line ids', () => {
    expect(publicLineId('wl-alpha-0571024')).toBe('wl-0571024');
    expect(lineFromPublicId('wl-0571024')?.id).toBe('wl-alpha-0571024');
  });

  it('labels premise lines with premiseLabel', () => {
    const line = worldLineById('wl-alpha-0571024')!;
    expect(lineLabel(line, 'premise')).toBe(line.premiseLabel);
    expect(lineLabel(line, 'sg_part2')).toBe(line.label);
  });

  it('hides the spin-off gutter without extras and the Other chip', () => {
    expect(visibleLines('sg0', [...MAIN, 'other']).some((l) => l.lane === 'spinoff')).toBe(false);
    expect(visibleLines('extras', MAIN).some((l) => l.lane === 'spinoff')).toBe(false);
    expect(visibleLines('extras', [...MAIN, 'other']).some((l) => l.lane === 'spinoff')).toBe(true);
  });
});

describe('tier guard', () => {
  it('finds names and values above the viewer tier', () => {
    expect(textTier('The world shifts to the Alpha field')).toBe('sg_part2');
    expect(textTier('Suzuha works here')).toBe('sg_part1');
    expect(textTier('value 1.048596 here')).toBe('sg_ending');
    expect(textTier('Okabe texts Daru')).toBe('premise');
  });

  it('keeps Steins;Gate titles but locks the Steins Gate line', () => {
    expect(isTextSafe('Steins;Gate 0 is a sequel', 'premise')).toBe(true);
    expect(isTextSafe('the Steins Gate line', 'premise')).toBe(false);
  });

  it('drops only the unsafe clause', () => {
    const text = 'The world shifts from the Beta field to the Alpha field; Kurisu is alive.';
    expect(splitClauses(text)).toHaveLength(2);
    expect(safeText(text, 'premise')).toBe('Kurisu is alive. …');
    expect(safeText(text, 'sg_part2')).toBe(text);
    expect(safeText('Alpha.', 'premise')).toBe('');
  });

  it('never splits inside parentheses', () => {
    expect(splitClauses('Near value (one vs two; three vs four). Next.')).toHaveLength(2);
  });

  it('leaves every mechanic caption at or below its own tier intact', () => {
    for (const m of canon.mechanics) {
      for (const s of m.steps) {
        const tier = effectiveTier(s, m);
        expect(safeText(s.caption, tier), s.caption).toBe(s.caption);
      }
    }
  });
});
