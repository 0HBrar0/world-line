import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { href, navigate, useRoute } from '../../app/router';
import { readStore, writeStore } from '../../app/storage';
import { TIER_ORDER, useReduceMotion, useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { formatDate } from '../../components/format';
import { Nixie } from '../../components/Nixie';
import { useFocusTrap } from '../../components/useFocusTrap';
import { canon } from '../../data/load';
import type { StoryEvent, Tier } from '../../data/schema';
import { eventsBySeq, isVisible, mechanicById, tierRank, visibleEvents, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { buildMapModel } from '../map/layout';
import { MapCanvas } from '../map/MapCanvas';
import { useViewport } from '../map/MapPage';
import { eventTarget } from '../map/targets';
import { MechanicPlayer } from '../mechanics/MechanicPlayer';
import { GlassDock } from '../../components/GlassDock';
import { spaceStops, supportsWebGL } from './spaceStops';

const SpaceFlight = lazy(() => import('./SpaceFlight'));

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

function LineChange({ event, tier }: { event: StoryEvent; tier: Tier }) {
  const line = (id: string | null) => {
    const l = id ? worldLineById(id) : undefined;
    return l && isVisible(l, tier) ? l : undefined;
  };
  const from = line(event.worldLineBefore);
  const to = line(event.worldLineAfter);
  if (!from && !to) return null;
  return (
    <p className="line-move">
      {from && <Nixie value={from.divergence} size="sm" />}
      {from && to && from.id !== to.id && (
        <>
          <span aria-hidden="true">→</span>
          <Nixie value={to.divergence} size="sm" />
        </>
      )}
    </p>
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
      <h2>🔒 End of this spoiler level</h2>
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
  const host = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(1000);
  const [view, setView] = useState<'entity' | 'flight' | 'chart'>('entity');
  const reduce = useReduceMotion();
  const canFly = useMemo(() => !reduce && supportsWebGL(), [reduce]);
  const space = canFly && view !== 'chart';
  const mobile = w < 768;

  const steps = useMemo(() => visibleEvents(tier, media, order), [tier, media, order]);
  const stops = useMemo(() => spaceStops(steps, tier), [steps, tier]);
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

  const model = useMemo(() => buildMapModel(tier, media, order, Math.max(240, h - 520), STORY_SCALE), [tier, media, order, h]);
  const node = event ? model.nodes.find((n) => n.id === event.id) : undefined;
  const edge = event?.transitionId ? model.edges.find((e) => e.id === event.transitionId) : undefined;
  const pan = node ? hostWidth / 2 - model.gutter - node.x : 0;

  useEffect(() => {
    const line = event ? (event.worldLineAfter ?? event.worldLineBefore) : null;
    const wl = line ? worldLineById(line) : undefined;
    setFocusedLine(wl && isVisible(wl, tier) ? wl.id : null);
    return () => setFocusedLine(null);
  }, [event, tier, setFocusedLine]);

  const readoutLine = event ? worldLineById(event.worldLineAfter ?? event.worldLineBefore ?? '') : undefined;
  const readout = readoutLine && isVisible(readoutLine, tier) ? readoutLine.divergence : null;

  const text = event ? narration(event, tier) : null;
  const words = text ? `${text.title} ${text.summary} ${text.changed} ${text.reveals.join(' ')}`.split(/\s+/).length : 0;

  useEffect(() => {
    if (!playing || interlude) return;
    if (atWall || index >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => go(index + 1), dwellMs(words, speed));
    return () => window.clearTimeout(timer);
  }, [playing, interlude, atWall, index, total, words, speed, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (interlude) return;
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
  }, [go, index, total, interlude]);

  const mechanicId = event ? INTERLUDES[event.id] : undefined;
  const mechanic = mechanicId ? mechanicById(mechanicId) : undefined;
  const offerInterlude = mechanic && isVisible(mechanic, tier);

  return (
    <main id="main" className={space ? 'page page-follow is-space' : 'page page-follow'}>
      {space && (
        <div className="space-stage" aria-hidden="true">
          <Suspense fallback={null}>
            <SpaceFlight key={view} view={view === 'flight' ? 'flight' : 'entity'} stops={stops} index={Math.min(index, Math.max(stops.length - 1, 0))} />
          </Suspense>
          {view === 'entity' && <div className="entity-eyes" />}
        </div>
      )}
      {space && (
        <div className="space-meter">
          <Nixie value={readout} size="lg" />
        </div>
      )}
      <div className="follow-head row">
        <h1>Follow the story</h1>
        {canFly && (
          <div className="segmented" role="group" aria-label="View">
            <button type="button" className="btn" aria-pressed={view === 'entity'} onClick={() => setView('entity')}>
              Observer
            </button>
            <button type="button" className="btn" aria-pressed={view === 'flight'} onClick={() => setView('flight')}>
              Flight
            </button>
            {!mobile && (
              <button type="button" className="btn" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
                Chart
              </button>
            )}
          </div>
        )}
        <div className="segmented" role="group" aria-label="Story order">
          <button type="button" className="btn" aria-pressed={order === 'seq'} onClick={() => setOrder('seq')}>
            Okabe's order
          </button>
          <button type="button" className="btn" aria-pressed={order === 'calendar'} onClick={() => setOrder('calendar')}>
            Calendar order
          </button>
        </div>
      </div>
      <div className="follow-map" ref={host} aria-hidden="true" hidden={mobile || space}>
        {!mobile && !space && (
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
            onActivateNode={() => undefined}
            onActivateEdge={() => undefined}
            onFocusNode={() => undefined}
            onHoverNode={() => undefined}
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
                {String(index + 1).padStart(2, '0')}/{String(steps.length).padStart(2, '0')}
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
        {event && (
          <div className="row">
            <Badge target={eventTarget(event, tier)} />
            <LineChange event={event} tier={tier} />
            {offerInterlude && (
              <button type="button" className="btn" onClick={() => setInterlude(mechanicId!)}>
                ▶ Watch how this works
              </button>
            )}
          </div>
        )}
        <a className="btn btn-quiet follow-open" href={event ? href('map', { ev: event.id }) : href('map')}>
          Open in map
        </a>
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
      {interlude && <Interlude id={interlude} onClose={() => setInterlude(null)} />}
    </main>
  );
}
