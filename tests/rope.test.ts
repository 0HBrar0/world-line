import { describe, expect, it } from 'vitest';
import { canon } from '../src/data/load';
import type { Media } from '../src/data/schema';
import { buildMapModel } from '../src/features/map/layout';

const media: Media[] = ['vn', 'anime'];
const build = (tier: Parameters<typeof buildMapModel>[0]) => buildMapModel(tier, media, 'seq', 600);

describe('rope map layout', () => {
  it('draws no rope or knot before the story explains them', () => {
    expect(build('premise').ropes).toEqual([]);
    expect(build('sg_part1').ropes).toEqual([]);
    expect(build('sg_part2').ropes.map((r) => r.kind).sort()).toEqual(['alpha', 'beta']);
  });

  it('gives every world line on the map one thread, and puts rope threads into a knot', () => {
    const model = build('sg_part2');
    expect(model.threads.map((t) => t.lineId).sort()).toEqual(model.rows.flatMap((r) => (r.lineId ? [r.lineId] : [])).sort());
    for (const rope of model.ropes) {
      expect(rope.knotX).toBeGreaterThan(Math.max(...model.nodes.map((n) => n.x)));
      expect(rope.knotY).toBeGreaterThanOrEqual(rope.ys[0]);
      expect(rope.knotY).toBeLessThanOrEqual(rope.ys[rope.ys.length - 1]);
    }
  });

  it('numbers hops per kind of jump in the order lived', () => {
    const model = build('sg_part2');
    const numbered = (mechanism: string) => model.edges.filter((e) => e.mechanism === mechanism).map((e) => e.number);
    expect(numbered('dmail')).toEqual([1, 2, 3, 4, 5, 6]);
    expect(numbered('dmail_cancellation')).toEqual([1, 2, 3, 4]);
  });

  it('keeps the red strand moving left to right in the order lived', () => {
    const model = build('sg_ending');
    const main = model.edges.filter((e) => !e.branch && !e.collapsed);
    const xs = main.map((e) => e.from.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('marks a side ending as a branch and stops at the last event of the main story', () => {
    const model = build('sg_ending');
    const sideCauses = new Set(canon.events.filter((e) => e.lane === 'sg_vn_ending').map((e) => e.id));
    expect(model.edges.filter((e) => e.branch).length).toBeGreaterThan(0);
    for (const e of model.edges.filter((x) => x.branch)) expect(sideCauses.has(e.fromNode!)).toBe(true);
    expect(sideCauses.has(model.latestId!)).toBe(false);
  });
});
