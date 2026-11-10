import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { href, navigate, useRoute } from '../../app/router';
import { readStore, writeStore } from '../../app/storage';
import { TIER_ORDER, useReduceMotion, useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { formatDate } from '../../components/format';
import { GearClock, parseClockTime } from '../../components/GearClock';
import { EDGE_STYLES } from '../../components/glyphs';
import { GlassDock } from '../../components/GlassDock';
import { Nixie } from '../../components/Nixie';
import { Blip } from '../../components/Secrets';
import { useFocusTrap } from '../../components/useFocusTrap';
import { canon } from '../../data/load';
import type { Mechanism, StoryEvent, Tier, Transition, WorldLine } from '../../data/schema';
import { atLeast, characterById, eventsBySeq, isVisible, lineLabel, mechanicById, tierRank, transitionById, transitionTier, visibleEvents, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { DmailDialog, isDmail } from '../dmail/DmailFile';
import { eventTarget } from '../map/targets';
import { MechanicPlayer } from '../mechanics/MechanicPlayer';

// Guided mode offers the matching explainer at these four story beats. Ids only.
const INTERLUDES: Record<string, string> = {
  'ev-0728-first-dmail': 'dmail',
  'ev-0813-time-leap-loop': 'time_leap',
  'ev-08xx-titor-reveal': 'time_machine',
  'ev-0817-sern-deletion': 'attractor_field',
};

// Steps that are time leaps. A leap stays on its world line, so canon has no transition to mark it. Ids only.
const LEAPS = new Set(['ev-0813-time-leap-loop']);

type JumpKind = Mechanism | 'time_leap';
const JUMP_LABEL = (kind: JumpKind) => (kind === 'time_leap' ? 'Time leap' : EDGE_STYLES[kind].label);
const FIELD_LABELS: Partial<Record<WorldLine['attractorField'], string>> = { alpha: 'Alpha field', beta: 'Beta field', steins_gate: 'Steins Gate' };

/** The text read out at a step: title, summary, what changed, then unlocked reveals. */
export function narration(e: StoryEvent, tier: Tier) {
  return {
    title: safeText(e.title, tier),
    summary: safeText(e.summary, tier),
    changed: e.whatChanged ? safeText(e.whatChanged, tier) : '',
    reveals: e.reveals.filter((r) => tierRank(r.spoilerTier) <= tierRank(tier)).map((r) => safeText(r.text, tier)).filter(Boolean),
  };
}

function dwellMs(words: number, speed: number): number {
  return (4000 + 60 * words) / speed;
}

const lineOf = (e: StoryEvent) => e.worldLineAfter ?? e.worldLineBefore;

function openTransition(e: StoryEvent | null, tier: Tier): Transition | undefined {
  const t = e?.transitionId ? transitionById(e.transitionId) : undefined;
  return t && tierRank(transitionTier(t)) <= tierRank(tier) ? t : undefined;
}

function jumpKind(e: StoryEvent, tier: Tier): JumpKind | null {
  const t = openTransition(e, tier);
  if (t && t.from !== t.to) return t.mechanism;
  return LEAPS.has(e.id) ? 'time_leap' : null;
}

const shownLine = (id: string | null, tier: Tier) => {
  const line = id ? worldLineById(id) : undefined;
  return line && isVisible(line, tier) ? line : undefined;
};

interface Step {
  event: StoryEvent;
  at: number;
}
interface Band extends Step {
  kind: 'band';
  how: JumpKind;
  no: number;
}
interface Chapter {
  kind: 'chapter';
  lineId: string | null;
  items: Step[];
  /** The jump that led here, when there was one. */
  via?: Band;
}
type Block = Band | Chapter;

/** The story as world-line chapters with one typed jump between them. */
function buildBlocks(steps: StoryEvent[], numbers: Map<string, number>, tier: Tier): Block[] {
  const blocks: Block[] = [];
  let chapter: Chapter | null = null;
  steps.forEach((event, at) => {
    const how = jumpKind(event, tier);
    if (how) {
      const band: Band = { kind: 'band', event, at, how, no: numbers.get(event.id) ?? 0 };
      chapter = { kind: 'chapter', lineId: event.worldLineAfter, items: [], via: band };
      blocks.push(band, chapter);
      return;
    }
    const lineId = lineOf(event) ?? chapter?.lineId ?? null;
    if (!chapter || chapter.lineId !== lineId) {
      chapter = { kind: 'chapter', lineId, items: [] };
      blocks.push(chapter);
    }
    chapter.items.push({ event, at });
  });
  return blocks;
}

/** Each kind of jump is counted in the order Okabe lived it, so "D-Mail 03" means the same thing in either order. */
function jumpNumbers(tier: Tier, media: Parameters<typeof visibleEvents>[1]): Map<string, number> {
  const counts: Partial<Record<JumpKind, number>> = {};
  const numbers = new Map<string, number>();
  for (const e of visibleEvents(tier, media, 'seq')) {
    const how = jumpKind(e, tier);
    if (!how) continue;
    counts[how] = (counts[how] ?? 0) + 1;
    numbers.set(e.id, counts[how]!);
  }
  return numbers;
}

const two = (n: number) => String(n).padStart(2, '0');

function Interlude({ id, onClose }: { id: string; onClose: () => void }) {
  const mechanic = mechanicById(id);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);
  if (!mechanic) return null;
  return (
    <div className="sheet-layer interlude-layer">
      <div ref={ref} className="interlude" role="dialog" aria-modal="true" aria-label="How this works">
        <div className="row interlude-head">
          <h2>How this works</h2>
          <button type="button" className="btn" onClick={onClose}>
            Back to the story
          </button>
        </div>
        <MechanicPlayer mechanic={mechanic} compact />
      </div>
    </div>
  );
}

function TierWall({ nextTier }: { nextTier: Tier }) {
  const { setTier } = useSettings();
  const [confirming, setConfirming] = useState(false);
  const label = canon.meta.spoilerTiers.find((t) => t.id === nextTier)?.label;
  return (
    <div className="wall-card" data-testid="tier-wall">
      <h2>End of this spoiler level</h2>
      <p>The next part reveals “{label}”. Raise your spoiler level to continue.</p>
      {confirming ? (
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => setTier(nextTier)}>
            Yes, reveal
          </button>
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => (TIER_ORDER.indexOf(nextTier) > 1 ? setConfirming(true) : setTier(nextTier))}>
          Raise spoiler level
        </button>
      )}
    </div>
  );
}

/** What the open step says, with the actions that belong to it. */
function StepDetail({ event, tier, at, total, actions }: { event: StoryEvent; tier: Tier; at: number; total: number; actions: ReactNode }) {
  const text = narration(event, tier);
  return (
    <div className="step-detail">
      <p className="follow-count">
        Step {at + 1} of {total}
      </p>
      <p>{text.summary}</p>
      {text.changed && <p className="follow-changed">{text.changed}</p>}
      {text.reveals.map((r, i) => (
        <p key={i} className="follow-reveal">
          Later you learn: {r}
        </p>
      ))}
      <div className="row">
        {actions}
        <a className="btn btn-quiet" href={href('map', { ev: event.id })}>
          Open in map
        </a>
      </div>
    </div>
  );
}

function ChapterHead({ chapter, tier }: { chapter: Chapter; tier: Tier }) {
  const line = shownLine(chapter.lineId, tier);
  const field = line && atLeast(tier, 'sg_part2') ? FIELD_LABELS[line.attractorField] : undefined;
  return (
    <h2 className="chapter-head">
      {line ? <Nixie value={line.divergence} size="md" label={line.divergence ? `World line ${line.divergence}` : 'World line with no listed value'} /> : <span className="chapter-unknown">World line not shown at this level</span>}
      {field && <span className={`field-chip field-${line!.attractorField}`}>{field}</span>}
      {line && <span className="chapter-name">{lineLabel(line, tier)}</span>}
    </h2>
  );
}

export function FollowPage() {
  const route = useRoute();
  const { tier, media, setFocusedLine } = useSettings();
  const reduce = useReduceMotion();
  const [order, setOrder] = useState<EventOrder>('seq');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [interlude, setInterlude] = useState<string | null>(null);
  const [reading, setReading] = useState<StoryEvent | null>(null);

  const steps = useMemo(() => visibleEvents(tier, media, order), [tier, media, order]);
  const blocks = useMemo(() => buildBlocks(steps, jumpNumbers(tier, media), tier), [steps, tier, media]);
  const nextLocked = useMemo(() => {
    const later = eventsBySeq().filter((e) => e.media.some((m) => media.includes(m)) && !isVisible(e, tier));
    return later.length > 0 ? later.reduce((low, e) => (tierRank(e.spoilerTier) < tierRank(low) ? e.spoilerTier : low), later[0].spoilerTier) : null;
  }, [tier, media]);
  const total = steps.length + (nextLocked ? 1 : 0);

  const fromUrl = Number(route.path[1]);
  const saved = readStore<number>(`wl.follow.${tier}`, 0);
  const index = Math.min(Math.max(0, Number.isInteger(fromUrl) && fromUrl > 0 ? fromUrl - 1 : saved), Math.max(total - 1, 0));
  const atWall = index >= steps.length;
  const event = atWall ? null : steps[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), Math.max(total - 1, 0));
      writeStore(`wl.follow.${tier}`, clamped);
      navigate(`follow/${clamped + 1}`, undefined, true);
    },
    [total, tier],
  );
  const pick = useCallback(
    (at: number) => {
      setPlaying(false);
      go(at);
    },
    [go],
  );

  const line = event ? shownLine(lineOf(event), tier) : undefined;
  const lineId = line?.id ?? null;
  useEffect(() => {
    setFocusedLine(lineId);
    return () => setFocusedLine(null);
  }, [lineId, setFocusedLine]);

  // The screen cuts to static for a moment whenever the story lands on another world line.
  const [blip, setBlip] = useState(0);
  const lastLine = useRef(lineId);
  useEffect(() => {
    if (lastLine.current && lineId && lastLine.current !== lineId) setBlip((b) => b + 1);
    lastLine.current = lineId;
  }, [lineId]);

  // Waits a frame so it runs after the app's scroll-to-top on arriving at the page.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => document.getElementById(`step-${index}`)?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }));
    return () => window.cancelAnimationFrame(frame);
  }, [index, order, reduce]);

  const text = event ? narration(event, tier) : null;
  const words = text ? `${text.title} ${text.summary} ${text.changed} ${text.reveals.join(' ')}`.split(/\s+/).length : 0;
  const paused = interlude !== null || reading !== null;

  useEffect(() => {
    if (!playing || paused) return;
    if (atWall || index >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => go(index + 1), dwellMs(words, speed));
    return () => window.clearTimeout(timer);
  }, [playing, paused, atWall, index, total, words, speed, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paused) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(total - 1);
      else if (e.key === ' ' && target.tagName !== 'BUTTON' && target.tagName !== 'A') setPlaying((p) => !p);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, total, paused]);

  const chapters = blocks.filter((b): b is Chapter => b.kind === 'chapter');
  const startOf = (c: Chapter) => c.via?.at ?? c.items[0]?.at ?? 0;
  const here = chapters.reduce((found, c, i) => (startOf(c) <= index ? i : found), 0);
  const current = chapters[here];
  const kinds = [...new Set(blocks.flatMap((b) => (b.kind === 'band' ? [b.how] : [])))];
  const clock = event ? parseClockTime(event.time) : null;
  const when = event ? formatDate(event) : '';

  const actionsFor = (e: StoryEvent) => {
    const mechanicId = INTERLUDES[e.id];
    const mechanic = mechanicId ? mechanicById(mechanicId) : undefined;
    return (
      <>
        {isDmail(e) && openTransition(e, tier) && (
          <button type="button" className="btn btn-primary" onClick={() => setReading(e)}>
            Read the D-Mail
          </button>
        )}
        {mechanic && isVisible(mechanic, tier) && (
          <button type="button" className="btn" onClick={() => setInterlude(mechanicId)}>
            Watch how this works
          </button>
        )}
      </>
    );
  };

  const renderBand = (band: Band) => {
    const open = band.at === index;
    const t = openTransition(band.event, tier);
    const from = shownLine(t?.from ?? band.event.worldLineBefore, tier);
    const to = shownLine(t?.to ?? band.event.worldLineAfter, tier);
    const people = band.event.characterIds.flatMap((id) => {
      const c = characterById(id);
      return c && isVisible(c, tier) ? [c.name] : [];
    });
    return (
      <li key={band.event.id} id={`step-${band.at}`} className={`band band-${band.how}${open ? ' is-open' : ''}`} data-testid={open ? 'narration' : undefined}>
        <div className="band-main">
          <p className="band-no">
            <small>{JUMP_LABEL(band.how)}</small>
            {two(band.no)}
          </p>
          <div className="band-what">
            <button type="button" className="step-title" aria-expanded={open} onClick={() => pick(band.at)}>
              {safeText(band.event.title, tier)}
            </button>
            <p className="band-meta">
              {formatDate(band.event)}
              {people.length > 0 && ` · ${people.join(', ')}`}
              {t?.crossesAttractorField && atLeast(tier, 'sg_part2') && ' · crosses a field boundary'}
            </p>
          </div>
          <p className="band-move">
            <small>{from && to && from.id !== to.id ? 'World line jump' : 'Same world line'}</small>
            {from && <Nixie value={from.divergence} size="sm" />}
            {from && to && from.id !== to.id && (
              <>
                <span aria-hidden="true">→</span>
                <span className="sr-only">changes to</span>
                <Nixie value={to.divergence} size="sm" />
              </>
            )}
          </p>
          <Badge compact target={eventTarget(band.event, tier)} />
        </div>
        {open && <StepDetail event={band.event} tier={tier} at={band.at} total={steps.length} actions={actionsFor(band.event)} />}
      </li>
    );
  };

  const renderChapter = (chapter: Chapter, key: number) => {
    const shown = shownLine(chapter.lineId, tier);
    const field = shown && atLeast(tier, 'sg_part2') ? shown.attractorField : 'neutral';
    return (
      <li key={`chapter-${key}`} className={`chapter rail-${field}${chapter === current ? ' is-here' : ''}`}>
        <ChapterHead chapter={chapter} tier={tier} />
        {chapter.items.length > 0 && (
          <ol className="chapter-events">
            {chapter.items.map(({ event: e, at }) => {
              const open = at === index;
              return (
                <li key={e.id} id={`step-${at}`} className={open ? 'ev is-open' : 'ev'} data-testid={open ? 'narration' : undefined}>
                  <div className="ev-row">
                    <span className="ev-when">{formatDate(e)}</span>
                    <button type="button" className="step-title" aria-expanded={open} onClick={() => pick(at)}>
                      {safeText(e.title, tier)}
                    </button>
                    <Badge compact target={eventTarget(e, tier)} />
                  </div>
                  {open && <StepDetail event={e} tier={tier} at={at} total={steps.length} actions={actionsFor(e)} />}
                </li>
              );
            })}
          </ol>
        )}
      </li>
    );
  };

  return (
    <main id="main" className="page page-follow chronicle">
      <aside className="now" aria-label="Where the story is now">
        <div className="meter-case">
          <Nixie value={line?.divergence ?? null} size="lg" />
          <span className="meter-plate" aria-hidden="true">
            Divergence now
          </span>
        </div>
        <div className="now-clock">
          <GearClock time={clock} label={event ? `Story clock: ${when}` : undefined} />
          <p>
            <small>Story time</small>
            {event ? when : 'Not yet revealed'}
          </p>
        </div>
        {line && current && (
          <p className="now-where">
            <small>Current world line</small>
            <strong>{lineLabel(line, tier)}</strong>
            {current.via && (
              <span>
                Reached by {JUMP_LABEL(current.via.how)} {two(current.via.no)}
              </span>
            )}
          </p>
        )}
        <nav className="route" aria-label="Route so far">
          <h2>Route so far</h2>
          <ol>
            {chapters.map((c, i) => {
              const l = shownLine(c.lineId, tier);
              const state = i < here ? 'is-past' : i === here ? 'is-here' : 'is-ahead';
              return (
                <li key={i} className={state}>
                  <button type="button" aria-current={i === here ? 'step' : undefined} onClick={() => pick(startOf(c))}>
                    <span className="route-value">{l ? (l.divergence ?? 'No value') : 'Hidden'}</span>
                    <span className="route-via">{c.via ? `${JUMP_LABEL(c.via.how)} ${two(c.via.no)}` : i === 0 ? 'Start' : ''}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <section className="log" aria-label="The chronicle">
        <div className="follow-head row">
          <h1>The chronicle</h1>
          <div className="segmented" role="group" aria-label="Story order">
            <button type="button" className="btn" aria-pressed={order === 'seq'} onClick={() => setOrder('seq')}>
              Okabe's order
            </button>
            <button type="button" className="btn" aria-pressed={order === 'calendar'} onClick={() => setOrder('calendar')}>
              Calendar order
            </button>
          </div>
        </div>
        <p className="lede">Each block is one world line. Each band between blocks is the jump that took Okabe to the next one</p>
        {kinds.length > 0 && (
          <ul className="jump-legend" aria-label="Kinds of jump">
            {kinds.map((kind) => (
              <li key={kind} className={`band-${kind}`}>
                {JUMP_LABEL(kind)}
              </li>
            ))}
          </ul>
        )}
        <ol className="blocks">
          {blocks.map((block, i) => (block.kind === 'band' ? renderBand(block) : renderChapter(block, i)))}
          {nextLocked && (
            <li id={`step-${steps.length}`} className={atWall ? 'wall is-open' : 'wall'} data-testid={atWall ? 'narration' : undefined}>
              {atWall ? (
                <TierWall nextTier={nextLocked} />
              ) : (
                <button type="button" className="step-title" onClick={() => pick(steps.length)}>
                  More of the story is locked at this spoiler level
                </button>
              )}
            </li>
          )}
        </ol>
      </section>

      <div className="sr-only" aria-live="polite">
        {text ? `${text.title}. ${text.summary}` : ''}
      </div>
      <GlassDock
        className="glass-dock-follow"
        label="Story player"
        playing={playing}
        canBack={index > 0}
        canNext={index < total - 1}
        pace={speed}
        onTogglePlay={() => setPlaying((p) => !p)}
        onBack={() => go(index - 1)}
        onNext={() => go(index + 1)}
        onStart={() => go(0)}
        onEnd={() => go(total - 1)}
        onPace={setSpeed}
      />
      <Blip token={blip} />
      {interlude && <Interlude id={interlude} onClose={() => setInterlude(null)} />}
      {reading && <DmailDialog event={reading} tier={tier} onClose={() => setReading(null)} />}
    </main>
  );
}
