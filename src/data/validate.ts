import { CanonSchema } from './schema';

// Rule set mirrors scripts/reference/check_canon.py; keep the two in sync.

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  counts: Record<string, number>;
  unusedSources: string[];
}

type Json = Record<string, unknown>;

const REF_SECTIONS = ['sources', 'characters', 'glossary', 'worldLines', 'events', 'transitions', 'endings', 'works', 'disputes'] as const;
const FACT_KEYS = ['text', 'claim', 'caption', 'summary', 'plainLanguage', 'whatIsDifferent', 'outcome', 'description', 'role', 'notes'];
const LINE_KEYS = ['worldLineBefore', 'worldLineAfter', 'worldLineId', 'branchWorldLineId', 'forkFromWorldLineId', 'from', 'to'];
const EVENT_KEYS = ['cause', 'branchEventId', 'fromEventId', 'toEventId', 'unlocksEventId'];
const CONFIDENCE = new Set(['CONFIRMED', 'INTERPRETATION', 'UNCLEAR']);

/** A sortDate as an inclusive interval, so partial dates match any day inside them. */
export function dateBounds(date: string): [string, string] {
  if (/^\d{4}$/.test(date)) return [`${date}-01-01`, `${date}-12-31`];
  if (/^\d{4}-\d{2}$/.test(date)) return [`${date}-01`, `${date}-31`];
  return [date, date];
}

export function validateCanon(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = CanonSchema.safeParse(input);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 40)) {
      errors.push(`schema: ${issue.path.join('.')}: ${issue.message}`);
    }
    return { errors, warnings, counts: {}, unusedSources: [] };
  }

  const c = parsed.data;
  const raw = input as Json;
  const ids = new Map<string, string>();
  for (const sec of REF_SECTIONS) {
    for (const o of c[sec]) {
      if (ids.has(o.id)) errors.push(`duplicate id ${o.id}`);
      ids.set(o.id, sec);
    }
  }
  c.mechanics.forEach((m) => ids.set(m.id, 'mechanics'));
  c.sg0Branch.endings.forEach((e) => ids.set(e.id, 'sg0endings'));

  const sources = new Map(c.sources.map((s) => [s.id, s]));
  const tiers = c.meta.spoilerTiers.map((t) => t.id as string);
  const media = new Set(Object.keys(c.meta.mediaKeys));
  const usedSources = new Set<string>();

  const need = (id: unknown, section: string, where: string) => {
    if (id === null || id === undefined) return;
    if (ids.get(id as string) !== section) errors.push(`${where}: unresolved ref ${String(id)} (expected ${section})`);
  };

  const walk = (node: unknown, path: string, parentTier: string | null): void => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`, parentTier));
      return;
    }
    if (typeof node !== 'object' || node === null) return;
    const o = node as Json;
    const tier = (o.spoilerTier ?? o.firstSpoilerTier ?? parentTier) as string | null;
    const last = path.split('.').at(-1) ?? '';
    if (
      parentTier &&
      typeof o.spoilerTier === 'string' &&
      tiers.indexOf(o.spoilerTier) < tiers.indexOf(parentTier) &&
      (last.startsWith('reveals') || last.startsWith('details'))
    ) {
      errors.push(`${path}: reveal tier below parent`);
    }
    for (const [k, v] of Object.entries(o)) {
      if (k === 'sourceIds') {
        const list = v as string[];
        if (list.length === 0) errors.push(`${path}: empty sourceIds`);
        for (const s of list) {
          const src = sources.get(s);
          if (!src) errors.push(`${path}: unknown source ${s}`);
          else {
            usedSources.add(s);
            if (src.status === 'failed' || src.status === 'search-only') errors.push(`${path}: cites unusable source ${s}`);
          }
        }
      }
      if (k === 'media' && Array.isArray(v)) {
        for (const m of v) if (!media.has(m as string)) errors.push(`${path}: bad media ${String(m)}`);
      }
      if (k === 'characterId' || k === 'characterIds') {
        for (const x of Array.isArray(v) ? v : [v]) need(x, 'characters', path);
      }
      if (k === 'relatedIds') (v as string[]).forEach((x) => need(x, 'glossary', path));
      if (k === 'keyEventIds' || k === 'dmailsSent') (v as string[]).forEach((x) => need(x, 'events', path));
      if (LINE_KEYS.includes(k) && (typeof v === 'string' || v === null)) need(v, 'worldLines', `${path}.${k}`);
      if (EVENT_KEYS.includes(k)) need(v, 'events', `${path}.${k}`);
      if (k === 'transitionId') need(v, 'transitions', path);
      walk(v, `${path}.${k}`, tier);
    }
    const factBearing = FACT_KEYS.some((k) => k in o);
    if (factBearing && path.includes('.') && !path.includes('versions') && !path.includes('conflicts')) {
      if (!Array.isArray(o.sourceIds) || o.sourceIds.length === 0) errors.push(`${path}: fact-bearing object without sourceIds`);
      if (!('confidence' in o)) errors.push(`${path}: fact-bearing object without confidence`);
    }
  };

  const walked = ['characters', 'glossary', 'worldLines', 'events', 'transitions', 'mechanics', 'endings', 'works', 'disputes'] as const;
  for (const sec of walked) {
    for (const o of (raw[sec] as Json[]) ?? []) walk(o, `${sec}:${String(o.id)}`, null);
  }
  walk(raw.sg0Branch, 'sg0Branch:root', null);

  const needsTop = (id: string, sec: string, o: { sourceIds?: string[]; confidence?: string }) => {
    if (!o.sourceIds?.length) errors.push(`${sec}:${id}: top-level missing sourceIds`);
    if (!o.confidence || !CONFIDENCE.has(o.confidence)) errors.push(`${sec}:${id}: top-level missing confidence`);
  };
  for (const sec of ['characters', 'glossary', 'worldLines', 'events', 'transitions', 'endings'] as const) {
    for (const o of c[sec]) needsTop(o.id, sec, o);
  }
  for (const w of c.works) {
    if (!w.sourceIds.length) errors.push(`works:${w.id}: missing sources`);
  }

  for (const d of c.disputes) {
    if (d.confidence !== 'UNCLEAR') errors.push(`disputes:${d.id}: confidence must be UNCLEAR`);
    for (const v of d.versions) {
      if (!v.sourceIds.length) errors.push(`${d.id}: version without source`);
    }
  }

  const charactersById = new Map(c.characters.map((x) => [x.id, x]));
  for (const w of c.worldLines) {
    if (w.spoilerTier === 'premise') {
      if (!w.premiseLabel) errors.push(`${w.id}: premise world line needs premiseLabel`);
      for (const a of [...w.aliveDead.alive, ...w.aliveDead.dead]) {
        const first = charactersById.get(a.characterId)?.firstSpoilerTier ?? 'premise';
        if (!a.spoilerTier && (a.characterId === 'mayuri' || first !== 'premise')) {
          errors.push(`${w.id}: premise line exposes untiered fate of ${a.characterId}`);
        }
      }
    }
  }

  let previous: [string, string] | null = null;
  for (const e of c.events) {
    const b = dateBounds(e.sortDate);
    if (previous && b[1] < previous[0]) errors.push(`event order: ${e.id} before previous`);
    previous = b;
  }

  const seqs = c.events.map((e) => e.seq);
  if (new Set(seqs).size !== seqs.length) errors.push('duplicate seq');

  const transitions = new Map(c.transitions.map((t) => [t.id, t]));
  const events = new Map(c.events.map((e) => [e.id, e]));
  for (const e of c.events) {
    if (e.transitionId) {
      const t = transitions.get(e.transitionId);
      if (t && (t.from !== e.worldLineBefore || t.to !== e.worldLineAfter || t.cause !== e.id)) {
        errors.push(`${e.id}: transition mismatch`);
      }
    } else if (e.worldLineBefore && e.worldLineAfter && e.worldLineBefore !== e.worldLineAfter) {
      errors.push(`${e.id}: world line changes without transition`);
    }
  }
  for (const t of c.transitions) {
    if (events.get(t.cause)?.transitionId !== t.id) errors.push(`${t.id}: cause event does not point back`);
  }

  for (const w of c.worldLines) {
    const v = w.divergenceNumeric;
    if (w.divergence !== null && v === null) errors.push(`${w.id}: numeric missing`);
    if (v === null) continue;
    if (w.divergence !== null && Number(w.divergence) !== v) errors.push(`${w.id}: numeric mismatch`);
    if (w.attractorField === 'alpha' && !(v >= 0 && v < 1)) errors.push(`${w.id}: alpha out of band`);
    if (w.attractorField === 'beta' && !(v >= 1 && v < 2)) errors.push(`${w.id}: beta out of band`);
    if (w.divergence && !w.id.replace(/-/g, '').includes(w.divergence.replace(/[.-]/g, ''))) {
      warnings.push(`${w.id}: id/digits mismatch`);
    }
  }

  return {
    errors,
    warnings,
    unusedSources: c.sources.filter((s) => !usedSources.has(s.id)).map((s) => s.id),
    counts: {
      sources: c.sources.length,
      characters: c.characters.length,
      glossary: c.glossary.length,
      worldLines: c.worldLines.length,
      events: c.events.length,
      transitions: c.transitions.length,
      mechanics: c.mechanics.length,
      endings: c.endings.length,
      sg0Endings: c.sg0Branch.endings.length,
      works: c.works.length,
      disputes: c.disputes.length,
    },
  };
}
