import { canon } from './load';
import { DISPUTE_LINKS } from './disputeLinks';
import { safeText } from './tierGuard';
import type { Character, Dispute, GlossaryEntry, Media, Mechanic, Mechanism, Source, StoryEvent, Tier, Transition, WorldLine } from './schema';

export type EventOrder = 'seq' | 'calendar';

const ORDER = canon.meta.spoilerTiers.map((t) => t.id);
export const tierRank = (tier: Tier): number => ORDER.indexOf(tier);
export const atLeast = (tier: Tier, floor: Tier): boolean => tierRank(tier) >= tierRank(floor);

interface Tiered {
  spoilerTier?: Tier;
  firstSpoilerTier?: Tier;
  media?: Media[];
}

export function maxTier(...tiers: Tier[]): Tier {
  return tiers.reduce((best, t) => (tierRank(t) > tierRank(best) ? t : best), 'premise' as Tier);
}

/** Effective tier: the highest of the object's own tier and every ancestor's. */
export function effectiveTier(obj: Tiered, ...ancestors: Tiered[]): Tier {
  return maxTier(...[obj, ...ancestors].map((o) => o.spoilerTier ?? o.firstSpoilerTier ?? 'premise'));
}

export function isVisible(obj: Tiered, tier: Tier, media?: Media[], ...ancestors: Tiered[]): boolean {
  if (tierRank(effectiveTier(obj, ...ancestors)) > tierRank(tier)) return false;
  if (media && obj.media) return obj.media.some((m) => media.includes(m));
  return true;
}

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
const eventsMap = byId(canon.events);
const linesMap = byId(canon.worldLines);
const transitionsMap = byId(canon.transitions);
const charactersMap = byId(canon.characters);
const glossaryMap = byId(canon.glossary);
const sourcesMap = byId(canon.sources);
const mechanicsMap = byId(canon.mechanics);

export const eventById = (id: string): StoryEvent | undefined => eventsMap.get(id);
export const worldLineById = (id: string): WorldLine | undefined => linesMap.get(id);
export const transitionById = (id: string): Transition | undefined => transitionsMap.get(id);
export const characterById = (id: string): Character | undefined => charactersMap.get(id);
export const glossaryById = (id: string): GlossaryEntry | undefined => glossaryMap.get(id);
export const mechanicById = (id: string): Mechanic | undefined => mechanicsMap.get(id as Mechanic['id']);

/** Array order in canon.json is calendar order. */
export const eventsByCalendar = (): StoryEvent[] => [...canon.events];
export const eventsBySeq = (): StoryEvent[] => [...canon.events].sort((a, b) => a.seq - b.seq);

export function visibleEvents(tier: Tier, media: Media[], order: EventOrder = 'seq'): StoryEvent[] {
  const source = order === 'seq' ? eventsBySeq() : eventsByCalendar();
  return source.filter((e) => isVisible(e, tier, media));
}

export function visibleLines(tier: Tier, media: Media[]): WorldLine[] {
  return canon.worldLines.filter((w) => {
    if (!isVisible(w, tier, media)) return false;
    // The spin-off gutter needs both the extras tier and the Other chip.
    return w.lane !== 'spinoff' || (tier === 'extras' && media.includes('other'));
  });
}

export function transitionsFor(lineId: string): { incoming: Transition[]; outgoing: Transition[] } {
  return {
    incoming: canon.transitions.filter((t) => t.to === lineId),
    outgoing: canon.transitions.filter((t) => t.from === lineId),
  };
}

/** A transition is only as public as both lines and the event that causes it. */
export function transitionTier(t: Transition): Tier {
  const from = worldLineById(t.from);
  const to = worldLineById(t.to);
  const cause = eventById(t.cause);
  return maxTier(t.spoilerTier, from?.spoilerTier ?? 'premise', to?.spoilerTier ?? 'premise', cause?.spoilerTier ?? 'premise');
}

export function visibleTransitions(tier: Tier, media: Media[]): Transition[] {
  const lines = new Set(visibleLines(tier, media).map((l) => l.id));
  return canon.transitions.filter(
    (t) => tierRank(transitionTier(t)) <= tierRank(tier) && t.media.some((m) => media.includes(m)) && lines.has(t.from) && lines.has(t.to),
  );
}

export interface CollapsedEdge {
  id: string;
  from: string;
  to: string;
  mechanism: Mechanism;
  transitionIds: string[];
  hiddenSteps: number;
}

/**
 * Joins transitions through world lines hidden by the media filter. Generated for the UI only and
 * never written back. Lines locked by tier are not walked through, so nothing leaks past a tier.
 */
export function collapsedEdges(media: Media[], tier: Tier = 'extras'): CollapsedEdge[] {
  const shown = new Set(visibleLines(tier, media).map((l) => l.id));
  const tierOpen = (t: Transition) => tierRank(transitionTier(t)) <= tierRank(tier);
  const edges: CollapsedEdge[] = [];

  const walk = (start: string, at: string, trail: Transition[]) => {
    for (const t of canon.transitions.filter((x) => x.from === at && tierOpen(x))) {
      if (trail.some((x) => x.id === t.id)) continue;
      const next = [...trail, t];
      if (shown.has(t.to)) {
        if (next.length > 1) {
          edges.push({
            id: `collapsed:${start}:${t.to}`,
            from: start,
            to: t.to,
            mechanism: t.mechanism,
            transitionIds: next.map((x) => x.id),
            hiddenSteps: next.length - 1,
          });
        }
      } else {
        walk(start, t.to, next);
      }
    }
  };
  shown.forEach((lineId) => walk(lineId, lineId, []));
  return edges;
}

/** Shortest directed path over transitions, or null when none is mapped. */
export function pathBetween(a: string, b: string, allowed: Transition[] = canon.transitions): Transition[] | null {
  if (a === b) return [];
  const queue: Array<{ line: string; path: Transition[] }> = [{ line: a, path: [] }];
  const seen = new Set([a]);
  while (queue.length > 0) {
    const { line, path } = queue.shift()!;
    for (const t of allowed.filter((x) => x.from === line)) {
      if (seen.has(t.to)) continue;
      const next = [...path, t];
      if (t.to === b) return next;
      seen.add(t.to);
      queue.push({ line: t.to, path: next });
    }
  }
  return null;
}

export function eventsOnLine(lineId: string): StoryEvent[] {
  return canon.events.filter((e) => e.worldLineBefore === lineId || e.worldLineAfter === lineId);
}

/** Characters canon attaches to a line through aliveDead or through its events. */
export function charactersOnLine(lineId: string): string[] {
  const line = worldLineById(lineId);
  if (!line) return [];
  const ids = [...line.aliveDead.alive, ...line.aliveDead.dead].map((a) => a.characterId);
  eventsOnLine(lineId).forEach((e) => ids.push(...e.characterIds));
  return [...new Set(ids)];
}

export interface GlossaryIndexEntry {
  id: string;
  term: string;
  aliases: string[];
  plainLanguage: string;
  category: GlossaryEntry['category'];
}

/** Only tier-safe text goes in, so a locked term can never match. */
export function glossarySearchIndex(tier: Tier): GlossaryIndexEntry[] {
  return canon.glossary
    .filter((g) => isVisible(g, tier))
    .map((g) => ({
      id: g.id,
      term: g.term,
      aliases: g.aliases.filter((a) => safeText(a, tier) === a),
      plainLanguage: safeText(g.plainLanguage, tier),
      category: g.category,
    }));
}

export function sourcesFor(obj: { sourceIds?: string[] }): Source[] {
  return (obj.sourceIds ?? []).flatMap((id) => sourcesMap.get(id) ?? []);
}

export const sourceById = (id: string): Source | undefined => sourcesMap.get(id);

export function disputesFor(id: string, tier: Tier = 'extras'): Dispute[] {
  return canon.disputes.filter((d) => (DISPUTE_LINKS[d.id] ?? []).includes(id) && isVisible(d, tier));
}

/** URL and DOM form of a world-line id: the field name in canon ids stays out of URLs and attributes. */
export function publicLineId(id: string): string {
  return id.replace(/^wl-(alpha|beta|omega|chi|gamma|delta)-/, 'wl-');
}

export function lineFromPublicId(publicId: string): WorldLine | undefined {
  return canon.worldLines.find((w) => w.id === publicId || publicLineId(w.id) === publicId);
}

/** What to call a line at this tier: premiseLabel until the fields have been named. */
export function lineLabel(line: WorldLine, tier: Tier): string {
  if (line.premiseLabel && !atLeast(tier, 'sg_part2')) return line.premiseLabel;
  return safeText(line.label, tier);
}

/** World lines are shown by number once tier-visible; a locked number never reaches a component. */
export function lineValue(line: WorldLine): string | null {
  return line.divergence;
}
