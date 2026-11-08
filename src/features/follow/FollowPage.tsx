import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { href, navigate, useRoute } from '../../app/router';
import { readStore, writeStore } from '../../app/storage';
import { TIER_ORDER, useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { formatDate } from '../../components/format';
import { EDGE_STYLES } from '../../components/glyphs';
import { GlassDock } from '../../components/GlassDock';
import { MechIcon } from '../../components/MechIcon';
import { Nixie } from '../../components/Nixie';
import { useFocusTrap } from '../../components/useFocusTrap';
import { canon } from '../../data/load';
import type { StoryEvent, Tier, Transition } from '../../data/schema';
import { eventsBySeq, isVisible, lineLabel, mechanicById, tierRank, transitionById, transitionTier, visibleEvents, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { DmailDialog, isDmail } from '../dmail/DmailFile';
import { buildMapModel } from '../map/layout';
import { MapCanvas } from '../map/MapCanvas';
import { hoverForNode, useViewport } from '../map/MapPage';
import { eventTarget } from '../map/targets';
import { MechanicPlayer } from '../mechanics/MechanicPlayer';

// Guided mode offers the matching explainer at these four story beats. Ids only.
const INTERLUDES: Record<string, string> = {
  'ev-0728-first-dmail': 'dmail',
  'ev-0813-time-leap-loop': 'time_leap',
  'ev-08xx-titor-reveal': 'time_machine',
  'ev-0817-sern-deletion': 'attractor_field',
};

const STORY_SCALE = 1.5;

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

interface Stop {
  lineId: string;
  at: number;
  via?: Transition;
}

/** The world lines the story passes through, one stop each time it lands somewhere new. */
function trailStops(steps: StoryEvent[], tier: Tier): Stop[] {
  const stops: Stop[] = [];
  steps.forEach((step, at) => {
    const lineId = lineOf(step);
    const line = lineId ? worldLineById(lineId) : undefined;
    if (!lineId || !line || !isVisible(line, tier) || stops.at(-1)?.lineId === lineId) return;
    stops.push({ lineId, at, via: stops.length > 0 ? openTransition(step, tier) : undefined });
  });
  return stops;
}

/** Where Okabe has been, where he is now, and what is still ahead at this spoiler level. */
function Trail({ stops, index, tier, onPick }: { stops: Stop[]; index: number; tier: Tier; onPick: (at: number) => void }) {
  const here = stops.reduce((found, stop, i) => (stop.at <= index ? i : found), 0);
  const current = useRef<HTMLLIElement>(null);
  // Scrolls only the trail itself; scrollIntoView would drag the whole page sideways too.
  useEffect(() => {
    const item = current.current;
    const strip = item?.closest('.trail');
    if (item && strip) strip.scrollLeft = item.offsetLeft - (strip.clientWidth - item.offsetWidth) / 2;
  }, [here]);
  if (stops.length === 0) return null;
  return (
    <nav className="trail" aria-label="World lines so far">
      <ol>
        {stops.map((stop, i) => {
          const line = worldLineById(stop.lineId)!;
          const state = i < here ? 'is-past' : i === here ? 'is-here' : 'is-ahead';
          return (
            <li key={`${stop.lineId}-${stop.at}`} ref={i === here ? current : undefined} className={state}>
              {i > 0 && (
                <span className="trail-jump" title={stop.via ? EDGE_STYLES[stop.via.mechanism].label : undefined}>
                  {stop.via ? <MechIcon kind={stop.via.mechanism} size={14} /> : <span aria-hidden="true">→</span>}
                  <span className="sr-only">{stop.via ? `then by ${EDGE_STYLES[stop.via.mechanism].label}` : 'then'}</span>
                </span>
              )}
              <button type="button" className="trail-stop" aria-current={i === here ? 'step' : undefined} onClick={() => onPick(stop.at)}>
                <Nixie value={line.divergence} size="sm" label={line.divergence ?? 'Value unknown'} />
                <span className="trail-name">{lineLabel(line, tier)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The jump made at this step, said plainly, with the D-Mail behind it when there is one. */
function Jump({ event, transition, tier, onRead }: { event: StoryEvent; transition: Transition; tier: Tier; onRead: () => void }) {
  const from = worldLineById(transition.from);
  const to = worldLineById(transition.to);
  const shown = (l: typeof from) => (l && isVisible(l, tier) ? l : undefined);
  const [a, b] = [shown(from), shown(to)];
  const style = EDGE_STYLES[transition.mechanism];
  return (
    <div className="jump">
      <p className="jump-how">
        <MechIcon kind={transition.mechanism} size={16} /> World line jump by {style.label}
      </p>
      {a && b && (
        <p className="line-move">
          <Nixie value={a.divergence} size="sm" /> <span aria-hidden="true">→</span> <span className="sr-only">changes to</span> <Nixie value={b.divergence} size="sm" />
        </p>
      )}
      {isDmail(event) && (
        <button type="button" className="btn" onClick={onRead}>
          Read the D-Mail
        </button>
      )}
    </div>
  );
}

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

export function FollowPage() {
  const route = useRoute();
  const { tier, media, setFocusedLine } = useSettings();
  const { w, h } = useViewport();
  const [order, setOrder] = useState<EventOrder>('seq');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [interlude, setInterlude] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(1000);
  const mobile = w < 768;

  const steps = useMemo(() => visibleEvents(tier, media, order), [tier, media, order]);
  const stops = useMemo(() => trailStops(steps, tier), [steps, tier]);
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

  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setHostWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  const model = useMemo(() => buildMapModel(tier, media, order, Math.max(240, h - 560), STORY_SCALE), [tier, media, order, h]);
  const node = event ? model.nodes.find((n) => n.id === event.id) : undefined;
  const edge = event?.transitionId ? model.edges.find((e) => e.id === event.transitionId) : undefined;
  const pan = node ? hostWidth / 2 - model.gutter - node.x : 0;

  useEffect(() => {
    const line = event ? lineOf(event) : null;
    const wl = line ? worldLineById(line) : undefined;
    setFocusedLine(wl && isVisible(wl, tier) ? wl.id : null);
    return () => setFocusedLine(null);
  }, [event, tier, setFocusedLine]);

  const text = event ? narration(event, tier) : null;
  const words = text ? `${text.title} ${text.summary} ${text.changed} ${text.reveals.join(' ')}`.split(/\s+/).length : 0;
  const jump = openTransition(event, tier);

  useEffect(() => {
    if (!playing || interlude || reading) return;
    if (atWall || index >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => go(index + 1), dwellMs(words, speed));
    return () => window.clearTimeout(timer);
  }, [playing, interlude, reading, atWall, index, total, words, speed, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (interlude || reading) return;
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
  }, [go, index, total, interlude, reading]);

  // Pointing at a point names it; clicking it takes the story there.
  const [pointed, setPointed] = useState<{ id: string; x: number; y: number } | null>(null);
  const pointAt = useCallback((id: string | null, x: number, y: number) => setPointed(id ? { id, x, y } : null), []);
  const pickStep = useCallback(
    (at: number) => {
      setPlaying(false);
      setPointed(null);
      go(at);
    },
    [go],
  );
  const pointedText = pointed ? hoverForNode(pointed.id, tier) : null;

  const mechanicId = event ? INTERLUDES[event.id] : undefined;
  const mechanic = mechanicId ? mechanicById(mechanicId) : undefined;
  const offerInterlude = mechanic && isVisible(mechanic, tier);

  return (
    <main id="main" className="page page-follow">
      <div className="follow-head row">
        <h1>Follow the story</h1>
        <div className="segmented" role="group" aria-label="Story order">
          <button type="button" className="btn" aria-pressed={order === 'seq'} onClick={() => setOrder('seq')}>
            Okabe's order
          </button>
          <button type="button" className="btn" aria-pressed={order === 'calendar'} onClick={() => setOrder('calendar')}>
            Calendar order
          </button>
        </div>
      </div>
      <Trail stops={stops} index={index} tier={tier} onPick={pickStep} />
      <div className="follow-map" ref={host} aria-hidden="true" hidden={mobile}>
        {!mobile && (
          <MapCanvas
            model={model}
            tier={tier}
            panX={pan}
            viewportWidth={hostWidth}
            orderedIds={steps.map((s) => s.id)}
            focusId={null}
            selectedId={event?.id ?? null}
            duration={0.7}
            spotlightId={event?.id ?? null}
            spotlightEdgeId={edge?.id ?? null}
            interactive={false}
            onActivateNode={(id) => {
              const at = steps.findIndex((s) => s.id === id);
              if (at >= 0) pickStep(at);
            }}
            onActivateEdge={() => undefined}
            onFocusNode={() => undefined}
            onHoverNode={pointAt}
            onHoverEdge={() => undefined}
            onKeyDown={() => undefined}
            onPan={() => undefined}
            onZoomWheel={() => undefined}
            onSgInfo={() => undefined}
          />
        )}
      </div>
      <section className="follow-card" aria-label="Narration">
        <div aria-live="polite" data-testid="narration">
          {event && text ? (
            <>
              <p className="follow-count mono">
                Step {index + 1} of {steps.length}
              </p>
              <h2>{text.title}</h2>
              <p className="detail-meta">{formatDate(event)}</p>
              <p>{text.summary}</p>
              {text.changed && <p className="follow-changed">{text.changed}</p>}
              {text.reveals.map((r, i) => (
                <p key={i} className="follow-reveal">
                  Later you learn: {r}
                </p>
              ))}
            </>
          ) : (
            nextLocked && <TierWall nextTier={nextLocked} />
          )}
        </div>
        {event && jump && <Jump event={event} transition={jump} tier={tier} onRead={() => setReading(true)} />}
        {event && (
          <div className="row">
            <Badge target={eventTarget(event, tier)} />
            {offerInterlude && (
              <button type="button" className="btn" onClick={() => setInterlude(mechanicId!)}>
                Watch how this works
              </button>
            )}
            <a className="btn btn-quiet" href={href('map', { ev: event.id })}>
              Open in map
            </a>
          </div>
        )}
      </section>
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
      {pointedText && pointed && (
        <div className="hover-card" role="presentation" style={{ left: Math.min(pointed.x + 14, w - 320), top: Math.min(pointed.y + 14, h - 170) }}>
          <strong>{pointedText.title}</strong>
          {pointedText.date && <span className="detail-meta">{pointedText.date}</span>}
          {pointedText.badge && <span className="pill">{pointedText.badge}</span>}
        </div>
      )}
      {interlude && <Interlude id={interlude} onClose={() => setInterlude(null)} />}
      {reading && event && <DmailDialog event={event} tier={tier} onClose={() => setReading(false)} />}
    </main>
  );
}
