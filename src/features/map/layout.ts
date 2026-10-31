import { canon } from '../../data/load';
import type { Media, Mechanism, StoryEvent, Tier, WorldLine } from '../../data/schema';
import {
  atLeast,
  collapsedEdges,
  eventById,
  isVisible,
  transitionTier,
  tierRank,
  visibleEvents,
  visibleLines,
  visibleTransitions,
  worldLineById,
  type EventOrder,
} from '../../data/selectors';
import { dateBounds } from '../../data/validate';
import { monthLabel, shortDay } from '../../components/format';

// Pure geometry for the world-line map. Nothing here may be derived from locked data: every
// position comes from what is visible at the tier, so spacing cannot hint at hidden content.

export const GUTTER = 118;
export const GUTTER_PREMISE = 196;
const LENS_MIN_GAP = 34;
const DAY_MIN = 30;
const DAY_EVENT = 26;
const MONTH_SLOT = 64;
const SEQ_STEP = 46;
const SEQ_START = 130;
const EDGE_RUN = 16;

export type RowKind = 'alpha' | 'beta' | 'neutral' | 'steins_gate' | 'sg0' | 'vn_ending' | 'float';

export interface MapRow {
  key: string;
  lineId: string | null;
  y: number;
  kind: RowKind;
  ghost: boolean;
}

export interface MapBand {
  key: string;
  kind: RowKind;
  y0: number;
  y1: number;
  label: string | null;
}

export interface MapNode {
  id: string;
  kind: 'event' | 'line';
  lineId: string | null;
  x: number;
  y: number;
}

export interface MapEdge {
  id: string;
  transitionId: string | null;
  mechanism: Mechanism;
  collapsed: boolean;
  hiddenSteps: number;
  crosses: boolean;
  fromNode: string | null;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface MapTrack {
  lineId: string;
  y: number;
  x1: number;
  x2: number;
  unclear: boolean;
}

export interface MapTick {
  x: number;
  label: string;
  major: boolean;
}

export interface MapBracket {
  eventId: string;
  x1: number;
  x2: number;
  y: number;
  label: string | null;
}

export interface MapArc {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface MapModel {
  rows: MapRow[];
  bands: MapBand[];
  nodes: MapNode[];
  edges: MapEdge[];
  tracks: MapTrack[];
  ticks: MapTick[];
  brackets: MapBracket[];
  arcs: MapArc[];
  breaks: number[];
  boundaryY: number | null;
  boundaryLabel: string;
  floatConnector: { x1: number; x2: number; y: number } | null;
  width: number;
  height: number;
  gutter: number;
}

/** The line an event's node sits on. A D-Mail's node is on the line it leaves. */
export function eventLine(e: StoryEvent): string | null {
  return e.worldLineBefore ?? e.worldLineAfter;
}

function assignRows(events: StoryEvent[], lines: WorldLine[], tier: Tier, height: number) {
  const fieldsNamed = atLeast(tier, 'sg_part2');
  const shown = new Set(lines.map((l) => l.id));
  const needed = new Map(lines.filter((l) => l.lane !== 'spinoff').map((l) => [l.id, l]));
  for (const e of events) {
    for (const id of [e.worldLineBefore, e.worldLineAfter]) {
      const line = id ? worldLineById(id) : undefined;
      // Keep rows for lines the media filter hides but a visible event still sits on.
      if (line && isVisible(line, tier) && !needed.has(line.id)) needed.set(line.id, line);
    }
  }
  const all = [...needed.values()];
  const byValue = (a: WorldLine, b: WorldLine) => (b.divergenceNumeric ?? 0) - (a.divergenceNumeric ?? 0);
  const sg0 = all.filter((l) => l.lane === 'sg0').sort(byValue);
  const upper = all.filter((l) => l.lane === 'sg_main' && (l.divergenceNumeric ?? 0) >= 1).sort(byValue);
  const gold = all.filter((l) => l.lane === 'steins_gate');
  const lower = all.filter((l) => l.lane === 'sg_main' && (l.divergenceNumeric ?? 0) < 1).sort(byValue);
  const vn = all.filter((l) => l.lane === 'sg_vn_ending').sort(byValue);
  const floating = events.some((e) => e.worldLineBefore === null && e.worldLineAfter === null);

  type Section = { kind: RowKind; band: string | null; lines: Array<WorldLine | null> };
  const allSections: Section[] = [
    { kind: 'sg0', band: 'S;G 0 lane', lines: [...sg0, ...(floating ? [null] : [])] },
    { kind: fieldsNamed ? 'beta' : 'neutral', band: fieldsNamed ? 'Beta' : null, lines: upper },
    { kind: 'steins_gate', band: 'Steins Gate', lines: gold },
    { kind: fieldsNamed ? 'alpha' : 'neutral', band: fieldsNamed ? 'Alpha' : null, lines: lower },
    { kind: 'vn_ending', band: 'Off the scale', lines: vn },
  ];
  const sections = allSections.filter((s) => s.lines.length > 0);

  const rowCount = sections.reduce((n, s) => n + s.lines.length, 0);
  const SECTION_PAD = 16;
  const available = Math.max(160, height - 40 - SECTION_PAD * (sections.length + 1));
  const rowH = Math.min(64, Math.max(17, available / Math.max(rowCount, 1)));

  const rows: MapRow[] = [];
  const bands: MapBand[] = [];
  let y = SECTION_PAD;
  let boundaryY: number | null = null;
  for (const section of sections) {
    if (section.kind === 'alpha' || (section.kind === 'neutral' && section.lines === lower)) {
      boundaryY = y - SECTION_PAD / 2;
    }
    const y0 = y;
    for (const line of section.lines) {
      rows.push({
        key: line?.id ?? 'float',
        lineId: line?.id ?? null,
        y: y + rowH / 2,
        kind: line ? section.kind : 'float',
        ghost: !!line && !shown.has(line.id),
      });
      y += rowH;
    }
    bands.push({ key: section.kind + y0, kind: section.kind, y0: y0 - 4, y1: y + 4, label: section.band });
    y += SECTION_PAD;
  }
  return { rows, bands, boundaryY, height: Math.max(170, y) };
}

interface Slot {
  key: string;
  start: string;
  width: number;
  x: number;
  events: StoryEvent[];
  label: string;
  major: boolean;
  gapBefore: boolean;
}

const addDay = (date: string): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

function clock(e: StoryEvent): number | null {
  if (!e.time) return null;
  if (e.time === 'evening') return 18;
  if (e.time === 'night') return 21;
  const [h, m] = e.time.split(':').map(Number);
  return h + m / 60;
}

const LENS_DAY = '2010-07-28';

/** July 28 at an hour scale. An untimed event keeps its canon position between timed neighbours. */
function placeLens(events: StoryEvent[]): Map<string, number> {
  const hours = events.map(clock);
  const filled = hours.map((h, i) => {
    if (h !== null) return h;
    const prev = hours.slice(0, i).reverse().find((x) => x !== null) ?? 11;
    const next = hours.slice(i + 1).find((x) => x !== null) ?? 13;
    const gap = hours.slice(0, i + 1).reverse().findIndex((x) => x !== null);
    return prev + ((next - prev) * Math.max(gap, 1)) / (Math.max(gap, 1) + 2);
  });
  const scale = (h: number) => (h <= 13 ? ((h - 11) / 2) * 320 : 320 + Math.min(h - 13, 8) * 16);
  const out = new Map<string, number>();
  let last = -LENS_MIN_GAP;
  events.forEach((e, i) => {
    const x = Math.max(scale(filled[i]), last + LENS_MIN_GAP);
    out.set(e.id, x);
    last = x;
  });
  return out;
}

function calendarPositions(events: StoryEvent[]) {
  const ordered = [...events].sort((a, b) => dateBounds(a.sortDate)[0].localeCompare(dateBounds(b.sortDate)[0]));
  const dayEvents = new Map<string, StoryEvent[]>();
  for (const e of ordered) {
    const key = e.sortDate;
    dayEvents.set(key, [...(dayEvents.get(key) ?? []), e]);
  }

  const slots: Slot[] = [];
  const lensEvents = dayEvents.get(LENS_DAY) ?? [];
  const lens = placeLens(lensEvents);
  if (lensEvents.length > 0) {
    const widest = Math.max(...lens.values());
    slots.push({ key: LENS_DAY, start: LENS_DAY, width: widest + 46, x: 0, events: lensEvents, label: 'Jul 28', major: true, gapBefore: false });
  }

  const dated = [...dayEvents.keys()].filter((k) => k !== LENS_DAY).sort((a, b) => dateBounds(a)[0].localeCompare(dateBounds(b)[0]));
  const fullDays = dated.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && k < '2010-09-01');
  if (fullDays.length > 0) {
    let day = addDay(LENS_DAY);
    const lastDay = fullDays[fullDays.length - 1];
    while (day <= lastDay) {
      const list = dayEvents.get(day) ?? [];
      const dom = Number(day.slice(-2));
      slots.push({
        key: day,
        start: day,
        width: Math.max(DAY_MIN, DAY_EVENT * list.length + 8),
        x: 0,
        events: list,
        label: shortDay(day),
        major: dom === 1 || dom % 4 === 1,
        gapBefore: false,
      });
      day = addDay(day);
    }
  }
  for (const key of dated) {
    if (fullDays.includes(key)) continue;
    const list = dayEvents.get(key) ?? [];
    slots.push({
      key,
      start: dateBounds(key)[0],
      width: Math.max(MONTH_SLOT, DAY_EVENT * list.length + 20),
      x: 0,
      events: list,
      label: /^\d{4}-\d{2}-\d{2}$/.test(key) ? `${shortDay(key)} ${key.slice(0, 4)}` : monthLabel(key),
      major: true,
      gapBefore: true,
    });
  }

  const positions = new Map<string, number>();
  const brackets: Array<{ eventId: string; x1: number; x2: number; label: string | null }> = [];
  const ticks: MapTick[] = [];
  const breaks: number[] = [];
  let x = 24;
  let lastYear = 2010;
  let firstGap = true;
  for (const slot of slots) {
    if (slot.gapBefore) {
      const year = Number(slot.start.slice(0, 4));
      // One break glyph where the scale changes and one at each jump of years; more just clutters.
      if (firstGap || year - lastYear > 1) breaks.push(x + 6);
      firstGap = false;
      lastYear = year;
      x += 26;
    }
    slot.x = x;
    if (slot.key === LENS_DAY) {
      slot.events.forEach((e) => positions.set(e.id, x + 16 + (lens.get(e.id) ?? 0)));
      ticks.push({ x: x + 16, label: 'Jul 28 · 11:00', major: true });
      ticks.push({ x: x + 16 + 160, label: '12:00', major: false });
      ticks.push({ x: x + 16 + 320, label: '13:00', major: false });
    } else {
      slot.events.forEach((e, i) => positions.set(e.id, x + (slot.width * (i + 0.5)) / slot.events.length));
      if (slot.major) ticks.push({ x: x + 2, label: slot.label, major: true });
    }
    x += slot.width;
  }

  // Partial dates get a range bracket. Editorial sort keys get the bracket but never a label.
  for (const e of events) {
    if (!e.date || /^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
    const span = slots.filter((s) => s.start.startsWith(e.date!));
    const at = positions.get(e.id) ?? 0;
    const x1 = span.length > 0 ? span[0].x : at - 16;
    const end = span[span.length - 1];
    const x2 = end ? end.x + end.width : at + 16;
    brackets.push({ eventId: e.id, x1, x2, label: e.sortDateIsEditorial ? null : monthLabel(e.date) });
  }
  return { positions, ticks, brackets, breaks, width: x + 40 };
}

function seqPositions(events: StoryEvent[]) {
  const ordered = [...events].sort((a, b) => a.seq - b.seq);
  const positions = new Map(ordered.map((e, i) => [e.id, SEQ_START + i * SEQ_STEP]));
  const ticks: MapTick[] = ordered
    .map((_e, i) => ({ x: SEQ_START + i * SEQ_STEP, label: `#${i + 1}`, major: true, i }))
    .filter((t) => t.i % 5 === 0)
    .map(({ x, label, major }) => ({ x, label, major }));
  return { positions, ticks, brackets: [], breaks: [] as number[], width: SEQ_START + 30 + ordered.length * SEQ_STEP };
}

export function buildMapModel(tier: Tier, media: Media[], order: EventOrder, height: number, scale = 1): MapModel {
  const events = visibleEvents(tier, media, order);
  const lines = visibleLines(tier, media);
  const shownLines = new Set(lines.map((l) => l.id));
  const { rows, bands, boundaryY, height: mapHeight } = assignRows(events, lines, tier, height);
  const rowFor = new Map(rows.map((r) => [r.key, r]));
  const yOf = (lineId: string | null) => rowFor.get(lineId ?? 'float')?.y ?? rows[0]?.y ?? 0;

  const axis = order === 'calendar' ? calendarPositions(events) : seqPositions(events);
  const sx = (x: number) => x * scale;

  const nodes: MapNode[] = events.map((e) => {
    const lineId = eventLine(e);
    return { id: e.id, kind: 'event' as const, lineId, x: sx(axis.positions.get(e.id) ?? 0), y: yOf(lineId) };
  });

  // Lines with no events float at the end of the lane, joined by the "not mapped" connector.
  const withNodes = new Set(events.flatMap((e) => [e.worldLineBefore, e.worldLineAfter]));
  const floaters = lines.filter((l) => l.lane === 'sg0' && !withNodes.has(l.id));
  const rightEdge = Math.max(sx(axis.width), ...nodes.map((n) => n.x + 30));
  floaters.forEach((l, i) => nodes.push({ id: l.id, kind: 'line', lineId: l.id, x: rightEdge + 26 * i, y: yOf(l.id) }));

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edges: MapEdge[] = [];
  for (const t of visibleTransitions(tier, media)) {
    const cause = nodeById.get(t.cause);
    if (!cause) continue;
    edges.push({
      id: t.id,
      transitionId: t.id,
      mechanism: t.mechanism,
      collapsed: false,
      hiddenSteps: 0,
      crosses: t.crossesAttractorField,
      fromNode: t.cause,
      from: { x: cause.x, y: yOf(t.from) },
      to: { x: cause.x + EDGE_RUN, y: yOf(t.to) },
    });
  }
  for (const c of collapsedEdges(media, tier)) {
    const firstCause = canon.transitions.find((t) => t.id === c.transitionIds[0])?.cause;
    const cause = firstCause ? nodeById.get(firstCause) : undefined;
    if (!cause) continue;
    edges.push({
      id: c.id,
      transitionId: null,
      mechanism: c.mechanism,
      collapsed: true,
      hiddenSteps: c.hiddenSteps,
      crosses: false,
      fromNode: firstCause ?? null,
      from: { x: cause.x, y: yOf(c.from) },
      to: { x: cause.x + EDGE_RUN, y: yOf(c.to) },
    });
  }

  const tracks: MapTrack[] = [];
  for (const row of rows) {
    if (!row.lineId) continue;
    const xs = [
      ...nodes.filter((n) => n.lineId === row.lineId).map((n) => n.x),
      ...edges.filter((e) => e.to.y === row.y).map((e) => e.to.x),
      ...edges.filter((e) => e.from.y === row.y).map((e) => e.from.x),
    ];
    if (xs.length === 0) continue;
    const line = worldLineById(row.lineId);
    tracks.push({
      lineId: row.lineId,
      y: row.y,
      x1: Math.min(...xs),
      x2: Math.max(...xs),
      unclear: line?.divergenceConfidence === 'UNCLEAR' || !shownLines.has(row.lineId),
    });
  }

  const brackets: MapBracket[] = axis.brackets.flatMap((b) => {
    const node = nodeById.get(b.eventId);
    return node ? [{ eventId: b.eventId, x1: sx(b.x1), x2: sx(b.x2), y: node.y + 9, label: b.label }] : [];
  });

  const arcs: MapArc[] = [];
  const { reconnection } = canon.sg0Branch;
  const source = nodeById.get(reconnection.fromEventId);
  if (atLeast(tier, reconnection.spoilerTier) && source) {
    for (const targetId of [reconnection.toEventId, reconnection.unlocksEventId]) {
      const target = nodeById.get(targetId);
      if (target) arcs.push({ id: targetId, fromX: source.x, fromY: source.y, toX: target.x, toY: target.y });
    }
  }

  const floatRow = rows.find((r) => r.lineId && floaters.some((f) => f.id === r.lineId));
  return {
    rows,
    bands,
    nodes,
    edges,
    tracks,
    ticks: axis.ticks.map((t) => ({ ...t, x: sx(t.x) })),
    brackets,
    arcs,
    breaks: axis.breaks.map(sx),
    boundaryY,
    boundaryLabel: atLeast(tier, 'sg_part1') ? '1% boundary' : 'boundary',
    floatConnector:
      floaters.length > 1 && floatRow
        ? { x1: rightEdge, x2: rightEdge + 26 * (floaters.length - 1), y: bands.find((b) => b.kind === 'sg0')!.y1 - 3 }
        : null,
    width: rightEdge + 26 * Math.max(floaters.length, 1) + 30,
    height: mapHeight,
    gutter: tierRank(tier) === 0 ? GUTTER_PREMISE : GUTTER,
  };
}

/** Keeps axis labels from colliding at the size they are drawn on screen. */
export function declutter(ticks: MapTick[]): MapTick[] {
  let lastEnd = -Infinity;
  return ticks.filter((t) => {
    if (t.x < lastEnd) return false;
    lastEnd = t.x + t.label.length * 6.6 + 10;
    return true;
  });
}

/** The node above or below `node`, nearest in x, for arrow-key navigation. */
export function neighbourNode(model: MapModel, node: MapNode, direction: 1 | -1): MapNode | null {
  const candidates = model.nodes.filter((n) => (direction === 1 ? n.y > node.y : n.y < node.y));
  if (candidates.length === 0) return null;
  const nearestY = direction === 1 ? Math.min(...candidates.map((n) => n.y)) : Math.max(...candidates.map((n) => n.y));
  const row = candidates.filter((n) => n.y === nearestY);
  return row.reduce((best, n) => (Math.abs(n.x - node.x) < Math.abs(best.x - node.x) ? n : best), row[0]);
}

export const transitionIsOpen = (id: string, tier: Tier): boolean => {
  const t = canon.transitions.find((x) => x.id === id);
  return !!t && tierRank(transitionTier(t)) <= tierRank(tier);
};

export const eventIsOpen = (id: string, tier: Tier): boolean => {
  const e = eventById(id);
  return !!e && isVisible(e, tier);
};
